//
//
// LANGUAGES & TRANSLATIONS API
//
//

module.exports = function (APP) {
    'use strict';

    APP.LANG = {};


    //
    // Select all languages in the platform.
    //
    // API params:
    //     lang (string) - two letter ISO language code.
    //
    // Possible errors:
    //     server-error 
    //
    APP.LANG.getLanguages = function (params, callback) {
        APP.lib.db.query(APP.SQL.selectLanguages, function (err, languages) {
            if (err) { 
                return APP.serverError('getLanguages()', err, callback); 
            }
            var langs = {
                languages: [],
                enabledLanguages: []
            };

            langs.languages = languages;
            langs.enabledLanguages = languages.filter(function (lang) {
                return lang.enabled;
            });
            callback(null, langs);
        });
    };


    //
    // Select UI translations for specified language or for all languages.
    //
    // API params:
    //     lang (string) [optional] - two letter ISO language code.
    //
    // Possible errors:
    //     invalid-parameters
    //     server-error 
    //
    APP.LANG.getUITranslations = function (params, callback) {
        if (params.lang && !APP.LANG.validLanguageParam(params.lang)) {
            return callback(ERROR.INVALID_PARAMETERS);
        }

        function onResult(err, uiTranslations) {
            if (err) { 
                return APP.serverError('getUITranslations()', err, callback); 
            }
            callback(null, uiTranslations);
        }

        if (params.lang) {
            APP.lib.db.query(APP.SQL.selectUiTranslations, params.lang, onResult);
        } else {
            APP.lib.db.query(APP.SQL.selectAllUiTranslations, onResult);
        }
    };


    //
    // Update UI translations.
    //
    // API params:
    //     ui_translations (array) - list of translations to update.
    //         format: [{ "t_key": "lorem-ipsum", "lang": "en", "t_value": "lorem ipsum..." }, ...]
    //
    // Possible errors:
    //     permission-denied
    //     server-error 
    //
    APP.LANG.updateUITranslations = function (params, callback) {
        APP.AUTH.validUserPermission(params, APP.PERMISSION.ADMINISTRATOR, function (err, user) {
            if (err) { return callback(err); }

            if (!Array.isArray(params.ui_translations)) {
                return callback(ERROR.INVALID_PARAMETERS);
            }
            
            var tQueries = [];

            params.ui_translations.forEach(function (uit) {
                if (uit.t_key && APP.LANG.validLanguageParam(uit.lang) && uit.t_value) {
                    tQueries.push([APP.SQL.updateUiTranslation, uit.t_key, uit.lang, uit.t_value]);
                }
            });

            if (tQueries.length) {
                APP.lib.db.beginTransaction(function (transaction) {
                    transaction.query(tQueries, function (err) {
                        if (err) { 
                            transaction.rollback(); 
                            return APP.serverError('updateUITranslations()', err, callback);
                        }
                        transaction.commit();
                        callback(null, {});
                    });
                });
            } else {
                return callback(null, {});
            }
        });
    };


    //
    // Check if a language parameter is two letter string.
    //
    APP.LANG.validLanguageParam = function (p) {
        return p && typeof p === 'string' && /[a-zA-Z]{2}/.test(p) && p.length === 2;
    };


};