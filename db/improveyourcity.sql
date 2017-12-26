-------------------------------
-- super user, languages
-------------------------------
BEGIN;
INSERT INTO users VALUES (1, 'admin', '$2a$10$wX8F6RVwPyfSnZ/f.snkjeHcwFP8XDoXGNi1WwwoO0wuHRHlH0gja', 1, null, null, '{}');
INSERT INTO users VALUES (2, 'council-1', '$2a$10$LDLRb7Paht5tyW9fmJInB.5jiOBKtbXB1KkYOHsi5OSomQW4vnaOK', 150, null, null, '{ "is_council": true, "council_email": "example@example.com" }');
INSERT INTO users VALUES (3, 'council-2', '$2a$10$LDLRb7Paht5tyW9fmJInB.5jiOBKtbXB1KkYOHsi5OSomQW4vnaOK', 150, null, null, '{ "is_council": true, "council_email": "example@example.com" }');
INSERT INTO users VALUES (4, 'council-3', '$2a$10$LDLRb7Paht5tyW9fmJInB.5jiOBKtbXB1KkYOHsi5OSomQW4vnaOK', 150, null, null, '{ "is_council": true, "council_email": "example@example.com" }');
INSERT INTO users VALUES (5, 'council-4', '$2a$10$LDLRb7Paht5tyW9fmJInB.5jiOBKtbXB1KkYOHsi5OSomQW4vnaOK', 150, null, null, '{ "is_council": true, "council_email": "example@example.com" }');
INSERT INTO users VALUES (6, 'council-5', '$2a$10$LDLRb7Paht5tyW9fmJInB.5jiOBKtbXB1KkYOHsi5OSomQW4vnaOK', 150, null, null, '{ "is_council": true, "council_email": "example@example.com" }');
INSERT INTO users VALUES (7, 'council-6', '$2a$10$LDLRb7Paht5tyW9fmJInB.5jiOBKtbXB1KkYOHsi5OSomQW4vnaOK', 150, null, null, '{ "is_council": true, "council_email": "example@example.com" }');
UPDATE languages SET enabled = true WHERE code = 'fa' OR code = 'en';
COMMIT;



-------------------------------
-- ui_translations
-------------------------------
BEGIN;
INSERT INTO ui_translations (lang, t_group, t_key, t_value) VALUES
('en', 'website', 'title', 'Improve Your City'), 
('fa', 'website', 'title', 'بهبود شهر شما'),
('en', 'website', 'form-success-message-heading', 'Thank you!'),
('fa', 'website', 'form-success-message-heading', 'تشکر!'),
('en', 'website', 'form-success-message', 'Your report has been submitted and after validation it will appear on the website.'),
('fa', 'website', 'form-success-message', 'گزارش شما ارسال شده است و پس از بررسی در سایت منتشر خواهد شد.'),
('en', 'website', 'empty-fields', 'All fields are required.'),
('fa', 'website', 'empty-fields', 'همه فیلدها لازم هستند.'),
('en', 'website', 'map-caption-all-items', 'All categories'),
('fa', 'website', 'map-caption-all-items', 'همه دسته بندی ها'),
('en', 'website', 'all-reports', 'All reports'),
('fa', 'website', 'all-reports', 'همه گزارش ها'),
('en', 'website', 'homepage', 'Home'), 
('fa', 'website', 'homepage', 'صفحه نخست'),
('en', 'website', 'about', 'About'), 
('fa', 'website', 'about', 'درباره پروژه'),
('en', 'website', 'browse-reports', 'Browse Reports'), 
('fa', 'website', 'browse-reports', 'جستجو در گزارش ها'),
('en', 'website', 'latest-reports', 'Latest Reports'), 
('fa', 'website', 'latest-reports', 'آخرین گزارش ها'),
('en', 'website', 'back-to-reports-browser', '&larr; Back to reports'), 
('fa', 'website', 'back-to-reports-browser', 'بازگشت به گزارش ها'),
('en', 'website', 'submit-report', 'Submit Report'), 
('fa', 'website', 'submit-report', 'ارسال گزارش'),
('en', 'website', 'update-report', 'Update Report'), 
('fa', 'website', 'update-report', 'به روز رسانی گزارش'),
('en', 'website', 'optional', 'Optional'), 
('fa', 'website', 'optional', 'اختیاری'),
('en', 'website', 'apply-range', 'Apply range'), 
('fa', 'website', 'apply-range', 'محدوده مورد نظر'),
('en', 'website', 'load-more', 'Load more'), 
('fa', 'website', 'load-more', 'بارگذاری گزارش های بیشتر'),
('en', 'website', 'search-reports', 'Type to search...'), 
('fa', 'website', 'search-reports', 'برای جستجو تایپ کنید ...'),
('en', 'website', 'submit', 'Submit'), 
('fa', 'website', 'submit', 'ارسال'),
('en', 'website', 'cancel', 'Cancel'), 
('fa', 'website', 'cancel', 'لغو کردن'),
('en', 'website', 'close', 'Close'), 
('fa', 'website', 'close', 'بستن'),
('en', 'website', 'status', 'Status:'), 
('fa', 'website', 'status', 'وضعیت:'),
('en', 'website', 'action-status-0', 'Declined'), 
('fa', 'website', 'action-status-0', 'کاهش یافته است'),
('en', 'website', 'action-status-1', 'Completed'), 
('fa', 'website', 'action-status-1', 'تکمیل شده'),
('en', 'website', 'action-status-2', 'Received'), 
('fa', 'website', 'action-status-2', 'اخذ شده');
COMMIT;



