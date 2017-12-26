BEGIN;



-- Permissions

DROP TABLE IF EXISTS permissions;
CREATE TABLE permissions (
    id              SMALLINT        NOT NULL,
    name            TEXT            NOT NULL,
    description     TEXT            NULL,
    sort_order      SMALLINT        NOT NULL DEFAULT 0,

    PRIMARY KEY (id)
);
INSERT INTO permissions (id, name) VALUES 
(1,    'Owner'), 
(50,   'Administrator'), 
(100,  'Assistant'), 
(150,  'Council'),
(1000, 'User');





-- Generic statuses

DROP TABLE IF EXISTS generic_statuses;
CREATE TABLE generic_statuses (
    id              SMALLINT        NOT NULL,
    name            TEXT            NOT NULL,
    description     TEXT            NULL,
    PRIMARY KEY (id)
);
INSERT INTO generic_statuses (id, name) VALUES 
(-1, 'Deleted'),
(1,  'Active'),
(2,  'Draft'),
(3,  'Revision');





-- Users

DROP TABLE IF EXISTS users;
CREATE TABLE users (
    id              BIGSERIAL       NOT NULL,
    email           TEXT            NOT NULL,
    password        TEXT            NULL,
    permission      SMALLINT        NOT NULL DEFAULT 1000,
    first_name      TEXT            NULL,
    last_name       TEXT            NULL,
    settings        JSONB           NOT NULL DEFAULT '{}',

    PRIMARY KEY (id),
    UNIQUE (email)
);

DROP TABLE IF EXISTS user_tokens;
CREATE TABLE user_tokens (
    token_type      SMALLINT        NOT NULL,
    user_id         BIGINT          NOT NULL, 
    token           TEXT            NOT NULL,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT timezone('UTC'::TEXT, now()),
    expires_at      TIMESTAMPTZ     NOT NULL DEFAULT timezone('UTC'::TEXT, now()) + '24 hour'::interval,

    PRIMARY KEY (token_type, user_id, token),
    UNIQUE (token)
);

DROP TABLE IF EXISTS user_token_types;
CREATE TABLE user_token_types (
    id              SMALLINT        NOT NULL,
    name            TEXT            NOT NULL,
    description     TEXT            NULL,

    PRIMARY KEY (id)
);
INSERT INTO user_token_types (id, name) VALUES 
(1, 'Session'), 
(2, 'Password reset');





-- forms

DROP TABLE IF EXISTS forms;
CREATE TABLE forms (
    id              BIGSERIAL       NOT NULL,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT timezone('UTC'::TEXT, now()),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT timezone('UTC'::TEXT, now()),
    settings        JSONB           NOT NULL DEFAULT '{}',
    status          SMALLINT        NOT NULL DEFAULT 1,
    sort_order      BIGINT          NOT NULL DEFAULT 0,

    PRIMARY KEY (id)
);

DROP TABLE IF EXISTS form_translations;
CREATE TABLE form_translations (
    form_id         BIGINT          NOT NULL, 
    lang            TEXT            NOT NULL,
    title           TEXT            NOT NULL,
    description     TEXT            NULL,

    PRIMARY KEY (form_id, lang)
);


-- form sections

DROP TABLE IF EXISTS form_sections;
CREATE TABLE form_sections (
    id              BIGSERIAL       NOT NULL,
    form_id         BIGINT          NOT NULL, 
    sort_order      BIGINT          NOT NULL DEFAULT 0,
    settings        JSONB           NOT NULL DEFAULT '{}',
    status          SMALLINT        NOT NULL DEFAULT 1,

    PRIMARY KEY (id)
);

DROP TABLE IF EXISTS form_section_translations;
CREATE TABLE form_section_translations (
    section_id      BIGINT          NOT NULL, 
    lang            TEXT            NOT NULL,
    title           TEXT            NOT NULL,
    description     TEXT            NULL,

    PRIMARY KEY (section_id, lang)
);


-- form items

