//
//
// USER API
//
//

module.exports = function (APP) {
    'use strict';

    APP.USER = {};


    //
    // Select all users.
    //
    // API params:
    //     lang (string) - two letter ISO language code.
    //
    // Possible errors:
    //     invalid-token
    //     invalid-parameters
    //     permission-denied
    //     server-error
    //
    APP.USER.getUsers = function (params, callback) {
        if (!APP.LANG.validateLanguageParam(params.lang)) {
            return callback(APP.ERROR.INVALID_PARAMETERS);
        }
        APP.AUTH.validUserPermission(params, APP.ORGANIZATION.TRAKTOR, function (err) {
            if (err) { return callback(err); }

            APP.lib.db.query(APP.SQL.selectUsers, [params.lang, null], function (err, users) {
                if (err) { return APP.serverError('getUsers()', err, callback); }
                callback(null, users);
            });
        });
    };


    //
    // Select an user.
    //
    // API params:
    //     lang (string)    - two letter ISO language code.
    //     user_id (number) - ID of an user.
    //
    // Possible errors:
    //     invalid-token
    //     invalid-parameters
    //     permission-denied
    //     server-error
    //
    APP.USER.getUser = function (params, callback) {
        params.user_id = parseInt(params.user_id, 10);

        if (!params.user_id || !APP.LANG.validateLanguageParam(params.lang)) {
            return callback(APP.ERROR.INVALID_PARAMETERS);
        }

        APP.AUTH.validUserPermission(params, APP.ORGANIZATION.TRAKTOR, function (err) {
            if (err) { return callback(err); }

            APP.lib.db.queryOne(APP.SQL.selectUsers, [params.lang, params.user_id], function (err, user) {
                if (err) { return APP.serverError('getUser()', err, callback); }
                callback(null, user);
            });
        });
    };


    //
    // Update user's profile.
    //
    APP.USER.updateProfile = function (params, callback) {
        APP.AUTH.validUserSession(params, function (err, user) {
            if (err) { return callback(err); }

            var fields = {};

            if (params.first_name) {
                fields.first_name = params.first_name;
            }
            if (params.last_name) {
                fields.last_name = params.last_name;
            }
            if (params.picture !== undefined) {
                fields.picture = params.picture;
            }
            if (params.settings) {
                fields.settings = params.settings;
            }

            if (Object.keys(fields).length) {
                APP.lib.db.queryUpdate({
                    table: 'users',
                    fields: fields,
                    where: { id: user.id }
                }, function (err) {
                    if (err) { return APP.serverError('updateUserProfile()', err, callback); }
                    callback(null, {});
                });
            } else {
                callback(null, {});
            }
        });
    };


    //
    // Update user's group and organization.
    //
    APP.USER.updateDetails = function (params, callback) {
        APP.AUTH.validUserPermission(params, APP.ORGANIZATION.TRAKTOR, function (err, user) {
            if (err) { return callback(err); }

            var fields = {};

            if (params.group_id) { fields.group_id = params.group_id; }
            if (params.organization_id) { fields.organization_id  = params.organization_id; }

            if (Object.keys(fields).length) {
                APP.lib.db.queryUpdate({
                    table: 'users',
                    fields: fields,
                    where: { id: user.id }
                }, function (err) {
                    if (err) { return APP.serverError('APP.AUTH.validUserPermission()', err, callback); }
                    callback(null, {});
                });
            } else {
                callback(null, {});
            }
        });
    }; 


    //
    // Update user's email address.
    //
    APP.USER.updateEmail = function (params, callback) {
        if (!params.email || !params.password) {
            return callback(APP.ERROR.INVALID_PARAMETERS);
        }
        APP.AUTH.validUserSession(params, function (err, user) {
            if (err) { return callback(err); }

            APP.lib.bcrypt.compare(params.password, user.password, function (err, match) {
                if (err)    { return APP.serverError('updateUserEmail() > bcrypt.compare', err, callback); }
                if (!match) { return callback(APP.ERROR.WRONG_PASSWORD); }
                
                APP.lib.db.queryOne(APP.SQL.selectUserByEmail, params.email, function (err, otherUser) {
                    if (err) { return APP.serverError('updateUserEmail() > selectUserByEmail', err, callback); }
                    if (otherUser) { return callback(APP.ERROR.EMAIL_EXISTS); }

                    APP.lib.db.queryUpdate({
                        table: 'users',
                        fields: { email: params.email, },
                        where: { id: user.id }
                    }, function (err) {
                        if (err) { return APP.serverError('updateUserEmail() > queryUpdate()', err, callback); }
                        callback(null, {});
                    });
                });
            });
        });
    };


    //
    // Update user's password.
    //
    APP.USER.updatePassword = function (params, callback) {
        if (!params.old_password || !params.new_password || !params.new_password_repeated) {
            return callback(APP.ERROR.INVALID_PARAMETERS);
        }
        if (params.new_password !== params.new_password_repeated) {
            return callback(APP.ERROR.PASSWORD_NOMATCH);
        }
        APP.AUTH.validUserSession(params, function (err, user) {
            if (err) { return callback(err); }

            if (!user.password) { return callback(APP.ERROR.INVALID_CREDENTIALS); }

            APP.lib.bcrypt.compare(params.old_password, user.password, function (err, match) {
                if (err)    { return APP.serverError('updateUserPassword() > bcrypt.compare', err, callback); }
                if (!match) { return callback(APP.ERROR.WRONG_PASSWORD); }

                APP.lib.bcrypt.hash(params.new_password, APP.CONFIG.SALT_LENGTH, function (err, password) {
                    if (err) { return APP.serverError('updateUserPassword() > bcrypt.hash', err, callback); }

                    APP.lib.db.queryUpdate({
                        table: 'users',
                        fields: { password: password, },
                        where: { id: user.id }
                    }, function (err) {
                        if (err) { return APP.serverError('updateUserPassword() > queryUpdate()', err, callback); }
                        callback(null, {});
                    });
                });
            });
        });
    };


    //
    // Select user's farm.
    //
    APP.USER.getFarm = function (params, callback) {
        APP.AUTH.validUserSession(params, function (err, user) {
            if (err) { return callback(err); }

            APP.lib.db.queryOne(APP.SQL.selectFarm, user.id, function (err, farm) {
                if (err) { return APP.serverError('getUserFarm()', err, callback); }
                callback(null, farm);
            });
        });
    };


    //
    // Update user's farm.
    //
    APP.USER.updateFarm = function (params, callback) {
        APP.AUTH.validUserSession(params, function (err, user) {
            if (err) { return callback(err); }

            APP.lib.db.queryOne(APP.SQL.selectFarm, user.id, function (err, farm) {
                if (err) { return APP.serverError('updateUserFarm()', err, callback); }

                var fields = {
                    user_id: user.id,
                    name: params.location_name,
                    location: { lat: params.lat, lng: params.lng },
                    settings: params.settings || {}
                };

                function afterQuery(err, farm) {
                    if (err) { 
                        return APP.serverError('updateUserFarm() > afterAPP.lib.db.Query()', err, callback); 
                    }
                    callback(null, farm);
                }

                if (farm) {
                    APP.lib.db.queryUpdate({
                        table: 'user_farms',
                        fields: fields,
                        where: { id: farm.id },
                        returnValue: '*'
                    }, afterQuery);
                } else {
                    APP.lib.db.queryInsert({
                        table: 'user_farms',
                        fields: fields,
                        returnValue: '*'
                    }, afterQuery);
                }
            });
        });
    };


    //
    // Select user's agro products.
    //
    APP.USER.getAgroProducts = function (params, callback) {
        APP.AUTH.validUserSession(params, function (err, user) {
            if (err) { return callback(err); }

            APP.lib.db.query(APP.SQL.selectUserAgProducts, user.id, function (err, products) {
                if (err) { return APP.serverError('getUserProducts()', err, callback); }
                callback(null, products);
            });
        });
    };


    //
    // Update user's agro products.
    //
    APP.USER.updateAgroProducts = function (params, callback) {
        if (!params.products || !Array.isArray(params.products)) {
            return callback(APP.ERROR.INVALID_PARAMETERS);
        }
        APP.AUTH.validUserSession(params, function (err, user) {
            if (err) { return callback(err); }

            APP.lib.db.queryOne(APP.SQL.selectFarm, user.id, function (err, farm) {
                if (err || !farm) { 
                    return APP.serverError('updateUserAgProducts() > APP.SQL.selectFarm', err, callback); 
                }

                var queries = [
                    ['DELETE FROM user_farm_products WHERE user_id = $1', user.id]
                ];

                params.products.forEach(function (productId) {
                    queries.push({
                        table: 'user_farm_products',
                        fields: {
                            user_id: user.id,
                            product_id: productId,
                            farm_id: farm.id
                        }
                    });
                });

                APP.lib.db.beginTransaction(function (transaction) {
                    transaction.query(queries, function (err) {
                        if (err) { 
                            transaction.rollback(); 
                            return APP.serverError('updateUserAgProducts() > INSERT user_farm_products', err, callback); 
                        }
                        transaction.commit();
                        callback(null, {});
                    });
                });
            });
        });
    };


};