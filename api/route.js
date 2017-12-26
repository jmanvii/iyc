module.exports = function (APP) {
    'use strict';

    APP.route = {

        '/login':                     { POST:   APP.AUTH.logIn },
        '/logout':                    { POST:   APP.AUTH.logOut },
        '/signup':                    { POST:   APP.AUTH.signUp },
        '/reset-password':            { POST:   APP.AUTH.resetPassword },
        '/confirm-reset-password':    { POST:   APP.AUTH.confirmResetPassword },
        '/update-session-token':      { POST:   APP.AUTH.updateSessionToken },
 
        '/form':                      { GET:    APP.FORM.getFormHierarchy },
        '/form/categorization-item':  { GET:    APP.FORM.getFormCategorizationItem },
        '/form/responses':            { GET:    APP.FORM.getResponses },
        '/form/response':             { GET:    APP.FORM.getResponse, 
                                        POST:   APP.FORM.createResponse, 
                                        PUT:    APP.FORM.updateResponse, 
                                        DELETE: APP.FORM.deleteResponse },
        '/form/response/approve':     { PUT:    APP.FORM.approveResponse },
        '/form/response/complete':    { PUT:    APP.FORM.completeResponse },
        '/form/response/decline':     { PUT:    APP.FORM.declineResponse },
        '/form/translations':         { GET:    APP.FORM.getFormTranslations, PUT: APP.FORM.updateFormTranslations },
         
        '/user/profile':              { POST:   APP.USER.updateProfile },
        '/user/details':              { POST:   APP.USER.updateDetails },
        '/user/email':                { POST:   APP.USER.updateEmail },
         
        '/upload':                    { POST:   APP.UPLOAD.fileFromFormData, skipParsing: true },
        '/languages':                 { GET:    APP.LANG.getLanguages },
        '/ui-translations':           { GET:    APP.LANG.getUITranslations, 
                                        PUT:    APP.LANG.updateUITranslations },
 
        '/data/map':                  { GET:    APP.REPORT.getMapData },
        '/data/xy':                   { GET:    APP.REPORT.getXYData },
        '/data/bar-chart':            { GET:    APP.REPORT.getBarChartData },
        '/data/line-chart':           { GET:    APP.REPORT.getLineChartData }
    };

};