DROP TABLE IF EXISTS form_items;
CREATE TABLE form_items (
    id              BIGSERIAL       NOT NULL,
    form_id         BIGINT          NOT NULL, 
    section_id      BIGINT          NOT NULL, 
    parent_id       BIGINT          NOT NULL DEFAULT 0,
    type            SMALLINT        NOT NULL,
    settings        JSONB           NOT NULL DEFAULT '{}',
    sort_order      BIGINT          NOT NULL DEFAULT 0,

    PRIMARY KEY (id)
);

DROP TABLE IF EXISTS form_item_translations;
CREATE TABLE form_item_translations (
    item_id         BIGINT          NOT NULL, 
    lang            TEXT            NOT NULL,
    label           TEXT            NOT NULL,
    description     TEXT            NULL,
    note            TEXT            NULL,

    PRIMARY KEY (item_id, lang)
);

DROP TABLE IF EXISTS form_item_types; 
CREATE TABLE form_item_types (
    id              SMALLINT        NOT NULL,
    name            TEXT            NOT NULL,
    description     TEXT            NULL,
    settings        JSONB           NOT NULL DEFAULT '{}',
    sort_order      BIGINT          NOT NULL DEFAULT 0,

    PRIMARY KEY (id)
);
INSERT INTO form_item_types (id, name, description, settings) VALUES 
(1, 'text', 'Text', '{"jsDataType": "string"}'), 
(2, 'number', 'Number', '{"jsDataType": "number"}'),
(3, 'scale', 'Scale', '{"jsDataType": "array"}'),
(4, 'choice', 'Multiple Choice', '{"jsDataType": "array"}'),
(5, 'location-choice', 'Location Choice', '{"jsDataType": "array"}'),
(6, 'location-search', 'Location Search', '{}'),
(7, 'datetime', 'Date & Time', '{"jsDataType": "date"}'),
(8, 'image', 'Image', '{"jsDataType": "string"}');


-- form item options

DROP TABLE IF EXISTS form_item_options;
CREATE TABLE form_item_options (
    id              BIGSERIAL       NOT NULL,
    form_id         BIGINT          NOT NULL,
    section_id      BIGINT          NOT NULL,
    item_id         BIGINT          NOT NULL,
    value           TEXT            NULL,
    sort_order      BIGINT          NOT NULL DEFAULT 0,
    settings        JSONB           NOT NULL DEFAULT '{}',
    status          SMALLINT        NOT NULL DEFAULT 1,

    PRIMARY KEY (id)
);

DROP TABLE IF EXISTS form_item_option_translations;
CREATE TABLE form_item_option_translations (
    option_id       BIGINT          NOT NULL, 
    lang            TEXT            NOT NULL,
    label           TEXT            NOT NULL,

    PRIMARY KEY (option_id, lang)
);


-- form responses

DROP TABLE IF EXISTS form_responses;
CREATE TABLE form_responses (
    id                      BIGSERIAL       NOT NULL,
    form_id                 BIGINT          NOT NULL, 
    created_at              TIMESTAMPTZ     NOT NULL DEFAULT timezone('UTC'::TEXT, now()),
    updated_at              TIMESTAMPTZ     NOT NULL DEFAULT timezone('UTC'::TEXT, now()),
    datetime                TIMESTAMPTZ     NOT NULL DEFAULT timezone('UTC'::TEXT, now()),
    user_id                 BIGINT          NULL,
    status                  SMALLINT        NOT NULL DEFAULT 2,
    action_status           SMALLINT        NOT NULL DEFAULT 2,
    council_uploaded_image  TEXT            NULL,
    council_message         TEXT            NULL,

    PRIMARY KEY (id)
);

DROP TABLE IF EXISTS form_response_items;
CREATE TABLE form_response_items (
    id              BIGSERIAL       NOT NULL,
    response_id     BIGINT          NOT NULL,
    form_id         BIGINT          NOT NULL,
    item_id         BIGINT          NOT NULL,
    option_id       BIGINT          NULL,
    value           TEXT            NULL,

    PRIMARY KEY (id),
    UNIQUE(response_id, form_id, item_id, option_id)
);