-------------------------------
-- forms, form_translations, form_sections, form_section_translations
-------------------------------
BEGIN;
INSERT INTO forms VALUES (1, now(), now(), '{}', 1, 0);
INSERT INTO form_translations VALUES (1, 'en', 'Improve Your City', null);
INSERT INTO form_translations VALUES (1, 'fa', 'بهبود شهر شما', null);
INSERT INTO form_sections VALUES (1, 1, 0, '{}', 1);
INSERT INTO form_section_translations VALUES (1, 'en', 'Default section', null);
INSERT INTO form_section_translations VALUES (1, 'fa', 'بخش پیش فرض', null);
COMMIT;



-------------------------------
--  form_items, form_item_translations
-------------------------------
BEGIN;
INSERT INTO form_items VALUES (1, 1, 1, 0, 4, '{ "allow_multiple": false, "categorization_item": true }', 0);
INSERT INTO form_item_translations VALUES (1, 'en', 'Category', 'Please select what type of issue are you reporting.', null);
INSERT INTO form_item_translations VALUES (1, 'fa', 'دسته بندی', null, null);
INSERT INTO form_items VALUES (2, 1, 1, 0, 1, '{ "content_role": "title" }', 0);
INSERT INTO form_item_translations VALUES (2, 'en', 'Title', null, null);
INSERT INTO form_item_translations VALUES (2, 'fa', 'عنوان', null, null);
INSERT INTO form_items VALUES (3, 1, 1, 0, 1, '{ "content_role": "description", "multiline": true }', 0);
INSERT INTO form_item_translations VALUES (3, 'en', 'Description', 'Please describe the issue in details.', null);
INSERT INTO form_item_translations VALUES (3, 'fa', 'توضیح', null, null);
INSERT INTO form_items VALUES (4, 1, 1, 0, 8, '{ "optional": true }', 0);
INSERT INTO form_item_translations VALUES (4, 'en', 'Photo', null, null);
INSERT INTO form_item_translations VALUES (4, 'fa', 'تصویر', null, null);
INSERT INTO form_items VALUES (5, 1, 1, 0, 4, '{ "allow_multiple": false, "linked_to_council": true }', 0);
INSERT INTO form_item_translations VALUES (5, 'en', 'District/Neighborhood', null, null);
INSERT INTO form_item_translations VALUES (5, 'fa', 'منطقه', null, null);
INSERT INTO form_items VALUES (6, 1, 1, 0, 6, '{}', 0);
INSERT INTO form_item_translations VALUES (6, 'en', 'Exact location', 'Use search or drag the map to point exact location with a marker.', null);
INSERT INTO form_item_translations VALUES (6, 'fa', 'محل دقیق', null, null);
INSERT INTO form_items VALUES (7, 1, 1, 0, 1, '{ "optional": true }', 0);
INSERT INTO form_item_translations VALUES (7, 'en', 'Additional address details', null, null);
INSERT INTO form_item_translations VALUES (7, 'fa', 'اطلاعات بیشتر در مورد آدرس', null, null);
INSERT INTO form_items VALUES (8, 1, 1, 0, 4, '{ "allow_multiple": false, "hidden_from_map": true, "hidden_from_public": true }', 0);
INSERT INTO form_item_translations VALUES (8, 'en', 'Contact details', null, null);
INSERT INTO form_item_translations VALUES (8, 'fa', 'مشخصات تماس', null, null);
INSERT INTO form_items VALUES (9, 1, 1, 8, 1, '{ "show_if": 14, "hidden_from_public": true }', 0);
INSERT INTO form_item_translations VALUES (9, 'en', 'Your full name', null, null);
INSERT INTO form_item_translations VALUES (9, 'fa', 'نام کامل شما', null, null);
INSERT INTO form_items VALUES (10, 1, 1, 8, 1, '{ "show_if": 14, "hidden_from_public": true }', 0);
INSERT INTO form_item_translations VALUES (10, 'en', 'Your email address', null, null);
INSERT INTO form_item_translations VALUES (10, 'fa', 'آدرس ایمیل شما', null, null);
-- INSERT INTO form_items VALUES (11, 1, 1, 8, 1, '{ "show_if": 14, "hidden_from_public": true }', 0);
-- INSERT INTO form_item_translations VALUES (11, 'en', 'Your contact number', null, null);
-- INSERT INTO form_item_translations VALUES (11, 'fa', 'شماره تماس خود را', null, null);
COMMIT;



