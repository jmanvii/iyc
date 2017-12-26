module.exports = function (APP, ARGV) {
    'use strict';

    ARGV = ARGV || {};

    APP.CONFIG = {

        //
        // APP server.
        //
        HOST: ARGV.host || '127.0.0.1',
        PORT: ARGV.port || 19583,
        

        //
        // Database connection.
        //
        DB_USER: ARGV.dbuser || 'postgres',
        DB_PASS: ARGV.dbpass || 'wertuiop',
        DB_NAME: ARGV.dbname || 'ertuiop',
        PG_HOST: ARGV.pghost || '127.0.0.1',
        PG_PORT: ARGV.pgport || 5432,


        //
        // Misc. 
        //
        UPLOAD_DIR:         ARGV.uploaddir || '../web/public/files',
        EMAIL_FROM:         'EXAMPLE <info@example.org>',
        EMAIL_REGEX:        /[a-zA-Z_.0-9]+@[a-zA-Z0-9]+[.][a-zA-Z.0-9]+/,
        DATE_FORMAT_REGEX:  /[0-9]{4}-[0-9]{2}-[0-9]{2}/,
        FILE_MAX_SIZE:      50 * 1000 * 1000, // 50MB in bytes.
        POST_MAX_SIZE:      20 * 1000 * 1000, // 20MB in bytes.
        SALT_LENGTH:        10,

    };

};