DROP TABLE IF EXISTS form_response_item_translations;
CREATE TABLE form_response_item_translations (
    response_item_id    BIGINT          NOT NULL, 
    lang                TEXT            NOT NULL,
    value               TEXT            NULL,

    PRIMARY KEY (response_item_id, lang)
);

DROP TABLE IF EXISTS form_response_intervals;
CREATE TABLE form_response_intervals (
    id              BIGSERIAL       NOT NULL,
    form_id         BIGINT          NOT NULL, 
    starts_at       TIMESTAMPTZ     NOT NULL DEFAULT timezone('UTC'::TEXT, now()),
    ends_at         TIMESTAMPTZ     NOT NULL DEFAULT timezone('UTC'::TEXT, now()),
    sort_order      BIGINT          NOT NULL DEFAULT 0,
    settings        JSONB           NOT NULL DEFAULT '{}',

    PRIMARY KEY (id)
);

DROP TABLE IF EXISTS form_response_interval_translations;
CREATE TABLE form_response_interval_translations (
    interval_id     BIGINT          NOT NULL, 
    lang            TEXT            NOT NULL,
    name            TEXT            NOT NULL,
    description     TEXT            NULL,

    PRIMARY KEY (interval_id, lang)
);

-- Generic statuses

DROP TABLE IF EXISTS action_statuses;
CREATE TABLE action_statuses (
    id              SMALLINT        NOT NULL,
    name            TEXT            NOT NULL,
    description     TEXT            NULL,
    PRIMARY KEY (id)
);
INSERT INTO action_statuses (id, name) VALUES 
(0, 'Declined'),
(1, 'Completed'),
(2, 'Received');





-- Languages

