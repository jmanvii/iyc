(function () {
    'use strict';
    
    APP.DASHBOARD = {};


    APP.DASHBOARD.render = function (data) {
        APP.service.getFormCategorizationItem({ lang: data.lang }, function (response) {
            data.categorizationItem = response.data;

            APP.render(APP.TEMPLATE.dashboard, data);
            APP.route.afterRender(data);

            APP.service.getFormResponses({ lang: data.lang, form_id: data.form.id }, function (response) {
                if (!response.error) {
                    renderResponses(response.data);
                    APP.MAP.create('#map', data);
                }
            });

            jQuery('.dashboard-tabs li').on('click', function () {
                var itemId = this.getAttribute('data-item-id');
                var optionId = this.getAttribute('data-option-id');

                jQuery('.dashboard-tabs li').removeClass('tab-active');
                jQuery(this).addClass('tab-active');

                APP.service.getFormResponses({ 
                    lang: data.lang, 
                    form_id: data.form.id, 
                    item_id: itemId, 
                    option_id: optionId
                }, function (response) {
                    if (!response.error) {
                        renderResponses(response.data);
                    }
                });
            });
        });
    };


    function renderResponses(responses) {
        var container = jQuery('#dashboard-reports-container').html('');
        responses.forEach(function (r) {
            var li = jQuery(APP.TEMPLATE._dashboardReportItem(r));

            var modal;
            var modalSettings = {
                autoOpen: false,
                height: 600,
                width: 700,
                modal: true,
                buttons: {}
            };

            // modalSettings.buttons[APP.LANG.text('website:close')] = function () {
            //     modal.dialog('close');
            // };
            modal = jQuery(li.find('.dashboard-report-modal-content')).dialog(modalSettings);
            var modalEl = jQuery('.ui-dialog[aria-describedby="' + modal.attr('id') + '"]');
            var btnClose = jQuery('<svg class="ui-dialog-button-close"><use xlink:href="/img/sprite.svg#close"></use></svg>');
            modalEl.append(btnClose);

            btnClose.on('click', function () {
                modal.dialog('close');
            });

            li.on('click', function () {
                modal.dialog('open');

                var mapElem = modal.find('.dashboard-report-modal-map');
                var lat = mapElem.attr('data-lat');
                var lng = mapElem.attr('data-lng');

                if (!li.leafletMap) {
                    li.leafletMap = L.map(mapElem[0], { scrollWheelZoom: APP.config.mapDefaults.scrollWheelZoom });

                    L.gridLayer.googleMutant({
                        type: 'hybrid'
                    }).addTo(li.leafletMap);

                    li.leafletMapMarker = new L.marker([lat, lng], {
                        draggable: false,
                        icon: L.icon({
                            iconUrl: '/img/map-marker.png',
                            iconSize: [48, 48]
                        }),
                        bounceOnAdd: true
                    }).addTo(li.leafletMap);
                }
                
                li.leafletMap.setView([lat, lng], APP.config.mapDefaults.zoom);
                li.leafletMapMarker.setLatLng([lat, lng]);
            });

            container.append(li);
        });
    }

})();