'use strict';

var APP = {};



//
// Node.js modules sand 3rd party libs.
//
APP.lib = {
    http:        require('http'),
    https:       require('https'),
    fs:          require('fs'),
    path:        require('path'),
    url:         require('url'),
    querystring: require('querystring'),
    crypto:      require('crypto'),
    pg:          require('pg'),
    parseArgs:   require('minimist'),
    multiparty:  require('multiparty'),
    bcrypt:      require('bcrypt'),
    uuid:        require('node-uuid'),
    db:          require('postgresql-query')
};



//
// Attach all internal components to the APP object.
//
require('./components/auth.js')(APP);
require('./components/lang.js')(APP);
require('./components/user.js')(APP);
require('./components/upload.js')(APP);
require('./components/form.js')(APP);
require('./components/report.js')(APP);
require('./config.js')(APP, APP.lib.parseArgs(process.argv.slice(2)));
require('./utils.js')(APP);
require('./route.js')(APP);



//
// Grab all SQL and email template files.
//
APP.SQL = APP.util.getAllFileContentsSync(__dirname + '/sql-queries', '.sql');
APP.EMAIL_TEMPLATE = APP.util.getAllFileContentsSync(__dirname + '/email-templates', '.html');



//
// Handy references to types and statuses in database.
//
APP.TOKEN_TYPE = {
    SESSION: 1,
    PASSWORD_RESET: 2
};
APP.PERMISSION = {
    OWNER: 1,
    ADMINISTRATOR: 50,
    ASSISTANT: 100,
    COUNCIL: 150,
    USER: 1000
};
APP.STATUS = {
    DELETED: -1,
    ACTIVE: 1,
    DRAFT: 2,
    REVISION: 3
};
APP.ACTION_STATUS = {
    DECLINED: 0,
    COMPLETED: 1,
    RECEIVED: 2
};
APP.FORM_ITEM_TYPE = {
    TEXT: 1,
    NUMBER: 2,
    SCALE: 3,
    CHOICE: 4,
    LOCATION_CHOICE: 5,
    LOCATION_SEARCH: 6,
    DATETIME: 7
};



//
// Error messages for API calls
//
APP.ERROR = {
    SERVER_ERROR:           { error: 'server-error' },
    INVALID_PARAMETERS:     { error: 'invalid-parameters' },
    INVALID_TOKEN:          { error: 'invalid-token' },
    INVALID_PASSWORD_TOKEN: { error: 'invalid-password-token' },
    INVALID_INVITE_TOKEN:   { error: 'invalid-invite-token' },
    INVALID_CREDENTIALS:    { error: 'invalid-credentials' },
    INVALID_EMAIL:          { error: 'invalid-email' },
    PASSWORD_NOMATCH:       { error: 'password-nomatch' },
    WRONG_PASSWORD:         { error: 'wrong-password' },
    EMAIL_EXISTS:           { error: 'email-exists' },
    PERMISSION_DENIED:      { error: 'permission-denied' },
    EMPTY_FIELDS:           { error: 'empty-fields' }
};



//
// Configure the database module.
//
APP.lib.db.config({
    username: APP.CONFIG.DB_USER,
    password: APP.CONFIG.DB_PASS,
    database: APP.CONFIG.DB_NAME,
    host: APP.CONFIG.PG_HOST,
    port: APP.CONFIG.PG_PORT
});



//
// Global helper function to log internal message to STDERR and 
// optionaly send "public" error messages to callback/client.
//
APP.serverError = function (name, err, callback, publicErrMessage) {
    if (APP.util.isFunction(callback)) {
        callback(publicErrMessage || APP.ERROR.SERVER_ERROR);
    }
    console.error(new Date() + ' => ', name, err);
};



//
// Temporary in-memory cache that is wiped out every time the application restarts.
//
APP.cache = {};



//
// Start the app server.
//
APP.lib.http.createServer(requestRouter).listen(APP.CONFIG.PORT, APP.CONFIG.HOST);
console.log('Server started on http://' + APP.CONFIG.HOST + ':' + APP.CONFIG.PORT);



//
// Request router.
//
// Handle an HTTP request and route it to a corresponding route handler
// or respond with an error message otherwise.
//
function requestRouter(req, res) {
    var parsedUrl = APP.lib.url.parse(req.url, true);
    var qsParams  = parsedUrl.query;
    var apiPath   = parsedUrl.pathname.replace('/api', '');
    var method    = req.method.toUpperCase();

    var invalidMethodMsg    = { error: 'Invalid HTTP method: ' + method };
    var methodNotAllowedMsg = { error: method + ' HTTP method is not allowed at ' + apiPath };
    var unknownPathMsg      = { error: 'Unknown API path: ' + apiPath };

    if (['GET', 'POST', 'PUT', 'DELETE'].indexOf(method) === -1) {
        console.error(invalidMethodMsg); 
        res.end(invalidMethodMsg);
    }

    if (APP.route[apiPath]) {
        if (APP.route[apiPath][method]) {
            if (method === 'GET') {
                if (!qsParams.session_token) {
                    qsParams.session_token = req.headers['x-session-token'];
                }
                responseHandler(req, res, qsParams, APP.route[apiPath][method]);
            } else if (APP.route[apiPath].skipParsing) {
                responseHandler(req, res, { req: req, res: res }, APP.route[apiPath][method]);
            } else {
                APP.util.parseJSONBody(req, res, function (params) {
                    responseHandler(req, res, params, APP.route[apiPath][method]);
                });
            }
        } else {
            console.error(methodNotAllowedMsg);
            APP.util.sendJSONBody(res, methodNotAllowedMsg);
        }
    } else {
        console.error(unknownPathMsg);
        APP.util.sendJSONBody(res, unknownPathMsg);
    }
}


//
// Wrap a route handler and respond to a request 
// with a consistent response format.
//
// {
//     "error": "invalid-parameter", // or null if no error occurred.
//     "data": [], {}, null
// }
//
function responseHandler(req, res, params, routeHandler) {
    try {
        routeHandler(params, function (err, data) {
            if (err) {
                APP.util.sendJSONBody(res, err);
            } else {
                APP.util.sendJSONBody(res, { error: null, data: data });
            }
        });
    } catch (e) {
        APP.util.sendJSONBody(res, APP.ERROR.SERVER_ERROR);
        console.error(new Date() + ' => ', 'responseHandler()', req.url, e);
    }
}