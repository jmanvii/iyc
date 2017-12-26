//
//
// AUTH API
//
//

module.exports = function (APP) {
    'use strict';

    APP.AUTH = {};


    //
    // Authenticate user.
    //
    // API params:
    //     session_token (string) - A valid unique token aquired during previous authentication.
    //     or
    //     email (string) - An unique email or username that was used during signup.
    //     password (string) - Corresponding password.
    //
    // Possible errors:
    //     invalid-token
    //     invalid-credentials
    //     server-error 
    //
    APP.AUTH.logIn = function (params, callback) {
        var newToken = APP.util.generateToken();

        function sendUserData(user) {
            if (params.session_token) {
                APP.lib.db.query(APP.SQL.invalidateUserToken, params.session_token);
            }
            APP.lib.db.queryOne(APP.SQL.createUserToken, [APP.TOKEN_TYPE.SESSION, user.id, newToken], function (err) {
                if (err) { return APP.serverError('logIn() > APP.SQL.createUserToken', err, callback); }

                delete user.password;
                user.session_token = newToken;

                callback(null, user);
            });
        }

        if (params.session_token) {
            APP.lib.db.queryOne(APP.SQL.selectUserByToken, [APP.TOKEN_TYPE.SESSION, params.session_token], function (err, user) {
                if (err)   { return APP.serverError('logIn() > APP.SQL.selectUserByToken', err, callback); }
                if (!user) { return callback(APP.ERROR.INVALID_TOKEN); }
                sendUserData(user);
            });
        } else if (params.email && params.password) {
            APP.lib.db.queryOne(APP.SQL.selectUserByEmail, params.email, function (err, user) {
                if (err)   { return APP.serverError('logIn() > APP.SQL.selectUserByEmail', err, callback); }
                if (!user) { return callback(APP.ERROR.INVALID_CREDENTIALS); }

                APP.lib.bcrypt.compare(params.password, user.password, function (err, match) {
                    if (err || !match) { return callback(APP.ERROR.INVALID_CREDENTIALS); }
                    sendUserData(user);
                });
            });
        } else {
            callback(APP.ERROR.INVALID_CREDENTIALS);
        }
    };


    //
    // Invalidate user's active session token.
    //
    // API params:
    //     session_token (string) - A valid session token.
    //
    // Possible errors:
    //     invalid-token
    //     server-error 
    //
    APP.AUTH.logOut = function (params, callback) {
        APP.AUTH.validUserSession(params, function (err, user) {
            if (err) { return callback(err); }
            APP.lib.db.query(APP.SQL.invalidateUserToken, params.session_token);
            callback(null, {});
        });
    };


    //
    // Sign up a new user (farmer).
    //
    // API params:
    //     password (string)          - User's password.
    //     password_repeated (string) - The same password repeated.
    //     email                      - User's valid email address.
    //
    // Possible errors:
    //     empty-fields
    //     password-nomatch
    //     invalid-email
    //     email-exists
    //     server-error 
    //
    APP.AUTH.signUp = function (params, callback) {
        if (!params.password || params.password.length === 0) {
            return callback(APP.ERROR.EMPTY_FIELDS);
        }

        if (params.password !== params.password_repeated) {
            return callback(APP.ERROR.PASSWORD_NOMATCH);
        }

        if (!APP.CONFIG.EMAIL_REGEX.test(params.email)) {
            return callback(APP.ERROR.INVALID_EMAIL);
        }  

        APP.lib.db.queryOne(APP.SQL.selectUserByEmail, params.email, function (err, user) {
            if (err)  { return APP.serverError('signUp() > selectUserByEmail', err, callback); }
            if (user) { return callback(APP.ERROR.EMAIL_EXISTS); }

            APP.lib.bcrypt.hash(params.password, APP.CONFIG.SALT_LENGTH, function (err, hashedPassword) {
                if (err) { return APP.serverError('signUp() > bcrypt.hash', err, callback); }
                createUser(hashedPassword);
            });
        });

        function createUser(hashedPassword) {
            APP.lib.db.queryInsert({
                table: 'users',
                fields: {
                    email: params.email,
                    password: hashedPassword,
                    settings: { new_user: true }
                },
                returnValue: 'id'
            }, function (err) {
                if (err) { return APP.serverError('signUp() > createUser()', err, callback); }
                APP.AUTH.logIn({ email: params.email, password: params.password }, callback);
            });
        }
    };


    //
    // Send password reset instruction to a user's email address.
    //
    // API params:
    //     email - User's valid email address.
    //
    // Possible errors:
    //     invalid-email
    //     server-error 
    //
    APP.AUTH.resetPassword = function (params, callback) {
        if (!APP.CONFIG.EMAIL_REGEX.test(params.email)) {
            return callback(APP.ERROR.INVALID_EMAIL);
        }
        APP.lib.db.queryOne(APP.SQL.selectUserByEmail, params.email, function (err, user) {
            if (err || !user) { return callback(null, {}); }

            var token = APP.util.generateToken();

            APP.lib.db.beginTransaction(function (transaction) {
                transaction.query([
                    [APP.SQL.invalidateUserTokens, [APP.TOKEN_TYPE.PASSWORD_RESET, user.id]],
                    [APP.SQL.createUserToken, [APP.TOKEN_TYPE.PASSWORD_RESET, user.id, token]]
                ], function (err) {
                    if (err) { 
                        transaction.rollback(); 
                        return APP.serverError('resetPassword()', err, callback); 
                    }

                    var href = APP.CONFIG.WEBSITE_URL + '/confirm-reset-password?token=' + token;
                    var html = APP.util.compileHTMLTemplate(APP.EMAIL_TEMPLATE.passwordReset, { 
                        href: href, 
                        email: user.email,
                        name: user.first_name ? user.first_name : user.email.split('@')[0]
                    });

                    APP.util.sendEmail(user.email, 'Password Reset Instructions', html);
                    transaction.commit();
                    callback(null, {});
                });
            });
        });
    };


    //
    // Confirm password reset token and reset the password.
    //
    // API params:
    //     password_reset_token (string) - A valid password reset token.
    //     password (string)             - User's new password.
    //     password_repeated (string)    - The same password repeated.
    //
    // Possible errors:
    //     empty-fields
    //     invalid-password-token
    //     password-nomatch
    //     server-error 
    //
    APP.AUTH.confirmResetPassword = function (params, callback) {
        if (!params.password || params.password.length === 0) {
            return callback(APP.ERROR.EMPTY_FIELDS);
        }

        if (!params.password_reset_token) {
            return callback(APP.ERROR.INVALID_PASSWORD_TOKEN);
        }

        if (params.password !== params.password_repeated) {
            return callback(APP.ERROR.PASSWORD_NOMATCH);
        }

        var qParams = [APP.TOKEN_TYPE.PASSWORD_RESET, params.password_reset_token];

        APP.lib.db.queryOne(APP.SQL.selectUserByToken, qParams, function (err, user) {
            if (err)   { return APP.serverError('confirmResetPassword() > selectUserByToken', err, callback); }
            if (!user) { return callback(APP.ERROR.INVALID_PASSWORD_TOKEN); }

            APP.lib.bcrypt.hash(params.password, APP.CONFIG.SALT_LENGTH, function (err, password) {
                if (err) { return APP.serverError('confirmResetPassword() > bcrypt.hash', err, callback); }

                APP.lib.db.queryUpdate({
                    table: 'users',
                    fields: {
                        password: password
                    },
                    where: {
                        id: user.id
                    }
                }, function (err) {
                    if (err) { return APP.serverError('confirmResetPassword() > queryUpdate()', err, callback); }
                    APP.lib.db.query(APP.SQL.invalidateUserTokens, [APP.TOKEN_TYPE.PASSWORD_RESET, user.id]);
                    callback(null, {});
                });
            });
        });
    };


    //
    // Replace a valid session token with a new one.
    //
    // API params:
    //     session_token (string) - A valid session token.
    //
    // Possible errors:
    //     invalid-token
    //     server-error 
    //
    APP.AUTH.updateSessionToken = function (params, callback) {
        var newToken = APP.util.generateToken();

        APP.AUTH.validUserSession(params, function (err, user) {
            if (err) { return callback(err); }

            APP.lib.db.query(APP.SQL.createUserToken, [APP.TOKEN_TYPE.SESSION, user.id, newToken], function (err) {
                if (err) { return APP.serverError('updateSessionToken()', err, callback); }

                APP.lib.db.query(APP.SQL.invalidateUserToken, [params.session_token]);
                callback(null, { session_token: newToken });
            });
        });
    };


    //
    // Authenticate user via Facebook.
    //
    // TODO: Refactor to few smaller functions.
    //
    // API params:
    //     access_token (string) - A valid Facebook access_token
    //     or
    //     code (string) - A valid facebook one-time authentication code.
    //     redirect_uri (string) - A valid Facebook redirect url.
    //
    // Possible errors:
    //     invalid-parameters
    //     server-error
    //
    APP.AUTH.fbLogin = function (params, callback) {
        var sessionToken = APP.util.generateToken();
        var fbProfileFields = [
            'name',
            'email',
            'first_name',
            'last_name',
            'age_range',
            'link',
            'gender',
            'locale',
            'picture',
            'updated_time',
            'timezone',
            'verified'
        ];

        // https://developers.facebook.com/docs/facebook-login/manually-build-a-login-flow
        function getAccessToken(cb) {
            APP.util.request({
               method: 'GET',
               host: 'graph.facebook.com',
               path: '/v2.5/oauth/access_token',
               https: true
            }, {
                client_id: APP.CONFIG.FB_APP_ID,
                client_secret: APP.CONFIG.FB_SECRET,
                code: params.code,
                redirect_uri: decodeURI(params.redirect_uri)
            }, cb);
        }

        function getFacebookProfile(accessToken, cb) {
            APP.util.request({
               method: 'GET',
               host: 'graph.facebook.com',
               path: '/v2.5/me',
               https: true
            }, {
                access_token: accessToken,
                fields: fbProfileFields.join(',')
            }, cb);
        }

        function getDateFromFacebookTimestamp(timestamp) {
            return new Date(Date.now() + timestamp * 1000);
        }

        function sendUserData(user) {
            delete user.password;
            user.session_token = sessionToken;
            callback(null, user);
        }

        function updateCrrentUser(fbResponse, fbUser, user) {
            var profileFields = {
                fbid: fbUser.id,
                settings: { facebook_profile: fbUser }
            };
            if (!user.picture) {
                profileFields.picture = fbUser.picture.data.url;
            }
            APP.lib.db.beginTransaction(function (transaction) {
                var expiresAt = fbResponse.expires_in_date || getDateFromFacebookTimestamp(fbResponse.expires_in);

                transaction.query([
                    {
                        table: 'users',
                        fields: profileFields,
                        where: { id: user.id }
                    },
                    {
                        table: 'user_tokens',
                        fields: {
                            token_type: APP.TOKEN_TYPE.FACEBOOK,
                            user_id: user.id,
                            token: fbResponse.access_token,
                            expires_at: expiresAt
                        }
                    },
                    [APP.SQL.createUserToken, [APP.TOKEN_TYPE.SESSION, user.id, sessionToken]]
                ], function (err) {
                    if (err) { 
                        transaction.rollback(); 
                        return APP.serverError('fbLogin() > updateCrrentUser()', err, callback); 
                    }
                    transaction.commit();
                    sendUserData(user);
                });
            });
        }

        function createNewUser(fbResponse, fbUser) {
            APP.lib.db.queryInsert({
                table: 'users',
                fields: {
                    fbid: fbUser.id,
                    email: fbUser.email,
                    first_name: fbUser.first_name,
                    last_name: fbUser.last_name,
                    picture: fbUser.picture.data.url,
                    settings: {
                        facebook_profile: fbUser,
                        new_user: true
                    }
                },
                returnValue: '*'
            }, function (err, user) {
                if (err) { 
                    return APP.serverError('fbLogin() > createNewUser()', err, callback); 
                }

                APP.lib.db.beginTransaction(function (transaction) {
                    var expiresAt = fbResponse.expires_in_date || getDateFromFacebookTimestamp(fbResponse.expires_in);

                    transaction.query([
                        {
                            table: 'user_tokens',
                            fields: {
                                token_type: APP.TOKEN_TYPE.FACEBOOK,
                                user_id: user.id,
                                token: fbResponse.access_token,
                                expires_at: expiresAt
                            }
                        },
                        [APP.SQL.createUserToken, [APP.TOKEN_TYPE.SESSION, user.id, sessionToken]]
                    ], function (err) {
                        if (err) { 
                            transaction.rollback(); 
                            return APP.serverError('fbLogin() > createUserToken', err, callback); 
                        }
                        transaction.commit();
                        user.new_user = true;
                        sendUserData(user);
                    });
                });
            });
        }

        function onFacebookProfile(fbToken, fbUser) {
            fbUser = JSON.parse(fbUser);

            APP.lib.db.queryOne(APP.SQL.selectUserByFbid, fbUser.id, function (err, user) {
                if (!err && user) {
                    updateCrrentUser(fbToken, fbUser, user);
                } else {
                    createNewUser(fbToken, fbUser);
                }
            });
        }

        if (params.code && params.redirect_uri) {
            getAccessToken(function (err, fbResponse) {
                fbResponse = JSON.parse(fbResponse.body);

                if (!fbResponse || fbResponse.error) {
                    return callback(APP.ERROR.INVALID_PARAMETERS);
                } else {
                    getFacebookProfile(fbResponse.access_token, function (err, fbUser) {
                        onFacebookProfile(fbResponse, fbUser.body);
                    });
                }
            });
        } else if (params.access_token) {
            getFacebookProfile(params.access_token, function (err, fbResponse) {
                onFacebookProfile(params, fbResponse.body);
            });
        } else {
            callback(APP.ERROR.INVALID_PARAMETERS);
        }
    };


    //
    // Deauthorize Facebook user.
    // TODO: Implement.
    //
    APP.AUTH.fbDeauthorize = function (params, callback) {
        console.log(params);
        res.end();
    };


    //
    // Temporary function for subscribing people by email.
    //
    APP.AUTH.subscribe = function (params, callback) {
        if (!APP.CONFIG.EMAIL_REGEX.test(params.email)) {
            return callback(APP.ERROR.INVALID_EMAIL);
        }
        APP.lib.db.queryOne('SELECT * FROM subscriptions WHERE email = $1', params.email, function (err, sb) {
            if (err) { return APP.serverError('subscribe()', err, callback); }
            if (sb)  { return callback(APP.ERROR.EMAIL_EXISTS); }

            APP.lib.db.queryInsert({
                table: 'subscriptions',
                fields: {
                    email: params.email
                }
            }, function () {
                callback(null, {});
            });
        });
    };


    //
    // Check if user's session_token is still valid.
    //
    APP.AUTH.validUserSession = function (params, callback) {
        var qParams = [APP.TOKEN_TYPE.SESSION, params.session_token];

        APP.lib.db.queryOne(APP.SQL.selectUserByToken, qParams, function (err, user) {
            if (err || !user) { 
                return callback(APP.ERROR.INVALID_TOKEN); 
            }
            callback(null, user);
        });
    };


    //
    // Check if user has the requested permission.
    //
    APP.AUTH.validUserPermission = function (params, requestedPermission, callback) {
        APP.AUTH.validUserSession(params, function (err, user) {
            if (err) { return callback(err); }

            // Low permission id is higher rank. Owner is 1, Administrator 50 and etc.
            if (user.permission <= requestedPermission) {
                callback(null, user);
            } else {
                callback(APP.ERROR.PERMISSION_DENIED);
            }
        });
    };


};