-------------------------------
-- form_item_options, form_item_option_translations
-------------------------------
BEGIN;
INSERT INTO form_item_options VALUES (1, 1, 1, 1, 1, 0, '{ "icon": "graffiti" }', 1);
INSERT INTO form_item_option_translations VALUES (1, 'en', 'Graffiti');
INSERT INTO form_item_option_translations VALUES (1, 'fa', 'دیوارنویسی');
INSERT INTO form_item_options VALUES (2, 1, 1, 1, 2, 0, '{ "icon": "water-leak" }', 1);
INSERT INTO form_item_option_translations VALUES (2, 'en', 'Leaks and Drainage');
INSERT INTO form_item_option_translations VALUES (2, 'fa', 'نشتی آب و فاضلاب');
INSERT INTO form_item_options VALUES (3, 1, 1, 1, 3, 0, '{ "icon": "dumping" }', 1);
INSERT INTO form_item_option_translations VALUES (3, 'en', 'Litter and Illegal Dumping');
INSERT INTO form_item_option_translations VALUES (3, 'fa', 'رها کردن زباله ');
INSERT INTO form_item_options VALUES (4, 1, 1, 1, 4, 0, '{ "icon": "road-defect" }', 1);
INSERT INTO form_item_option_translations VALUES (4, 'en', 'Road or path defects');
INSERT INTO form_item_option_translations VALUES (4, 'fa', 'مشکلات در خیابان یا پیاده روها');
INSERT INTO form_item_options VALUES (5, 1, 1, 1, 5, 0, '{ "icon": "light-bulb" }', 1);
INSERT INTO form_item_option_translations VALUES (5, 'en', 'Street Lighting');
INSERT INTO form_item_option_translations VALUES (5, 'fa', 'نور خیابان');
INSERT INTO form_item_options VALUES (6, 1, 1, 1, 6, 0, '{ "icon": "tree" }', 1);
INSERT INTO form_item_option_translations VALUES (6, 'en', 'Tree and Grass Maintenance');
INSERT INTO form_item_option_translations VALUES (6, 'fa', 'هرس درختان و چمنها');
INSERT INTO form_item_options VALUES (7, 1, 1, 5, 1, 0, '{ "linked_council_id": 2 }', 1);
INSERT INTO form_item_option_translations VALUES (7, 'en', 'Central');
INSERT INTO form_item_option_translations VALUES (7, 'fa', 'مرکزی');
INSERT INTO form_item_options VALUES (8, 1, 1, 5, 2, 0, '{ "linked_council_id": 3 }', 1);
INSERT INTO form_item_option_translations VALUES (8, 'en', 'Bon Rud');
INSERT INTO form_item_option_translations VALUES (8, 'fa', 'شمالی');
INSERT INTO form_item_options VALUES (9, 1, 1, 5, 3, 0, '{ "linked_council_id": 4 }', 1);
INSERT INTO form_item_option_translations VALUES (9, 'en', 'Jarqavieh Olya');
INSERT INTO form_item_option_translations VALUES (9, 'fa', 'غربی');
INSERT INTO form_item_options VALUES (10, 1, 1, 5, 4, 0, '{ "linked_council_id": 5 }', 1);
INSERT INTO form_item_option_translations VALUES (10, 'en', 'Jarqavieh Sofla');
INSERT INTO form_item_option_translations VALUES (10, 'fa', 'شرقی');
INSERT INTO form_item_options VALUES (11, 1, 1, 5, 5, 0, '{ "linked_council_id": 6 }', 1);
INSERT INTO form_item_option_translations VALUES (11, 'en', 'Jolgeh');
INSERT INTO form_item_option_translations VALUES (11, 'fa', 'جنوبی');
INSERT INTO form_item_options VALUES (12, 1, 1, 5, 6, 0, '{ "linked_council_id": 7 }', 1);
INSERT INTO form_item_option_translations VALUES (12, 'en', 'Kuhpayeh');
INSERT INTO form_item_option_translations VALUES (12, 'fa', 'نامعلوم');
INSERT INTO form_item_options VALUES (13, 1, 1, 8, 1, 0, '{}', 1);
INSERT INTO form_item_option_translations VALUES (13, 'en', 'I want to stay anonymous');
INSERT INTO form_item_option_translations VALUES (13, 'fa', 'ناشناس میخواهم بمانم');
INSERT INTO form_item_options VALUES (14, 1, 1, 8, 2, 0, '{}', 1);
INSERT INTO form_item_option_translations VALUES (14, 'en', 'I want to share my contact information');
INSERT INTO form_item_option_translations VALUES (14, 'fa', 'مایل هستم اطلاعات تماسم را به اشتراک بگذارم');
COMMIT;