DROP TABLE IF EXISTS languages;
CREATE TABLE languages (
    code            TEXT            NOT NULL,
    name            TEXT            NOT NULL,
    native_name     TEXT            NULL,
    sort_order      SMALLINT        NOT NULL DEFAULT 0,
    enabled         BOOLEAN         NOT NULL DEFAULT false,
    rtl             BOOLEAN         NOT NULL DEFAULT false,
    settings        JSONB           NOT NULL DEFAULT '{}',

    PRIMARY KEY (code)
);
INSERT INTO languages (code, name, native_name) VALUES 
('aa', 'Afar', 'Afaraf'),
('ab', 'Abkhazian', 'аҧсуа'),
('af', 'Afrikaans', 'Afrikaans'),
('ak', 'Akan', 'Akan'),
('sq', 'Albanian', 'Shqip'),
('am', 'Amharic', 'አማርኛ'),
('ar', 'Arabic', 'العربية'),
('an', 'Aragonese', 'Aragonés'),
('hy', 'Armenian', 'Հայերեն'),
('as', 'Assamese', 'অসমীয়া'),
('av', 'Avaric', 'авар мацӀ, магӀарул мацӀ'),
('ae', 'Avestan', 'avesta'),
('ay', 'Aymara', 'aymar aru'),
('az', 'Azerbaijani', 'azərbaycan dili'),
('ba', 'Bashkir', 'башҡорт теле'),
('bm', 'Bambara', 'bamanankan'),
('eu', 'Basque', 'euskara, euskera'),
('be', 'Belarusian', 'Беларуская'),
('bn', 'Bengali', 'বাংলা'),
('bh', 'Bihari languages', 'भोजपुरी'),
('bi', 'Bislama', 'Bislama'),
('bs', 'Bosnian', 'bosanski jezik'),
('br', 'Breton', 'brezhoneg'),
('bg', 'Bulgarian', 'български език'),
('my', 'Burmese', 'ဗမာစာ'),
('ca', 'Catalan; Valencian', 'Català'),
('ch', 'Chamorro', 'Chamoru'),
('ce', 'Chechen', 'нохчийн мотт'),
('zh', 'Chinese', '中文 (Zhōngwén), 汉语, 漢語'),
('cu', 'Church Slavic; Old Slavonic; Church Slavonic; Old Bulgarian; Old Church Slavonic', 'ѩзыкъ словѣньскъ'),
('cv', 'Chuvash', 'чӑваш чӗлхи'),
('kw', 'Cornish', 'Kernewek'),
('co', 'Corsican', 'corsu, lingua corsa'),
('cr', 'Cree', 'ᓀᐦᐃᔭᐍᐏᐣ'),
('cs', 'Czech', 'česky, čeština'),
('da', 'Danish', 'dansk'),
('dv', 'Divehi; Dhivehi; Maldivian', 'ދިވެހި'),
('nl', 'Dutch; Flemish', 'Nederlands, Vlaams'),
('dz', 'Dzongkha', 'Dzongkha'),
('en', 'English', 'English'),
('eo', 'Esperanto', 'Esperanto'),
('et', 'Estonian', 'eesti, eesti keel'),
('ee', 'Ewe', 'Eʋegbe'),
('fa', 'Farsi (Persian)', 'فارسی'),
('fo', 'Faroese', 'føroyskt'),
('fj', 'Fijian', 'vosa Vakaviti'),
('fi', 'Finnish', 'suomi, suomen kieli'),
('fr', 'French', 'français, langue française'),
('fy', 'Western Frisian', 'Frysk'),
('ff', 'Fulah', 'Fulfulde, Pulaar, Pular'),
('ka', 'Georgian', 'ქართული'),
('de', 'German', 'Deutsch'),
('gd', 'Gaelic; Scottish Gaelic', 'Gàidhlig'),
('ga', 'Irish', 'Gaeilge'),
('gl', 'Galician', 'Galego'),
('gv', 'Manx', 'Gaelg, Gailck'),
('el', 'Greek, Modern (1453-)', 'Ελληνικά'),
('gn', 'Guarani', 'Avañeẽ'),
('gu', 'Gujarati', 'ગુજરાતી'),
('ht', 'Haitian; Haitian Creole', 'Kreyòl ayisyen'),
('ha', 'Hausa', 'Hausa, هَوُسَ'),
('he', 'Hebrew', 'עברית'),
('hz', 'Herero', 'Otjiherero'),
('hi', 'Hindi', 'हिन्दी, हिंदी'),
('ho', 'Hiri Motu', 'Hiri Motu'),
('hr', 'Croatian', 'hrvatski'),
('hu', 'Hungarian', 'Magyar'),
('ig', 'Igbo', 'Asụsụ Igbo'),
('is', 'Icelandic', 'Íslenska'),
('io', 'Ido', 'Ido'),
('ii', 'Sichuan Yi; Nuosu', 'ꆈꌠ꒿ Nuosuhxop'),
('iu', 'Inuktitut', 'ᐃᓄᒃᑎᑐᑦ'),
('ie', 'Interlingue; Occidental', 'Originally called Occidental; then Interlingue after WWII'),
('ia', 'Interlingua (International Auxiliary Language Association)', 'Interlingua'),
('id', 'Indonesian', 'Bahasa Indonesia'),
('ik', 'Inupiaq', 'Iñupiaq, Iñupiatun'),
('it', 'Italian', 'Italiano'),
('jv', 'Javanese', 'basa Jawa'),
('ja', 'Japanese', '日本語 (にほんご／にっぽんご)'),
('kl', 'Kalaallisut; Greenlandic', 'kalaallisut, kalaallit oqaasii'),
('kn', 'Kannada', 'ಕನ್ನಡ'),
('ks', 'Kashmiri', 'कश्मीरी, كشميري‎'),
('kr', 'Kanuri', 'Kanuri'),
('kk', 'Kazakh', 'Қазақ тілі'),
('km', 'Central Khmer', 'ភាសាខ្មែរ'),
('ki', 'Kikuyu; Gikuyu', 'Gĩkũyũ'),
('rw', 'Kinyarwanda', 'Ikinyarwanda'),
('ky', 'Kirghiz; Kyrgyz', 'кыргыз тили'),
('kv', 'Komi', 'коми кыв'),
('kg', 'Kongo', 'KiKongo'),
('ko', 'Korean', '한국어 (韓國語), 조선말 (朝鮮語)'),
('kj', 'Kuanyama; Kwanyama', 'Kuanyama'),
('ku', 'Kurdish', 'Kurdî, كوردی‎'),
('lo', 'Lao', 'ພາສາລາວ'),
('la', 'Latin', 'latine, lingua latina'),
('lv', 'Latvian', 'latviešu valoda'),
('li', 'Limburgan; Limburger; Limburgish', 'Limburgs'),
('ln', 'Lingala', 'Lingála'),
('lt', 'Lithuanian', 'lietuvių kalba'),
('lb', 'Luxembourgish; Letzeburgesch', 'Lëtzebuergesch'),
('lu', 'Luba-Katanga', ''),
('lg', 'Ganda', 'Luganda'),
('mk', 'Macedonian', 'македонски јазик'),
('mh', 'Marshallese', 'Kajin M̧ajeļ'),
('ml', 'Malayalam', 'മലയാളം'),
('mi', 'Maori', 'te reo Māori'),
('mr', 'Marathi', 'मराठी'),
('ms', 'Malay', 'bahasa Melayu, بهاس ملايو‎'),
('mg', 'Malagasy', 'Malagasy fiteny'),
('mt', 'Maltese', 'Malti'),
('mn', 'Mongolian', 'монгол'),
('na', 'Nauru', 'Ekakairũ Naoero'),
('nv', 'Navajo; Navaho', 'Diné bizaad, Dinékʼehǰí'),
('nr', 'Ndebele, South; South Ndebele', 'isiNdebele'),
('nd', 'Ndebele, North; North Ndebele', 'isiNdebele'),
('ng', 'Ndonga', 'Owambo'),
('ne', 'Nepali', 'नेपाली'),
('nn', 'Norwegian Nynorsk; Nynorsk, Norwegian', 'Norsk nynorsk'),
('nb', 'Bokmål, Norwegian; Norwegian Bokmål', 'Norsk bokmål'),
('no', 'Norwegian', 'Norsk'),
('ny', 'Chichewa; Chewa; Nyanja', 'chiCheŵa, chinyanja'),
('oc', 'Occitan (post 1500); Provençal', 'Occitan'),
('oj', 'Ojibwa', 'ᐊᓂᔑᓈᐯᒧᐎᓐ'),
('or', 'Oriya', 'ଓଡ଼ିଆ'),
('om', 'Oromo', 'Afaan Oromoo'),
('os', 'Ossetian; Ossetic', 'ирон æвзаг'),
('pa', 'Panjabi; Punjabi', 'ਪੰਜਾਬੀ, پنجابی‎'),
('pi', 'Pali', 'पाऴि'),
('pl', 'Polish', 'polski'),
('pt', 'Portuguese', 'Português'),
('ps', 'Pushto; Pashto', 'پښتو'),
('qu', 'Quechua', 'Runa Simi, Kichwa'),
('rm', 'Romansh', 'rumantsch grischun'),
('ro', 'Romanian; Moldavian; Moldovan', 'română'),
('rn', 'Rundi', 'kiRundi'),
('ru', 'Russian', 'русский язык'),
('sg', 'Sango', 'yângâ tî sängö'),
('sa', 'Sanskrit', 'संस्कृतम्'),
('si', 'Sinhala; Sinhalese', 'සිංහල'),
('sk', 'Slovak', 'slovenčina'),
('sl', 'Slovenian', 'slovenščina'),
('se', 'Northern Sami', 'Davvisámegiella'),
('sm', 'Samoan', 'gagana faa Samoa'),
('sn', 'Shona', 'chiShona'),
('sd', 'Sindhi', 'सिन्धी, سنڌي، سندھی‎'),
('so', 'Somali', 'Soomaaliga, af Soomaali'),
('st', 'Sotho, Southern', 'Sesotho'),
('es', 'Spanish; Castilian', 'español, castellano'),
('sc', 'Sardinian', 'sardu'),
('sr', 'Serbian', 'српски језик'),
('ss', 'Swati', 'SiSwati'),
('su', 'Sundanese', 'Basa Sunda'),
('sw', 'Swahili', 'Kiswahili'),
('sv', 'Swedish', 'svenska'),
('ty', 'Tahitian', 'Reo Tahiti'),
('ta', 'Tamil', 'தமிழ்'),
('tt', 'Tatar', 'татарча, tatarça, تاتارچا‎'),
('te', 'Telugu', 'తెలుగు'),
('tg', 'Tajik', 'тоҷикӣ, toğikī, تاجیکی‎'),
('tl', 'Tagalog', 'Wikang Tagalog, ᜏᜒᜃᜅ᜔ ᜆᜄᜎᜓᜄ᜔'),
('th', 'Thai', 'ไทย'),
('bo', 'Tibetan', 'བོད་ཡིག'),
('ti', 'Tigrinya', 'ትግርኛ'),
('to', 'Tonga (Tonga Islands)', 'faka Tonga'),
('tn', 'Tswana', 'Setswana'),
('ts', 'Tsonga', 'Xitsonga'),
('tk', 'Turkmen', 'Türkmen, Түркмен'),
('tr', 'Turkish', 'Türkçe'),
('tw', 'Twi', 'Twi'),
('ug', 'Uighur; Uyghur', 'Uyƣurqə, ئۇيغۇرچە‎'),
('uk', 'Ukrainian', 'українська'),
('ur', 'Urdu', 'اردو'),
('uz', 'Uzbek', 'zbek, Ўзбек, أۇزبېك‎'),
('ve', 'Venda', 'Tshivenḓa'),
('vi', 'Vietnamese', 'Tiếng Việt'),
('vo', 'Volapük', 'Volapük'),
('cy', 'Welsh', 'Cymraeg'),
('wa', 'Walloon', 'Walon'),
('wo', 'Wolof', 'Wollof'),
('xh', 'Xhosa', 'isiXhosa'),
('yi', 'Yiddish', 'ייִדיש'),
('yo', 'Yoruba', 'Yorùbá'),
('za', 'Zhuang; Chuang', 'Saɯ cueŋƅ, Saw cuengh'),
('zu', 'Zulu', 'Zulu');

