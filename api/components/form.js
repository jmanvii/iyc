//
//
// FORM/SURVEY & DATA SUBMISSION API
//
//

module.exports = function (APP) {
    'use strict';

    APP.FORM = {};



    //
    // Select an active form object.
    //
    // API params:
    //    lang (string) - two letter ISO language code.
    //
    // Possible errors:
    //     invalid-parameters
    //     server-error
    //
    APP.FORM.getForm = function (params, callback) {
        if (!APP.LANG.validLanguageParam(params.lang)) {
            return callback(APP.ERROR.INVALID_PARAMETERS);
        }
        APP.lib.db.queryOne(APP.SQL.selectForm, [params.lang], function (err, form) {
            if (err) { 
                return APP.serverError('APP.FORM.getForm()', err, callback); 
            }
            callback(null, form);
        });
    };



    //
    // Select an active form object with all its items.
    //
    // API params:
    //     lang (string) - two letter ISO language code.
    //
    // Possible errors:
    //     invalid-parameters
    //     server-error
    //
    APP.FORM.getFormHierarchy = function (params, callback) {
        if (!APP.LANG.validLanguageParam(params.lang)) {
            return callback(APP.ERROR.INVALID_PARAMETERS);
        }
        APP.lib.db.queryOne(APP.SQL.selectForm, [params.lang], function (err, form) {
            if (err)   { return APP.serverError('APP.FORM.getFormHierarchy() > selectForm', err, callback); }
            if (!form) { return callback(null, {}); }

            var qValues = [params.lang, form.id, null];

            APP.lib.db.query([
                [APP.SQL.selectFormSections, qValues],
                [APP.SQL.selectFormItems, [params.lang, form.id, null, null]],
                [APP.SQL.selectFormItemsOptions, qValues]
            ], function (err, sections, items, options) {
                if (err) { 
                    return APP.serverError('APP.FORM.getFormHierarchy()', err, callback); 
                }

                form = buildFormHierarchy(form, sections, items, options);

                if (form.sections.length === 1) {
                    form.items = form.sections[0].items;
                    delete form.sections;
                }

                callback(null, form);
            });
        });
    };



    //
    // Put a form, its sections, its items and all item's options 
    // to a single hierarchical object.
    //
    function buildFormHierarchy(form, sections, items, options) {
        var i, j, k;

        form.sections = [];

        for (i = 0; i < sections.length; i += 1) {
            sections[i].items = [];

            for (j = 0; j < items.length; j += 1) {
                if (items[j].section_id === sections[i].id) {
                    items[j].options = [];

                    for (k = 0; k < options.length; k += 1) {
                        if (options[k].item_id === items[j].id) {
                            items[j].options.push(options[k]);
                        }
                    }

                    sections[i].items.push(items[j]);
                }
            }

            sections[i].items = nestItems(sections[i].items, 0);
            form.sections.push(sections[i]);
        }

        return form;
    }



    //
    // Nest items recursively using their `parent_id` property.
    //
    function nestItems(items, parentId) {
        var tree = [];
        var i, children;

        for (i = 0; i < items.length; i += 1) {
            if (parseInt(items[i].parent_id, 10) === parentId) {
                children = nestItems(items, parseInt(items[i].id, 10));

                if (children.length) {
                    items[i].items = children;
                }

                tree.push(items[i]);
            }
        }

        return tree;
    }



    //
    // Select main categorization item from an active form.
    //
    // API params:
    //     lang (string) - two letter ISO language code.
    //
    // Possible errors:
    //     invalid-parameters
    //     server-error
    //
    APP.FORM.getFormCategorizationItem = function (params, callback) {
        if (!APP.LANG.validLanguageParam(params.lang)) {
            return callback(APP.ERROR.INVALID_PARAMETERS);
        }
        APP.FORM.getForm(params, function (err, form) {
            if (err || !form || Object.keys(form).length === 0) {
                return callback(null, {});
            }
            APP.lib.db.queryOne(APP.SQL.selectFormItems, [params.lang, form.id, null, true], function (err, item) {
                if (err) { 
                    return APP.serverError('APP.FORM.getFormCategorizationItem() > selectFormItems', err, callback); 
                }
                APP.lib.db.query(APP.SQL.selectFormItemsOptions, [params.lang, form.id, item.id], function (err, options) {
                    if (err) { 
                        return APP.serverError('APP.FORM.getFormCategorizationItem() > selectFormItemsOptions', err, callback); 
                    }
                    item.options = options;
                    callback(null, item);
                });
            });
        });
    };



    //
    // Select all responses on an active form.
    //
    // API params:
    //     lang (string) - two letter ISO language code.
    //     from (date string) [optional] - date in YYYY-MM-DD format.
    //     to   (date string) [optional] - date in YYYY-MM-DD format.
    //
    // Possible errors:
    //     invalid-parameters
    //     server-error 
    //
    APP.FORM.getResponses = function (params, callback) {
        if (!APP.LANG.validLanguageParam(params.lang)) {
            return callback(APP.ERROR.INVALID_PARAMETERS);
        }

        if (params.from && params.to) {
            if (!APP.CONFIG.DATE_FORMAT_REGEX.test(params.from) || !APP.CONFIG.DATE_FORMAT_REGEX.test(params.to)) {
                return callback(APP.ERROR.INVALID_PARAMETERS);
            }
        }

        function onResult(user, filter) {
            return function (err, responses) {
                if (err) { return APP.serverError('APP.FORM.getResponses()', err, callback); }

                if (APP.util.isFunction(filter)) {
                    responses = filter(responses);
                }

                // Filter responses.
                var i, j, item, r = [];

                // Specific option.
                if (params.item_id && params.option_id) {
                    for (i = 0; i < responses.length; i += 1) {
                        if (!APP.util.findObject(responses[i].items, { item_id: params.item_id, option_id: params.option_id })) {
                            continue;
                        }
                        r.push(responses[i]);
                    }

                    responses = r;
                }

                // Specific council.
                if (user && user.permission == APP.PERMISSION.COUNCIL) {
                    r = [];

                    for (i = 0; i < responses.length; i += 1) {
                        if (responses[i].status_id != 1) {
                            continue;
                        }
                        for (j = 0; j < responses[i].items.length; j += 1) {
                            item = responses[i].items[j];

                            if (item.item_settings.linked_to_council && item.option_settings.linked_council_id == user.id) {
                                r.push(responses[i]);
                            }
                        }
                    }

                    responses = r;
                }

                callback(null, responses);
            };
        }

        APP.FORM.getForm(params, function (err, form) {
            if (err || !form || Object.keys(form).length === 0) {
                return callback(null, []);
            }

            APP.AUTH.validUserPermission(params, APP.PERMISSION.COUNCIL, function (err, user) {
                var qValues;

                if (!err && user) {
                    qValues = [params.lang, form.id, params.from, params.to, params.status || null, null];
                    APP.lib.db.query(APP.SQL.selectFormResponses, qValues, onResult(user));
                } else {
                    qValues = [params.lang, form.id, params.from, params.to, APP.STATUS.ACTIVE, null];
                    APP.lib.db.query(APP.SQL.selectFormResponses, qValues, onResult(null, filterPublicResponses));
                }
            });
        });
    };



    //
    // Select a single response object with all its items.
    //
    // API params:
    //     lang (string) - two letter ISO language code.
    //     id (integer) - id of a single response.
    //
    // Possible errors:
    //     invalid-parameters
    //     server-error 
    //
    APP.FORM.getResponse = function (params, callback) {
        if (!APP.LANG.validLanguageParam(params.lang)) {
            return callback(APP.ERROR.INVALID_PARAMETERS);
        }

        params.id = parseInt(params.id, 10);

        if (!params.id) {
            return callback(APP.ERROR.INVALID_PARAMETERS);
        }

        function onResult(filter) {
            return function (err, responses) {
                if (err) { return APP.serverError('getFormResponse()', err, callback); }

                if (APP.util.isFunction(filter)) {
                    responses = filter(responses);
                }

                callback(null, responses && responses.length ? responses[0] : responses);
            };
        }

        APP.FORM.getForm(params, function (err, form) {
            if (err || !form) { return callback(null, {}); }

            APP.AUTH.validUserPermission(params, APP.PERMISSION.ADMINISTRATOR, function (err, user) {
                var qValues;

                if (user) {
                    qValues = [params.lang, form.id, null, null, params.status || null, params.id];
                    APP.lib.db.query(APP.SQL.selectFormResponses, qValues, onResult());
                } else {
                    qValues = [params.lang, form.id, null, null, APP.STATUS.ACTIVE, params.id];
                    APP.lib.db.query(APP.SQL.selectFormResponses, qValues, onResult(filterPublicResponses));
                }
            });
        });
    };



    //
    // Create a new response.
    //
    // TODO: Refactor & Document
    //
    APP.FORM.createResponse = function (params, callback) {
        if (!APP.LANG.validLanguageParam(params.lang) || !Array.isArray(params.items) || !params.items.length) {
            return callback(APP.ERROR.INVALID_PARAMETERS);
        }

        params.form_id = parseInt(params.form_id, 10);

        if (!params.form_id) {
            return callback(APP.ERROR.INVALID_PARAMETERS);
        }

        var receivedResponseItemsCount = params.items.length;
        var savedResponseItemsCount = 0;

        APP.lib.db.query(APP.SQL.selectFormItems, [null, params.form_id, null, null], function (err, formItems) {
            if (err) { 
                return APP.serverError('createFormResponse() > SQL.selectFormItems', err, callback); 
            }

            var fields = {
                form_id: params.form_id
            };

            var dateTimeValue = responseFindDateTimeItemValue(formItems, params.items);
            if (dateTimeValue) {
                fields.datetime = dateTimeValue;
            }

            APP.lib.db.beginTransaction(function (transaction) {
                transaction.query({
                    table: 'form_responses',
                    fields: fields,
                    returnValue: 'id'
                }, function (err, row) {
                    if (err) { 
                        transaction.rollback(); 
                        return APP.serverError('createFormResponse() > createResponse()', err, callback);
                    }
                    params.items.forEach(function (rItem) {
                        var formItem = APP.util.findObject(formItems, { id: rItem.item_id });
                        createResponseItem(transaction, row.id, formItem, rItem);
                    });
                });
            });
        });

        function finished(transaction, responseId) {
            if (savedResponseItemsCount === receivedResponseItemsCount) {
                transaction.commit();
                APP.FORM.getResponse({ id: responseId, lang: params.lang }, callback);
                return true;
            }
        }

        function createResponseItem(transaction, responseId, formItem, responseItem) {
            var fields = {
                response_id: responseId,
                form_id: params.form_id,
                item_id: formItem.id,
                option_id: null,
                value: null
            };

            if (formItem.type === 'scale' || formItem.type === 'choice' || formItem.type === 'location-choice') {
                if (responseItem.option_id) {
                    fields.option_id = responseItem.option_id;
                } else {
                    savedResponseItemsCount += 1;
                    return finished(transaction, responseId);
                }
            } else if (formItem.type === 'location-search' || formItem.type === 'datetime' || formItem.type === 'number' || formItem.type === 'text' || formItem.type === 'image') {
                if (responseItem.value) {
                    fields.value = responseItem.value;
                } else {
                    savedResponseItemsCount += 1;
                    return finished(transaction, responseId);
                }
            }

            transaction.query({
                table: 'form_response_items',
                fields: fields
            }, function (err) {
                if (err) { 
                    transaction.rollback(); 
                    return APP.serverError('createFormResponse() > createResponseItem()', err, callback);
                }
                savedResponseItemsCount += 1;
                return finished(transaction, responseId);
            });
        }
    };



    //
    // Update a response.
    //
    // TODO: Document
    //
    APP.FORM.updateResponse = function (params, callback) {
        params.form_id     = parseInt(params.form_id, 10);
        params.response_id = parseInt(params.response_id, 10);

        if (
            !APP.LANG.validLanguageParam(params.lang) || 
            !Array.isArray(params.items) || 
            !params.items.length || 
            !params.form_id || 
            !params.response_id            
        ) {
            return callback(APP.ERROR.INVALID_PARAMETERS);
        }

        APP.lib.db.query(APP.SQL.selectFormItems, [null, params.form_id, null, null], function (err, formItems) {
            if (err) { 
                return APP.serverError('updateResponse() > SQL.selectFormItems', err, callback); 
            }

            params.items = cleanupAndConnectResponseItemsWithFormItems(params.items, formItems, true);

            if (!params.items.length) {
                return callback(APP.ERROR.INVALID_PARAMETERS);
            }

            var queries = [];

            queries.push({
                table: 'form_responses',
                fields: { updated_at: new Date() },
                where: { id: params.response_id }
            });

            params.items.forEach(function (rItem) {
                var fields = {};

                if (!rItem.response_item_id) {
                    fields = {
                        response_id: params.response_id,
                        form_id: params.form_id,
                        item_id: rItem._formItem.id,
                        option_id: null,
                        value: null
                    };
                }

                if (isItemWithOptionId(rItem._formItem.type)) {
                    fields.option_id = rItem.option_id;
                } else if (isItemWithRawValue(rItem._formItem.type)) {
                    fields.value = rItem.value;
                } else {
                    return;
                }

                var query = {
                    table: 'form_response_items',
                    fields: fields
                };

                if (rItem.response_item_id) {
                    query.where = { id: rItem.response_item_id };
                }

                queries.push(query);
            });

            APP.lib.db.beginTransaction(function (transaction) {
                transaction.query(queries, function (err) {
                    if (err) { 
                        transaction.rollback(); 
                        return APP.serverError('updateResponse()', err, callback);
                    }
                    transaction.commit();
                    APP.FORM.getResponse({ 
                        id: params.response_id, 
                        lang: params.lang, 
                        session_token: params.session_token 
                    }, callback);
                });
            });
        });
    };



    //
    // Remove all malformatted responses.
    //
    function cleanupAndConnectResponseItemsWithFormItems(rItems, formItems, duringUpdate) {
        var responseItems = [];

        if (!Array.isArray(rItems) || !rItems.length || !Array.isArray(formItems) || !formItems.length) {
            return responseItems;
        }

        rItems.forEach(function (rItem) {
            // if (duringUpdate && !rItem.response_item_id) {
            //     return;
            // }

            if (!APP.util.isObject(rItem) || !rItem.item_id) { 
                return; 
            }

            var formItem = APP.util.findObject(formItems, { id: rItem.item_id });
            
            if (!APP.util.isObject(formItem) || !formItem.type) { 
                return; 
            }

            rItem._formItem = formItem;

            if (isItemWithOptionId(formItem.type) && rItem.option_id) {
                responseItems.push(rItem);
            } else if (isItemWithRawValue(formItem.type) && rItem.value !== undefined) {
                responseItems.push(rItem);
            }
        });

        return responseItems;
    }



    //
    // Check if item is a type that receives option_id as a response.
    //
    function isItemWithOptionId(itemType) {
        return itemType === 'scale'  || 
               itemType === 'choice' || 
               itemType === 'location-choice';
    }



    //
    // Check if item is a type that receives raw value as a response.
    //
    function isItemWithRawValue(itemType) {
        return itemType === 'datetime' || 
               itemType === 'number'   || 
               itemType === 'text'     || 
               itemType === 'image'    || 
               itemType === 'location-search';
    }



    //
    // Find a date item inside the response.
    //
    // TODO: Refactor
    //
    function responseFindDateTimeItemValue(formItems, responseItems) {
        var dateTimeFormItem = APP.util.findObject(formItems, { type: 'datetime' });
        var dateTimeResponseItem;

        if (dateTimeFormItem) {
            dateTimeResponseItem = APP.util.findObject(responseItems, { item_id: dateTimeFormItem.id });

            if (dateTimeResponseItem) {
                return dateTimeResponseItem.value;
            }
        }
        
        return null;
    }



    //
    // Change status of a response to active.
    //
    // TODO: Move html to an email template file.
    //
    // API params:  
    //     id (integer) - id of a response.
    //
    // Possible errors:
    //     invalid-parameters
    //     invalid-permission
    //     server-error
    //
    APP.FORM.approveResponse = function (params, callback) {
        params.status = APP.STATUS.ACTIVE;
        updateFormResponseStatus(params, function (err, data) {
            if (err) {
                return callback(err, data);
            }
            callback(null, data);
            APP.lib.db.queryOne(APP.SQL.selectCouncilEmail, [params.id], function (err, row) {
                if (row && row.email) {
                    APP.FORM.getResponse({ lang: params.lang || 'en', id: params.id }, function (err, formResponse) {
                        var content = '';

                        if (formResponse && formResponse.items) {
                            formResponse.items.forEach(function (item) {
                                content += '<p style="margin;bottom:5px;font-weight:bold"><b>' + item.item_label + '</b></p>';
                                content += '<p style="margin-bottom:20px;">';
                                if (item.item_type == 'image') {
                                    content += '<img style="max-width:500px;" src="https://example.org/files/' + item.value + '" />';
                                } else if (item.item_type == 'location-search') {
                                    try { item.value = JSON.parse(item.value); } catch (e) { item.value = {} }
                                    content += '<span>' + item.value.name + '</span><br />';
                                    content += '<a href="https://maps.google.com/maps?q=loc:' + item.value.lat + ',' + item.value.lng + '&z=15" target="_blank">See on Google Maps</a>';
                                } else {
                                    content += (item.option_label || item.value || '<i>' + APP.LANG.text('no-response') + '</i>');
                                }
                                content +=  '</p>';
                            });
                            var html = APP.util.compileHTMLTemplate(APP.EMAIL_TEMPLATE.notifyCouncil, { 
                                content: content
                            });
                            APP.util.sendEmail(row.email, 'New Report Received', html);
                        }
                    });
                }
            });
        });
    };



    //
    // Change status of a response to deleted.
    //
    // API params:  
    //     id (integer) - id of a response.
    //
    // Possible errors:
    //     invalid-parameters
    //     invalid-permission
    //     server-error
    //
    APP.FORM.deleteResponse = function (params, callback) {
        params.status = APP.STATUS.DELETED;
        updateFormResponseStatus(params, callback);
    };



    //
    // Update response status.
    //
    function updateFormResponseStatus(params, callback) {
        params.id     = parseInt(params.id, 10);
        params.status = parseInt(params.status, 10);

        if (!params.id || !params.status) {
            return callback(APP.ERROR.INVALID_PARAMETERS);
        }

        APP.AUTH.validUserPermission(params, APP.PERMISSION.ADMINISTRATOR, function (err, user) {
            if (err || !user) { return callback(APP.ERROR.INVALID_PERMISSION); }

            APP.lib.db.queryUpdate({
                table: 'form_responses',
                fields: {
                    status: params.status
                },
                where: {
                    id: params.id
                }
            }, function (err) {
                if (err) { return APP.serverError('updateFormResponseStatus()', err, callback); }

                APP.lib.db.queryOne(APP.SQL.selectStatusName, params.status, function (err, status) {
                    if (err) { return APP.serverError('SQL.selectStatusName', err, callback); }
                    callback(null, { id: params.id, status: status.name });
                });
            });
        });
    }



    //
    // Change status of a response to complete.
    //
    // API params:  
    //     id (integer) - id of a response.
    //
    // Possible errors:
    //     invalid-parameters
    //     invalid-permission
    //     server-error
    //
    APP.FORM.completeResponse = function (params, callback) {
        params.action_status = APP.ACTION_STATUS.COMPLETED;
        updateFormResponseActionStatus(params, function (err, data) {
            if (err) {
                return callback(err, data);
            }
            callback(null, data);
            APP.lib.db.queryOne(APP.SQL.selectSubmitterEmail, [params.id], function (err, row) {
                if (row && row.email) {
                    var html = APP.util.compileHTMLTemplate(APP.EMAIL_TEMPLATE.completed, { 
                        content: ''
                    });
                    APP.util.sendEmail(row.email, 'Council responded on your report.', html);
                }
            });
        });
    };



    //
    // Change status of a response to declined.
    //
    // API params:  
    //     id (integer) - id of a response.
    //
    // Possible errors:
    //     invalid-parameters
    //     invalid-permission
    //     server-error
    //
    APP.FORM.declineResponse = function (params, callback) {
        params.action_status = APP.ACTION_STATUS.DECLINED;
        updateFormResponseActionStatus(params, function (err, data) {
            if (err) {
                return callback(err, data);
            }
            callback(null, data);
            APP.lib.db.queryOne(APP.SQL.selectSubmitterEmail, [params.id], function (err, row) {
                if (row && row.email) {
                    var html = APP.util.compileHTMLTemplate(APP.EMAIL_TEMPLATE.declined, { 
                        content: ''
                    });
                    APP.util.sendEmail(row.email, 'Council responded on your report.', html);
                }
            });
        });
    };



    //
    // Update response action status.
    //
    function updateFormResponseActionStatus(params, callback) {
        params.id            = parseInt(params.id, 10);
        params.action_status = parseInt(params.action_status, 10);

        if (!params.id || params.action_status == undefined) {
            return callback(APP.ERROR.INVALID_PARAMETERS);
        }

        APP.AUTH.validUserPermission(params, APP.PERMISSION.COUNCIL, function (err, user) {
            if (err || !user) { return callback(APP.ERROR.INVALID_PERMISSION); }

            // TODO: Check if council is updating their report and not other councils.

            APP.lib.db.queryUpdate({
                table: 'form_responses',
                fields: {
                    action_status: params.action_status,
                    council_uploaded_image: params.council_uploaded_image,
                    council_message: params.council_message
                },
                where: {
                    id: params.id
                }
            }, function (err) {
                if (err) { 
                    return APP.serverError('updateFormResponseActionStatus()', err, callback); 
                }
                callback(null, {});
            });
        });
    }



    //
    // Select form translations.
    //
    // API params:
    //     This API endpoint doesn't take any parameters.
    //
    // Possible errors:
    //     invalid-permission
    //     server-error 
    //
    APP.FORM.getFormTranslations = function (params, callback) {
        APP.AUTH.validUserPermission(params, APP.PERMISSION.ADMINISTRATOR, function (err, user) {
            if (err || !user) { return callback(APP.ERROR.INVALID_PERMISSION); }

            APP.lib.db.queryOne(APP.SQL.selectForm, [params.lang], function (err, form) {
                if (err)   { return APP.serverError('getFormTranslations() > SQL.selectForm', err, callback); }
                if (!form) { return callback(null, {}); }

                APP.lib.db.query([
                    [APP.SQL.selectAllFormItemsTranslations, form.id],
                    [APP.SQL.selectAllFormItemsOptionsTranslations, form.id]
                ], function (err, itemsTranslations, optionsTranslations) {
                    if (err) { return APP.serverError('getFormTranslations() > query', err, callback); }
                    
                    var i, j;

                    for (i = 0; i < optionsTranslations.length; i += 1) {
                        for (j = 0; j < itemsTranslations.length; j += 1) {
                            if (optionsTranslations[i].item_id === itemsTranslations[j].item_id) {
                                if (!Array.isArray(itemsTranslations[j].options)) {
                                    itemsTranslations[j].options = [];
                                }
                                itemsTranslations[j].options.push(optionsTranslations[i]);
                            }
                        }
                    }

                    callback(null, itemsTranslations);
                });
            });
        });
    };



    //
    // Update form items and options translations.
    //
    // API params:
    //     item_translations (array) - list of translations to update.
    //         format: [{ "item_id": 1, "lang": "en", "label": "lorem ipsum..." }, ...]
    //
    //     option_translations (array) - list of translations to update.
    //         format: [{ "option_id": 1, "lang": "en", "label": "lorem ipsum..." }, ...]
    //
    // Possible errors:
    //     invalid-permission
    //     server-error 
    //
    APP.FORM.updateFormTranslations = function (params, callback) {
        APP.AUTH.validUserPermission(params, APP.PERMISSION.ADMINISTRATOR, function (err, user) {
            if (err || !user) { return callback(APP.ERROR.INVALID_PERMISSION); }

            if (!Array.isArray(params.item_translations) || !Array.isArray(params.option_translations)) {
                return callback(APP.ERROR.INVALID_PARAMETERS);
            }
            
            var tQueries = [];

            params.item_translations.forEach(function (it) {
                it.item_id = parseInt(it.item_id, 10);

                if (it.item_id && APP.LANG.validLanguageParam(it.lang) && it.label) {
                    tQueries.push([APP.SQL.updateFormItemTranslation, it.item_id, it.lang, it.label]);
                }
            });

            params.option_translations.forEach(function (ot) {
                ot.option_id = parseInt(ot.option_id, 10);

                if (ot.option_id && APP.LANG.validLanguageParam(ot.lang) && ot.label) {
                    tQueries.push([APP.SQL.updateFormItemOptionTranslation, ot.option_id, ot.lang, ot.label]);
                }
            });

            if (tQueries.length) {
                APP.lib.db.beginTransaction(function (transaction) {
                    transaction.query(tQueries, function (err) {
                        if (err) { 
                            transaction.rollback(); 
                            return APP.serverError('updateFormTranslations()', err, callback);
                        }
                        transaction.commit();
                        callback(null, params);
                    });
                });
            } else {
                return callback(null, params);
            }
        });
    };



    //
    // Remove "hidden_from_public" items.
    //
    function filterPublicResponses(responses) {
        var i, j;

        if (Array.isArray(responses)) {
            for (i = 0; i < responses.length; i += 1) {
                j = responses[i].items.length;

                while (j -= 1) {
                    if (responses[i].items[j].item_settings.hidden_from_public) {
                        responses[i].items.splice(j, 1);
                    }
                }
            }
        }

        return responses;
    }
    function filterPublicItems(items) {
        var i, filteredItems = [];

        if (Array.isArray(items)) {
            for (i = 0; i < items.length; i += 1) {
                if (!items[i].settings.hidden_from_public) {
                    filteredItems.push(items[i]);
                }
            }
        }

        return filteredItems;
    }


};
