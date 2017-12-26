APP.TEMPLATE = APP.TEMPLATE || {}; 
APP.TEMPLATE._dashboardReportItem = function _dashboardReportItem (data) {
var __t, __jstml = '';
__jstml += '<li data-response-id="'+
( (__t = (data.response_id)) == null ? '' : __t ) +
'" data-action-status="'+
( (__t = (data.action_status.toLowerCase())) == null ? '' : __t ) +
'">\n    ';
 data.items.forEach(function (item) { 
__jstml += '\n        ';
 if (item.item_settings.categorization_item) { return; } 
__jstml += '\n        ';
 if (item.item_type === 'image') { 
__jstml += '\n            <div class="dashboard-report-image" style="background-image:url('+
( (__t = (APP.fileUrl(APP.escapeHtml(item.value)))) == null ? '' : __t ) +
')"></div>\n        ';
 } else if (item.item_type === 'location-search') { 
__jstml += '\n        ';
 } else if (item.item_type === 'choice') { 
__jstml += '\n        ';
 } else if (item.item_settings.content_role === 'title') { 
__jstml += '\n            <h3>'+
( (__t = (APP.escapeHtml(item.value))) == null ? '' : __t ) +
'</h3>\n        ';
 } else if (item.item_settings.content_role === 'description') { 
__jstml += '\n            <!-- <p>'+
( (__t = (APP.escapeHtml(item.value))) == null ? '' : __t ) +
'</p> -->\n        ';
 } else { 
__jstml += '\n            <!-- <b>'+
( (__t = (item.item_label)) == null ? '' : __t ) +
'</b><br />\n            '+
( (__t = (APP.escapeHtml(item.option_label || item.value))) == null ? '' : __t ) +
'<br /><br /> -->\n        ';
 } 
__jstml += '\n    ';
 }); 
__jstml += '\n    <div class="dashboard-report-status dashboard-report-status-'+
( (__t = (data.action_status.toLowerCase())) == null ? '' : __t ) +
'">'+
( (__t = (APP.LANG.text('action-status-' + data.action_status_id))) == null ? '' : __t ) +
'</div>\n    '+
( (__t = (APP.TEMPLATE._dashboardReportModalContent(data))) == null ? '' : __t ) +
'\n</li>';
return __jstml;

};
APP.TEMPLATE = APP.TEMPLATE || {}; 
APP.TEMPLATE._dashboardReportModalContent = function _dashboardReportModalContent (data) {
var __t, __jstml = '';
__jstml += '<div class="dashboard-report-modal-content">\n    <div class="dashboard-report-modal-content-wrapper">\n        <div class="dashboard-report-modal-status dashboard-report-modal-status-'+
( (__t = (data.action_status.toLowerCase())) == null ? '' : __t ) +
'">\n            <b>'+
( (__t = (APP.LANG.text('website:status'))) == null ? '' : __t ) +
'</b> <span>'+
( (__t = (APP.LANG.text('action-status-' + data.action_status_id))) == null ? '' : __t ) +
'</span>\n        </div>\n        ';
 data.items.forEach(function (item) { 
__jstml += '\n            ';
 if (item.item_type === 'image') { 
__jstml += '\n                <b>'+
( (__t = (item.item_label)) == null ? '' : __t ) +
'</b>\n                <img src="'+
( (__t = (APP.fileUrl(item.value))) == null ? '' : __t ) +
'" />\n            ';
 } else if (item.item_type === 'location-search') {
__jstml += '\n                ';
 if (!data.hideLocationItem) { 
__jstml += '\n                    ';
 if (typeof item.value === 'string') { item.value = JSON.parse(item.value); } 
__jstml += '\n                    <b>'+
( (__t = (item.item_label)) == null ? '' : __t ) +
'</b>\n                    <span>'+
( (__t = (item.value.name)) == null ? '' : __t ) +
'</span>\n                    <div class="dashboard-report-modal-map" data-lat="'+
( (__t = (item.value.lat)) == null ? '' : __t ) +
'" data-lng="'+
( (__t = (item.value.lng)) == null ? '' : __t ) +
'"></div>\n                ';
 } 
__jstml += '\n            ';
 } else { 
__jstml += '\n                <b>'+
( (__t = (item.item_label)) == null ? '' : __t ) +
'</b>\n                <p>'+
( (__t = (APP.escapeHtml(item.option_label || item.value))) == null ? '' : __t ) +
'</p>\n            ';
 } 
__jstml += '\n        ';
 }); 
__jstml += '\n        ';
 if (data.council_message) { 
__jstml += '\n            <b>Council\'s message</b>\n            <p>'+
( (__t = (data.council_message)) == null ? '' : __t ) +
'</p>\n            ';
 if (data.council_uploaded_image) { 
__jstml += '\n                <b>New Photo</b>\n                <img src="'+
( (__t = (APP.fileUrl(data.council_uploaded_image))) == null ? '' : __t ) +
'" />\n            ';
 } 
__jstml += '\n        ';
 } 
__jstml += '\n    </div>\n</div>';
return __jstml;

};
APP.TEMPLATE = APP.TEMPLATE || {}; 
APP.TEMPLATE.about = function about (data) {
var __t, __jstml = '';
__jstml += '<div class="static-page">\n    <div class="st-header">\n        <h2>Sample page header.</h2>\n    </div>\n    <div class="st-content">\n        Sample page content.\n    </div>\n</div>';
return __jstml;

};
APP.TEMPLATE = APP.TEMPLATE || {}; 
APP.TEMPLATE.dashboard = function dashboard (data) {
var __t, __jstml = '';
__jstml += '<div id="map" class="map">\n    <div id="map-canvas" class="map-canvas"></div>\n    <div id="map-player" class="map-player">\n        <input class="date-from" type="text" readonly="readonly" value="">\n        <span class="button-play"></span>\n        <span class="button-pause"></span>\n        <input class="date-to" type="text" readonly="readonly" value="">\n        <div class="sub-controls">\n            <span class="button-stop"></span>\n            <span class="button-prev"></span>\n            <span class="button-next"></span>\n            <div class="slider-line"></div>\n        </div>\n    </div>\n</div>\n\n<ul class="dashboard-tabs">\n    <li href="/" class="tab-active">\n        <span>'+
( (__t = (APP.LANG.text('all-reports'))) == null ? '' : __t ) +
'</span>\n    </li>\n    ';
 data.categorizationItem.options.forEach(function (option) { 
__jstml += '\n        <li href="/?item_id='+
( (__t = (data.categorizationItem.id)) == null ? '' : __t ) +
'&amp;option_id='+
( (__t = (option.id)) == null ? '' : __t ) +
'" data-item-id="'+
( (__t = (data.categorizationItem.id)) == null ? '' : __t ) +
'" data-option-id="'+
( (__t = (option.id)) == null ? '' : __t ) +
'">\n            <span>'+
( (__t = (option.label)) == null ? '' : __t ) +
'</span>\n        </li>\n    ';
 }); 
__jstml += '\n</ul>\n\n\n<div class="dashboard-reports">\n    <h2>'+
( (__t = (APP.LANG.text('reports'))) == null ? '' : __t ) +
'</h2>\n    <ul id="dashboard-reports-container"></ul>\n</div>\n\n<div id="footer" class="footer"><div>&copy; ImproveYourCity</div></div>';
return __jstml;

};
APP.TEMPLATE = APP.TEMPLATE || {}; 
APP.TEMPLATE.form = APP.TEMPLATE.form || {}; 
APP.TEMPLATE.form._itemDropdown = function _itemDropdown (data) {
var __t, __jstml = '';
__jstml += '';
 if (data.settings.allow_multiple === false) { 
__jstml += '\n    ';
 if (data.options.length === 2) { 
__jstml += '\n        <div class="form-radio-buttons">\n            ';
 data.options.forEach(function (option) { 
__jstml += '\n                <label><input type="radio" name="radio-'+
( (__t = (data.id)) == null ? '' : __t ) +
'" value="'+
( (__t = (option.id)) == null ? '' : __t ) +
'">'+
( (__t = (option.label)) == null ? '' : __t ) +
'</label>\n            ';
 }); 
__jstml += '\n        </div>\n    ';
 } else { 
__jstml += '\n        <select>\n            <option></option>\n            ';
 data.options.forEach(function (option) { 
__jstml += '\n                <option value="'+
( (__t = (option.id)) == null ? '' : __t ) +
'">'+
( (__t = (option.label)) == null ? '' : __t ) +
'</option>\n            ';
 }); 
__jstml += '\n        </select>\n    ';
 } 
__jstml += '\n';
 } 
__jstml += '';
return __jstml;

};
APP.TEMPLATE = APP.TEMPLATE || {}; 
APP.TEMPLATE.form = APP.TEMPLATE.form || {}; 
APP.TEMPLATE.form._itemImage = function _itemImage (data) {
var __t, __jstml = '';
__jstml += '<label><input type="file" accept="image/jpeg, image/png, image/gif" />Upload</label>\n<div class="form-image-thumbnails"></div>';
return __jstml;

};
APP.TEMPLATE = APP.TEMPLATE || {}; 
APP.TEMPLATE.form = APP.TEMPLATE.form || {}; 
APP.TEMPLATE.form._itemLocationSearch = function _itemLocationSearch (data) {
var __t, __jstml = '';
__jstml += '<div class="form-map">\n    <div class="form-map-canvas"></div>\n    <input type="text" />\n    <ul></ul>\n</div>';
return __jstml;

};
APP.TEMPLATE = APP.TEMPLATE || {}; 
APP.TEMPLATE.form = APP.TEMPLATE.form || {}; 
APP.TEMPLATE.form._itemText = function _itemText (data) {
var __t, __jstml = '';
__jstml += '';
 if (data.settings.multiline) { 
__jstml += '\n    <textarea rows="5" cols="30"></textarea>\n';
 } else { 
__jstml += '\n    <input type="text" />\n';
 } 
__jstml += '';
return __jstml;

};
APP.TEMPLATE = APP.TEMPLATE || {}; 
APP.TEMPLATE.form = APP.TEMPLATE.form || {}; 
APP.TEMPLATE.form._item = function _item (data) {
var __t, __jstml = '';
__jstml += '<div class="form-item" \n     data-id="'+
( (__t = (data.id)) == null ? '' : __t ) +
'"\n     data-type="'+
( (__t = (data.type)) == null ? '' : __t ) +
'"\n     data-is-optional="'+
( (__t = (data.settings.optional)) == null ? '' : __t ) +
'"\n     data-show-if="'+
( (__t = (data.settings.show_if)) == null ? '' : __t ) +
'"\n>\n    <h4>\n        '+
( (__t = (data.label)) == null ? '' : __t ) +
'\n        ';
 if (data.settings.optional) { 
__jstml += '\n            <span>('+
( (__t = (APP.LANG.text('website:optional'))) == null ? '' : __t ) +
')</span>\n        ';
 } 
__jstml += '\n    </h4>\n\n    ';
 if (data.description) { 
__jstml += '\n        <p>'+
( (__t = (data.description)) == null ? '' : __t ) +
'</p>\n    ';
 } 
__jstml += '\n\n    ';
 if (data.type === 'choice') { 
__jstml += '\n        '+
( (__t = (APP.TEMPLATE.form._itemDropdown(data))) == null ? '' : __t ) +
'\n    ';
 } else if (data.type === 'image') { 
__jstml += '\n        '+
( (__t = (APP.TEMPLATE.form._itemImage(data))) == null ? '' : __t ) +
'\n    ';
 } else if (data.type === 'text') { 
__jstml += '\n        '+
( (__t = (APP.TEMPLATE.form._itemText(data))) == null ? '' : __t ) +
'\n    ';
 } else if (data.type === 'location-search') { 
__jstml += '\n        '+
( (__t = (APP.TEMPLATE.form._itemLocationSearch(data))) == null ? '' : __t ) +
'\n    ';
 } 
__jstml += '\n\n    ';
 if (Array.isArray(data.items)) { 
__jstml += '\n        ';
 data.items.forEach(function (subItem) { 
__jstml += '\n            '+
( (__t = (APP.TEMPLATE.form._item(subItem))) == null ? '' : __t ) +
'\n        ';
 }); 
__jstml += '\n    ';
 } 
__jstml += '\n</div>';
return __jstml;

};
APP.TEMPLATE = APP.TEMPLATE || {}; 
APP.TEMPLATE.form = APP.TEMPLATE.form || {}; 
APP.TEMPLATE.form._item_option_dropdown = function _item_option_dropdown (data) {
var __t, __jstml = '';
__jstml += '<div id="map" class="map">\n    <div id="map-canvas" class="map-canvas"></div>\n    <div id="map-filters" class="map-filters">\n        <h3>All reports</h3>\n        ';
 data.categorizationItems.slice(1, 3).forEach(function (item) { 
__jstml += '\n            <h3 data-item-id="'+
( (__t = (item.id)) == null ? '' : __t ) +
'">'+
( (__t = ((item.note || item.label))) == null ? '' : __t ) +
'</h3>\n            <ul>\n                ';
 item.options.forEach(function (option) { 
__jstml += '\n                    <li data-option-id="'+
( (__t = (option.id)) == null ? '' : __t ) +
'">'+
( (__t = (option.label)) == null ? '' : __t ) +
'</li>\n                ';
 }); 
__jstml += '\n            </ul>\n        ';
 }); 
__jstml += '\n    </div>\n</div>\n<div id="form" class="form"></div>';
return __jstml;

};
APP.TEMPLATE = APP.TEMPLATE || {}; 
APP.TEMPLATE.form = APP.TEMPLATE.form || {}; 
APP.TEMPLATE.form.container = function container (data) {
var __t, __jstml = '';
__jstml += '<div id="submit-report-form" class="submit-report-form">\n    <h2>'+
( (__t = (APP.LANG.text('website:submit-report'))) == null ? '' : __t ) +
'</h2>\n    ';
 if (data.form && Array.isArray(data.form.items)) { 
__jstml += '\n        ';
 data.form.items.forEach(function (item) { 
__jstml += '\n            '+
( (__t = (APP.TEMPLATE.form._item(item))) == null ? '' : __t ) +
'\n        ';
 }); 
__jstml += '\n    ';
 } 
__jstml += '\n    <div id="submit-form-error-message" class="form-error-message"></div>\n    <button type="submit" value="" class="form-button">\n        <span>'+
( (__t = (APP.LANG.text('website:submit'))) == null ? '' : __t ) +
'</span>\n        <svg><use xlink:href="/img/sprite.svg#icon-loading"></use></svg>\n    </button>\n</div>';
return __jstml;

};
APP.TEMPLATE = APP.TEMPLATE || {}; 
APP.TEMPLATE.form = APP.TEMPLATE.form || {}; 
APP.TEMPLATE.form.success = function success (data) {
var __t, __jstml = '';
__jstml += '<div class="form-success-message">\n    <h2>'+
( (__t = (APP.LANG.text('website:form-success-message-heading'))) == null ? '' : __t ) +
'</h2>\n    <p>'+
( (__t = (APP.LANG.text('website:form-success-message'))) == null ? '' : __t ) +
'</p>\n</div>';
return __jstml;

};
APP.TEMPLATE = APP.TEMPLATE || {}; 
APP.TEMPLATE.layout = function layout (data) {
var __t, __jstml = '';
__jstml += '<header id="header" class="header">\n    <a id="logo" class="logo" href="/"><img src="/img/logo-en.png" /></a>\n    <nav id="nav" class="nav">\n        <a href="/">'+
( (__t = (APP.LANG.text('website:homepage'))) == null ? '' : __t ) +
'</a>\n        <!-- <a href="/reports">'+
( (__t = (APP.LANG.text('website:browse-reports'))) == null ? '' : __t ) +
'</a> -->\n        <a href="/about">'+
( (__t = (APP.LANG.text('website:about'))) == null ? '' : __t ) +
'</a>\n        <a href="/submit-report">'+
( (__t = (APP.LANG.text('website:submit-report'))) == null ? '' : __t ) +
'</a>\n    </nav>\n</header>\n\n<div id="main" class="main">\n    {{yield}}\n</div>';
return __jstml;

};
APP.TEMPLATE = APP.TEMPLATE || {}; 
APP.TEMPLATE.map = APP.TEMPLATE.map || {}; 
APP.TEMPLATE.map.captions = function captions (data) {
var __t, __jstml = '';
__jstml += '<ul id="map-categories" class="map-categories">\n    <li class="mpc-all-items">\n        <svg><use xlink:href="/img/sprite.svg#circle-2"></use></svg>\n        <span>'+
( (__t = (APP.LANG.text('map-caption-all-items'))) == null ? '' : __t ) +
'</span>\n    </li>\n    ';
 data.options.forEach(function (option) { 
__jstml += '\n        <li class="mpc-item mpc-item-'+
( (__t = (option.settings.icon)) == null ? '' : __t ) +
'" data-item-id="'+
( (__t = (data.id)) == null ? '' : __t ) +
'" data-option-id="'+
( (__t = (option.id)) == null ? '' : __t ) +
'">\n            <svg><use xlink:href="/img/sprite.svg#'+
( (__t = (option.settings.icon)) == null ? '' : __t ) +
'"></use></svg>\n            <span>'+
( (__t = (option.label)) == null ? '' : __t ) +
'</span>\n        </li>\n    ';
 }); 
__jstml += '\n</ul>';
return __jstml;

};
APP.TEMPLATE = APP.TEMPLATE || {}; 
APP.TEMPLATE.map = APP.TEMPLATE.map || {}; 
APP.TEMPLATE.map.markerPopup = function markerPopup (data) {
var __t, __jstml = '';
__jstml += '<div class="map-popup">\n    <span class="mp-date">'+
( (__t = (APP.formatDate(data.datetime))) == null ? '' : __t ) +
'</span>\n    ';
 if (data) data.items.forEach(function (item) { 
__jstml += '\n        ';
 if (item.item_type !== 'text' && (item.value || item.option_label)) { 
__jstml += '\n            <h4>'+
( (__t = (item.item_label.replace(/_/g, ' '))) == null ? '' : __t ) +
'</h4>\n            <p>'+
( (__t = (APP.escapeHtml(item.option_label || item.value))) == null ? '' : __t ) +
'</p>\n        ';
 } 
__jstml += '\n    ';
 }); 
__jstml += '\n</div>';
return __jstml;

};
APP.TEMPLATE = APP.TEMPLATE || {}; 
APP.TEMPLATE.map = APP.TEMPLATE.map || {}; 
APP.TEMPLATE.map.reportsList = function reportsList (data) {
var __t, __jstml = '';
__jstml += '';
 if (Array.isArray(data)) { 
__jstml += '\n    <ul class="map-reports-list">\n        ';
 data.forEach(function (report) { 
__jstml += '\n            '+
( (__t = (APP.TEMPLATE._dashboardReportItem(report))) == null ? '' : __t ) +
'\n        ';
 }); 
__jstml += '\n    </ul>\n';
 } 
__jstml += '';
return __jstml;

};
APP.TEMPLATE = APP.TEMPLATE || {}; 
APP.TEMPLATE.newDashboard = function newDashboard (data) {
var __t, __jstml = '';
__jstml += '';
return __jstml;

};
APP.TEMPLATE = APP.TEMPLATE || {}; 
APP.TEMPLATE.reports = APP.TEMPLATE.reports || {}; 
APP.TEMPLATE.reports._items = function _items (data) {
var __t, __jstml = '';
__jstml += '';
 if (Array.isArray(data.reports)) data.reports.forEach(function (r) { 
__jstml += '\n    <li class="column column-25">\n        <a class="rl-item" href="/view-report?id='+
( (__t = (r.response_id)) == null ? '' : __t ) +
'">\n            <span class="rl-datetime">'+
( (__t = (APP.formatDate(r.datetime))) == null ? '' : __t ) +
'</span>\n            ';
 r.items.forEach(function (item) { 
__jstml += '\n                ';
 if (item.item_settings.show_in_short_story) { 
__jstml += '\n                    ';
 if (item.item_type === 'text') { 
__jstml += '\n                        ';
 if (item.value) { 
__jstml += '\n                            <div class="rli-text">\n                                <span>'+
( (__t = (item.item_label)) == null ? '' : __t ) +
'</span>\n                                <p>'+
( (__t = (APP.escapeHtml(item.value))) == null ? '' : __t ) +
'</p>\n                            </div>\n                        ';
 } 
__jstml += '\n                    ';
 } else { 
__jstml += '\n                        <div class="rli-choice">\n                            <span>'+
( (__t = (item.item_label)) == null ? '' : __t ) +
'</span>\n                            <p>\n                                ';
 if (item.item_type === 'choice' || item.item_type === 'scale' || item.item_type === 'location-choice') { 
__jstml += '\n                                    '+
( (__t = (item.option_label)) == null ? '' : __t ) +
'\n                                ';
 } else { 
__jstml += '\n                                    '+
( (__t = (APP.escapeHtml(item.value || 'No Answer'))) == null ? '' : __t ) +
'\n                                ';
 } 
__jstml += '\n                            </p>\n                        </div>\n                    ';
 } 
__jstml += '\n                ';
 } 
__jstml += '\n            ';
 }); 
__jstml += '\n        </a>\n    </li>\n';
 }); 
__jstml += '';
return __jstml;

};
APP.TEMPLATE = APP.TEMPLATE || {}; 
APP.TEMPLATE.reports = APP.TEMPLATE.reports || {}; 
APP.TEMPLATE.reports.detailedView = function detailedView (data) {
var __t, __jstml = '';
__jstml += '<div id="report-view" class="report-view">\n\n    ';
 if (data.report) { 
__jstml += '\n        ';
 var r = data.report; 
__jstml += '\n\n        <div class="rv-header">\n            <h2>'+
( (__t = (APP.formatDate(r.datetime))) == null ? '' : __t ) +
'</h2>\n            <a href="/reports" data-translation-key="back-to-reports-browser"></a>\n        </div>\n\n        <div class="rv-content">\n            ';
 r.items.forEach(function (item) { 
__jstml += '\n                ';
 if (item.item_type === 'text') { 
__jstml += '\n                    ';
 if (item.value) { 
__jstml += '\n                        <div class="rli-text">\n                            <span>'+
( (__t = (item.item_label)) == null ? '' : __t ) +
'</span>\n                            <p>'+
( (__t = (APP.escapeHtml(item.value))) == null ? '' : __t ) +
'</p>\n                        </div>\n                    ';
 } 
__jstml += '\n                ';
 } else { 
__jstml += '\n                    <div class="rli-choice">\n                        <span>'+
( (__t = (item.item_label)) == null ? '' : __t ) +
'</span>\n                        <p>\n                            ';
 if (item.item_type === 'choice' || item.item_type === 'scale' || item.item_type === 'location-choice') { 
__jstml += '\n                                '+
( (__t = (item.option_label)) == null ? '' : __t ) +
'\n                            ';
 } else { 
__jstml += '\n                                '+
( (__t = (APP.escapeHtml(item.value || 'No Answer'))) == null ? '' : __t ) +
'\n                            ';
 } 
__jstml += '\n                        </p>\n                    </div>\n                ';
 } 
__jstml += '\n            ';
 }); 
__jstml += '\n        </div>\n\n    ';
 } 
__jstml += '\n\n</div>';
return __jstml;

};
APP.TEMPLATE = APP.TEMPLATE || {}; 
APP.TEMPLATE.reports = APP.TEMPLATE.reports || {}; 
APP.TEMPLATE.reports.list = function list (data) {
var __t, __jstml = '';
__jstml += '<div id="reports-list" class="reports-list">\n    <div class="rl-header">\n        <h2 data-translation-key="browse-reports"></h2>\n        <div class="rl-date-filters">\n            <h3 data-translation-key="filter-by-date"></h3>\n            <input type="text" name="date-from" value="" />\n            <input type="text" name="date-to" value="" />\n            <button data-translation-key="apply-range"></button>\n        </div>\n        <input class="rl-search" data-translation-placeholder-key="search-reports" />\n    </div>\n    <div class="rl-content lazyview">\n        <ul id="rl-items" class="row">\n            '+
( (__t = (APP.TEMPLATE.reports._items(data))) == null ? '' : __t ) +
'\n        </ul>\n        <button class="rl-load-more" data-translation-key="load-more"></button>\n    </div>\n</div>';
return __jstml;

};
