//
//
// HELPER  FUNCTIONS
//
//

module.exports = function (APP) {
    'use strict';

    APP.util = {};


    //
    // Handy wrapper for Node's http.request
    // https://nodejs.org/api/http.html#http_http_request_options_callback
    //
    //    request({
    //        method: 'GET',
    //        host: 'apple.com',
    //        path: '/ipad'
    //    }, function (err, response) {
    //        console.log(response.body); 
    //    });
    //
    APP.util.request = function (options, params, callback) {
        var isHTTPS = options.https || options.protocol === 'https:';

        if (options.username && options.password) {
            options.auth = options.username + ':' + options.password;
        }

        options = {
            method: options.method || 'GET',
            hostname: options.host || options.hostname,
            port: options.port,
            path: options.path,
            headers: options.headers || {},
            auth: options.auth,
            agent: options.agent
        };

        if (APP.util.isObject(params) || Array.isArray(params)) {
            if (/GET|HEAD/.test(options.method)) {
                
                var prefix = (options.path.indexOf('?') !== -1) ? '&' : '?';
                options.path += prefix + APP.lib.querystring.stringify(params);

            } else if (/POST|PUT|DELETE/.test(options.method)) {

                if (!options.headers['Content-Type']) {
                    params = APP.lib.querystring.stringify(params);
                    options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
                } else if (options.headers['Content-Type'] === 'application/json') {
                    params = JSON.stringify(params);
                }

                if (typeof params === 'string') {
                    options.headers['Content-Length'] = params.length;
                }
            }
        }

        var client = isHTTPS ? APP.lib.https : APP.lib.http;
        var req = client.request(options, function (res) {
            APP.util.parseSocketBody(res, function (err, body) {
                callback(err, {
                    status: { 
                        code: res.statusCode, 
                        message: res.statusMessage 
                    }, 
                    headers: res.headers, 
                    body: body 
                });
            });
        });

        req.on('err', function (err) {
            callback(err, { status: {}, headers: {}, body: '' });
        });

        if (/POST|PUT|DELETE/.test(options.method) && typeof params === 'string') {
            req.write(params);
        }

        req.end();
    };


    //
    // Generic request/response socket body parser.
    //
    APP.util.parseSocketBody = function (socket, callback, options) {
        options = options || {};

        var sizeLimit = options.sizeLimit || APP.CONFIG.POST_MAX_SIZE;
        var body = '';

        socket.on('data', function (chunk) {
            body += chunk;

            if (body.length > sizeLimit) {
                callback({ message: 'Socket size limit reached.' });
            }
        });

        socket.on('error', function (err) {
            callback(err, body);
        });

        socket.on('end', function () {
            callback(null, body);
        });
    };


    //
    // Parse data form an urlencoded POST request.
    //
    APP.util.parsePOSTBody = function (req, res, callback) {
        APP.util.parseSocketBody(req, function (err, body) {
            var params;

            if (err) {
                console.error('parsePOSTBody()', err);
                return APP.util.sendJSONBody(res, APP.ERROR.INVALID_PARAMETERS);
            }

            try {
                params = APP.lib.querystring.parse(body);
            } catch (e) {
                console.error('parsePOSTBody()', e);
                return APP.util.sendJSONBody(res, APP.ERROR.INVALID_PARAMETERS);
            }

            callback(params);
        });
    };


    //
    // Parse JSON data from a request.
    //
    APP.util.parseJSONBody = function (req, res, callback) {
        APP.util.parseSocketBody(req, function (err, body) {
            var params;

            if (err) {
                console.error('parseJSONBody()', err);
                return APP.util.sendJSONBody(res, APP.ERROR.INVALID_PARAMETERS);
            }

            try {
                params = JSON.parse(body);
            } catch (e) {
                console.error('parseJSONBody()', e);
                return APP.util.sendJSONBody(res, APP.ERROR.INVALID_PARAMETERS);
            }

            if (!params.session_token) {
                params.session_token = req.headers['x-session-token'];
            }

            callback(params);
        });
    };


    //
    // Send JSON response to a client.
    //
    APP.util.sendJSONBody = function (res, content) {
        var body = '{}';

        try {
            body = JSON.stringify(content);
        } catch (e) {}

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(body);
    };


    //
    // Send email via Mailgun.
    //
    APP.util.sendEmail = function (address, subject, html, callback) {
        APP.util.request({
            method: 'POST',
            host: 'api.mailgun.net',
            path: '/v3/example.org/messages',
            username: 'suer',
            password: 'fcvgbhnklertyuiopdfghjklrtyuio',
            https: true
        }, { 
            from: APP.CONFIG.EMAIL_FROM || 'Untitled <info@example.com>',
            to: address,
            subject: subject,
            html: html
        }, function (err, response) {
            if (APP.util.isFunction(callback)) {
                try {
                    callback(err, JSON.parse(response.body));
                } catch (e) {
                    callback(err || e);
                }
            }
        });
    };


    //
    // Compile HTML template by replaceing all {{variable}}
    // strings with corresponding values.
    //
    APP.util.compileHTMLTemplate = function (templateString, values) {
        var varStart = '\\{\\{';
        var varEnd   = '\\}\\}';
        var names = Object.keys(values).join(varEnd + '|' + varStart);
        var regex = new RegExp(varStart + names + varEnd, 'g');

        return templateString.replace(regex, function (varName) {
            varName = varName.replace('{{', '').replace('}}', '');
            return values[varName];
        });
    };


    //
    // Walk inside a directory hierarcy recursively 
    // and return an array of all file paths found.
    //
    APP.util.getAllFilePathsSync = function (dirPath) {
        var files = [];

        APP.lib.fs.readdirSync(dirPath).forEach(function (filename) {
            var path = APP.lib.path.join(dirPath, filename);
            var stat = APP.lib.fs.statSync(path);

            if (stat && stat.isDirectory()) {
                files = files.concat(APP.util.getAllFilePathsSync(path));
            } else {
                files.push(path);
            }
        });

        return files;
    };


    //
    // Get all files with specified extension and put them into an object.
    // Filename of a file becomes a camelCased key in the object
    // and the content of the file becomes a string value.
    //
    APP.util.getAllFileContentsSync = function (dirPath, extension) {
        var filePaths = APP.util.getAllFilePathsSync(dirPath);
        var newlines  = /\n/g;
        var files     = {};

        filePaths.forEach(function (filePath) {
           if (APP.lib.fs.statSync(filePath).isFile() && filePath.indexOf(extension) !== -1) {
                var fileContent = APP.lib.fs.readFileSync(filePath, 'utf8');
                var fileName    = APP.lib.path.basename(filePath, extension);
                var qName       = APP.util.camelCase(fileName);
                files[qName]    = fileContent.replace(newlines, ' ');
            }
        });

        return files;
    };


    //
    // Convert dashed/underscored string to camelCased one.
    //
    APP.util.camelCase = function (str) { 
        return str.toLowerCase().replace(/-|_(.)/g, function (match, charAfterDash) {
            return charAfterDash.toUpperCase();
        });
    };


    //
    // Create an unique token.
    //
    APP.util.generateToken = function () {
        return APP.lib.uuid.v1();
    };


    //
    // Convert string to md5 hash.
    //
    APP.util.stringToHash = function (str) {
        return APP.lib.crypto.createHash('md5').update(str).digest('hex');
    };


    //
    // Extend an object recursively with properties from other objects.
    //
    APP.util.extend = function (target) {
        var i, obj, prop, objects = Array.prototype.slice.call(arguments, 1);

        target = target || {};

        for (i = 0; i < objects.length; i += 1) {
            obj = objects[i];
            
            if (obj) for (prop in obj) if (obj.hasOwnProperty(prop)) {
                if (Object.prototype.toString.call(obj[prop]) === '[object Object]') {
                    target[prop] = target[prop] || {};
                    APP.util.extend(target[prop], obj[prop]);
                } else {
                    target[prop] = obj[prop];
                }
            }
        }

        return target;
    };


    //
    // Merge any number of objects into a new object.
    //
    APP.util.merge = function () {
        var objects = Array.prototype.slice.call(arguments);
        return APP.util.extend.apply(null, [{}].concat(objects));
    };


    //
    // Convert any number of multi-diemensional array-like objects 
    // into a single flat array.
    //
    // Example:
    //   flatArray(1, 2, [3, 4, [5]], '6', ['7'], { num: 8 }, [9], 10);
    //      => [1, 2, 3, 4, 5, '6', '7', { num: 8 }, 9, 10]
    //
    APP.util.flatArray = function () {
        var flat = [], i, arg, isArrayLike;

        for (i = 0; i < arguments.length; i += 1) {
            arg = arguments[i];
            isArrayLike = arg && typeof arg === 'object' && arg.length !== undefined;

            if (isArrayLike) {
                flat = flat.concat(APP.util.flatArray.apply(null, arg));
            } else {
                flat.push(arg);
            }
        }

        return flat;
    };


    //
    // Prepend zero to a number if it's less then tan.
    // Used for Date objects.
    //
    APP.util.padZero = function (num) {
        return num < 10 ? '0' + num : num;
    };


    //
    // From an array of obejcts find the one 
    // that contains the passed key/value pairs.
    //
    APP.util.findObject = function (objects, searchPairs) {
        if (!Array.isArray(objects) || !APP.util.isObject(searchPairs)) {
            return null;
        }

        var names = Object.keys(searchPairs);
        var i, j, matchesCount;

        for (i = 0; i < objects.length; i += 1) {
            matchesCount = 0;

            for (j = 0; j < names.length; j += 1) {
                if (objects[i][names[j]] == searchPairs[names[j]]) {
                    matchesCount += 1;
                }
            }
            if (names.length === matchesCount) {
                return objects[i];
            }
        }

        return null;
    };


    //
    // Check if variable is a valid object.
    //
    APP.util.isObject = function (obj) {
        return Object.prototype.toString.call(obj) === '[object Object]';
    };


    //
    // Check if variable is a valid date object.
    //
    APP.util.isDate = function (obj) {
        return Object.prototype.toString.call(obj) === '[object Date]';
    };


    //
    // Check if variable is a valid function.
    //
    APP.util.isFunction = function (obj) {
        return typeof obj === 'function';
    };


    //
    // Remove all HTML tags from a string.
    //
    APP.util.stripHtmlTags = function (str) {
        return typeof str === 'string' ? str.replace(/<[^>]+>/ig, '') : '';
    };


    //
    // An empty function. a.k.a noop function.
    //
    APP.util.doNothing = function () {};


};