UPDATE languages SET rtl = true WHERE code IN ('ar', 'he', 'fa', 'ur');





-- UI text translations

DROP TABLE IF EXISTS ui_translations;
CREATE TABLE ui_translations (
    lang            TEXT            NOT NULL,
    t_group         TEXT            NOT NULL,
    t_key           TEXT            NOT NULL, 
    t_value         TEXT            NULL,

    PRIMARY KEY (lang, t_group, t_key)
);

INSERT INTO ui_translations (lang, t_group, t_key, t_value) VALUES
('en', 'admin-errors', 'server-error', 'Unknown error occurred on the server. Please try again later or contact us at <b>info@example.org</b>.'),
('en', 'admin-errors', 'empty-fields', 'All fields are required.'),
('en', 'admin-errors', 'invalid-credentials', 'Email or password is incorrect.'),
('en', 'admin-errors', 'invalid-email', 'Invalid email address.'),
('en', 'admin-errors', 'invalid-phone-number', 'Invalid phone number.'),
('en', 'admin-errors', 'email-exists', 'User with this email address already exists.'),
('en', 'admin-errors', 'password-length', 'Password must have minimum of 8 characters.'),
('en', 'admin-errors', 'password-nomatch', 'Passwords do not match.'),
('en', 'admin-errors', 'unknown-email', 'Sorry, we could not find anyone with that email address.'),
('en', 'admin-errors', 'invalid-password-token', 'Passwords reset link is expired. <a href="/reset-password">Try again.</a>'),
('en', 'admin-errors', 'missing-current-password', 'Current password field is empty.'),
('en', 'admin-errors', 'wrong-password', 'Current password is incorrect.'),
('en', 'admin-errors', 'new-password-nomatch', 'New passwords do not match.'),
('en', 'admin-errors', 'at-least-one-language-is-required', 'You must have at least one language in the list.');

