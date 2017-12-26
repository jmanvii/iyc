//
//
// REPORTS (MAP & CHART) API
//
//

module.exports = function (APP) {
    'use strict';

    APP.REPORT = {};


    //
    // Time constants.
    //
    var SECOND  = 1000;
    var MINUTE  = SECOND * 60;
    var HOUR    = MINUTE * 60;
    var DAY     = HOUR   * 24;
    var WEEK    = DAY    * 7;
    var MONTH   = WEEK   * 4;
    var QUARTER = MONTH  * 3;
    var YEAR    = MONTH  * 12;



    //
    // Get responses formatted for map usage.
    //
    // TODO: Refactor.
    //
    APP.REPORT.getMapData = function (params, callback) {
        var locationItem = null;
        var locationItems = [];
        var mappableItems = [];
        var mappableResponses = [];
        var maxIntervals = 100;

        APP.lib.db.query([
            [APP.SQL.selectFormItems, [params.lang, params.form_id, null, null]],
            [APP.SQL.selectFormItemsOptions, [params.lang, params.form_id, null]],
            [APP.SQL.selectFormResponses, [params.lang, params.form_id, params.from || null, params.to || null, APP.STATUS.ACTIVE, null]]
        ], function (err, items, options, responses) {
            if (err) { return APP.serverError('getMapData()', err, callback); }

            responses = filterPublicResponses(responses);

            var i, j, rItem;

            // Extract location, choice and scale type items from a form.
            for (i = 0; i < items.length; i += 1) {
                for (j = 0; j < options.length; j += 1) {
                    if (items[i].id == options[j].item_id) {
                        items[i].options = items[i].options || [];
                        items[i].options.push(options[j]);
                    }
                }
                if (items[i].type_id == APP.FORM_ITEM_TYPE.LOCATION_CHOICE || items[i].type_id == APP.FORM_ITEM_TYPE.LOCATION_SEARCH) {
                    locationItems.push(items[i]);
                }
                if (items[i].type_id == APP.FORM_ITEM_TYPE.CHOICE || items[i].type_id == APP.FORM_ITEM_TYPE.SCALE) {
                    if (!items[i].settings.hidden_from_map) {
                        mappableItems.push(items[i]);
                    }
                }
            }

            // Pick a location item (if there're multiple location items).
            if (params.location_item_id) {
                for (i = 0; i < locationItems.length; i += 1) {
                    if (params.location_item_id == locationItems[i].id) {
                        locationItem = locationItems[i]; break;
                    }
                }
            } else {
                locationItem = locationItems[0];
            }

            if (!locationItem) {
                return callback({ error: 'No location item found.' });
            }

            // Filter responses, the ones that have correct location and datetime.
            for (i = 0; i < responses.length; i += 1) {
                if (params.item_id && params.option_id) {
                    if (!APP.util.findObject(responses[i].items, { item_id: params.item_id, option_id: params.option_id })) {
                        continue;
                    }
                } else if (params.item_id) {
                    if (!APP.util.findObject(responses[i].items, { item_id: params.item_id })) {
                        continue;
                    }
                }
                for (j = 0; j < responses[i].items.length; j += 1) {
                    rItem = responses[i].items[j];

                    if (locationItem.id == rItem.item_id) {
                        if (locationItem.type_id === APP.FORM_ITEM_TYPE.LOCATION_SEARCH) {
                            rItem.value = JSON.parse(rItem.value);
                            responses[i].lat = rItem.value.lat;
                            responses[i].lng = rItem.value.lng;
                        } else if (rItem.option_settings) {
                            responses[i].lat = rItem.option_settings.lat;
                            responses[i].lng = rItem.option_settings.lng;
                        }
                    }
                }
                if (responses[i].datetime) {
                    try {
                        responses[i].timestamp = Date.parse(responses[i].datetime);
                    } catch (e) {}
                }
                if (responses[i].timestamp && responses[i].lat && responses[i].lng) {
                    mappableResponses.push(responses[i]);
                }
            }

            if (!mappableResponses.length) {
                return callback(null, {});
            }

            // Group responses in date intervals for timeline player.
            var firstResponse = mappableResponses[mappableResponses.length - 1];
            var lastResponse = mappableResponses[0];
            var intervaledResponses = dateRangeMap(firstResponse.timestamp, lastResponse.timestamp, WEEK);
            var dateRangeKeys = Object.keys(intervaledResponses);
            var inserted = {};
            var t;

            if (dateRangeKeys.length > maxIntervals) {
                return callback({ error: 'Date interval is too small for specified range of responses.' });
            }

            for (i = 0; i < mappableResponses.length; i += 1) {
                for (j = 0; j < dateRangeKeys.length; j += 1) {
                    t = parseFloat(dateRangeKeys[j]);

                    if (!inserted[i] && mappableResponses[i].timestamp <= (t + WEEK)) {
                        inserted[i] = true;
                        intervaledResponses[t].push(mappableResponses[i]);
                    }
                }
            }

            callback(null, { 
                location_item: locationItem,
                caption_items: mappableItems,
                intervaled_responses: intervaledResponses,
                responses: mappableResponses
            });
        });
    };



    //
    // Create an object where each interval date is a key (in milliseconds) 
    // with an empty array as a value.
    //
    // Example: 
    //    dateRangeMap('2014-08-01', '2014-08-29');
    //
    //    {
    //       1406851200000: []
    //       1407456000000: []
    //       1408060800000: []
    //       1408665600000: []
    //    }
    //
    function dateRangeMap(fromTimestamp, toTimestamp, intervalMS) {
        var range = {};

        if (typeof fromTimestamp === 'string') {
            fromTimestamp = Date.parse(fromTimestamp);
        } else if (APP.util.isDate(fromTimestamp)) {
            fromTimestamp = fromTimestamp.getTime();
        }

        if (typeof toTimestamp === 'string') {
            toTimestamp = Date.parse(toTimestamp);
        } else if (APP.util.isDate(toTimestamp)) {
            toTimestamp = toTimestamp.getTime();
        }

        if (typeof intervalMS !== 'number' || fromTimestamp < 1 || toTimestamp < 1) {
            return range;
        }

        var i = fromTimestamp;
        range[i] = [];

        while ((i += intervalMS) < toTimestamp) {
            range[i] = [];
        }

        return range;
    }



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

};