INSERT INTO ui_translations (lang, t_group, t_key, t_value) VALUES
('en', 'admin-labels', 'admin-head-title', 'DataPage Admin'),
('en', 'admin-labels', 'nav-reports', 'Data submissions'),
('en', 'admin-labels', 'nav-translations', 'Translations'),
('en', 'admin-labels', 'nav-form-translations', 'Form'),
('en', 'admin-labels', 'nav-ui-translations', 'User Interface'),
('en', 'admin-labels', 'nav-datalab', 'Datalab'),
('en', 'admin-labels', 'search-placeholder', 'Search'),
('en', 'admin-labels', 'filter-by-status', 'Filter by status'),
('en', 'admin-labels', 'filter-none', 'All'),
('en', 'admin-labels', 'filter-draft', 'Draft'),
('en', 'admin-labels', 'filter-active', 'Active'),
('en', 'admin-labels', 'filter-by-date', 'Date range'),
('en', 'admin-labels', 'item-status', 'Status:'),
('en', 'admin-labels', 'item-action-status', 'Action:'),
('en', 'admin-labels', 'button-approve', 'Approve'),
('en', 'admin-labels', 'button-edit', 'Edit'),
('en', 'admin-labels', 'button-delete', 'Delete'),
('en', 'admin-labels', 'no-response', 'No response'),
('en', 'admin-labels', 'login', 'Log In'),
('en', 'admin-labels', 'signup', 'Sign Up'),
('en', 'admin-labels', 'logout', '&larr; Log out'),
('en', 'admin-labels', 'forgot-password', 'Forgot password?'),
('en', 'admin-labels', 'no-account-yet', 'Don''t have an account yet?'),
('en', 'admin-labels', 'email', 'Email'),
('en', 'admin-labels', 'email-address', 'Email address'),
('en', 'admin-labels', 'username', 'Email or Username'),
('en', 'admin-labels', 'mobile', 'Mobile phone'),
('en', 'admin-labels', 'password', 'Password'),
('en', 'admin-labels', 'repeat-password', 'Repeat Password'),
('en', 'admin-labels', 'current-password', 'Current Password'),
('en', 'admin-labels', 'new-password', 'New password'),
('en', 'admin-labels', 'repeat-new-password', 'Repeat new password'),
('en', 'admin-labels', 'reset-password-instruction', 'Enter your email address below and we will send you password reset instructions.'),
('en', 'admin-labels', 'password-reset-email-sent', 'Email sent. Check your inbox to see password reset instructions.'),
('en', 'admin-labels', 'reset-password', 'Reset Password'),
('en', 'admin-labels', 'password-change-success-message', 'Password has changed successfully.'),
('en', 'admin-labels', 'change-password', 'Change Password'),
('en', 'admin-labels', 'change-password-note', 'Leave blank if you don''t want to change it.'),
('en', 'admin-labels', 'go-back-to-login', '&larr; Go back to log in'),
('en', 'admin-labels', 'go-to-homepage', '&larr; Go back to homepage'),
('en', 'admin-labels', 'save-form', 'Save'),
('en', 'admin-labels', 'form-saved', 'Saved!'),
('en', 'admin-labels', 'apply-filters', 'Apply'),
('en', 'admin-labels', 'delete-response-modal-title', 'Are you sure?'),
('en', 'admin-labels', 'delete-response-modal-description', 'The response will be deleted.');



COMMIT;
