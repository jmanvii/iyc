(function () {
    'use strict';
    
    APP.MAP = {};
    APP.MAP.create = Map;



    function Map(domContainer, data) {
        if (!(this instanceof Map)) {
            return new Map(domContainer, data);
        }

        this.domContainer = jQuery(domContainer);
        this.data = data;

        this.map = L.map(this.domContainer.find('.map-canvas')[0], { 
                        scrollWheelZoom: APP.config.mapDefaults.scrollWheelZoom,
                        zoomControl: APP.config.mapDefaults.zoomControl,
                    }).setView(APP.config.mapDefaults.center, 12);
        
        var tiles = L.gridLayer.googleMutant({
            type: 'hybrid'
        }).addTo(this.map);

        L.control.zoom({ position: 'bottomleft' }).addTo(this.map);

        this.initMarkerCluster();
        this.initTimePlayer();
        this.initTimeSlider();
        this.initDatePickers();
        this.addCaptions(data.categorizationItem);
        this.getMapData();

        return this;
    }



    Map.prototype.initMarkerCluster = function () {
        // this.map._layersMaxZoom = APP.config.mapDefaults.zoom + 1;
        this.markers = createMarkerClusterGroup();
        this.markers.on('clusterclick', function (e) {
            var modalSettings = {
                autoOpen: true,
                height: 650,
                width: 800,
                modal: true,
                buttons: {}
            };

            var reports = [];

            e.layer.getAllChildMarkers().forEach(function (marker) {
                reports.push(marker._data);
            });

            var modal = jQuery(APP.TEMPLATE.map.reportsList(reports)).dialog(modalSettings);
            var modalEl = jQuery('.ui-dialog[aria-describedby="' + modal.attr('id') + '"]');
            var btnClose = jQuery('<svg class="ui-dialog-button-close"><use xlink:href="/img/sprite.svg#close"></use></svg>');
            modalEl.append(btnClose);

            btnClose.on('click', function () {
                modal.dialog('destroy');
            });
            modalEl.find('.ui-dialog-content > li').on('click', function () {
                jQuery('.ui-dialog-content .dashboard-report-modal-content').not(this).slideUp(100);

                var content = jQuery(this).find('.dashboard-report-modal-content');
                if (content.is(':visible')) {
                    content.slideUp(100);
                } else {
                    content.slideDown(200);
                }
            });
        });
        this.map.addLayer(this.markers);
    };



    Map.prototype.addMarkers = function (responses) {
        var that = this;

        that.markers.clearLayers();

        if (Array.isArray(responses)) responses.forEach(function (r) {
            that.markers.addLayer(createMarker(r));
        });
    };



    Map.prototype.initDatePickers = function () {
        var that = this;
        var pickers = jQuery('.date-from, .date-to');

        function hideDatePicker() {
            pickers.datepicker('hide');
        }

        function removeHash() {
            setTimeout(function () {
                jQuery('.ui-datepicker tbody a').each(function () {
                    this.removeAttribute('href');
                    jQuery(this).on('click', hideDatePicker);
                });
            }, 0);
        }

        pickers.on('click', removeHash);
        pickers.datepicker({
            dateFormat: 'yy-mm-dd',
            firstDay: 1,
            changeMonth: true,
            changeYear: true,
            maxDate: new Date(),
            onChangeMonthYear: removeHash,
            onSelect: function (newValue) {
                jQuery(this).attr('value', newValue);
                that.getMapData();
            }
        });
    };



    Map.prototype.initTimePlayer = function () {
        var that = this;
        that.player = APP.TimePlayer();

        // Playback handlers.
        that.domContainer.find('.button-play').on('click', function () {
            that.player.play();
        });
        that.domContainer.find('.button-pause').on('click', function () {
            that.player.pause();
        });
        that.domContainer.find('.button-stop').on('click', function () {
            that.player.stop();
        });
        that.domContainer.find('.button-prev').on('click', function () {
            that.player.back();
            that.togglePlayPauseButton('pause');
        });
        that.domContainer.find('.button-next').on('click', function () {
            that.player.forward();
            that.togglePlayPauseButton('pause');
        });

        // Playback events.
        that.player.on('change', function (val) {
            that.slider.value(val);
        });

        that.player.on('start', function () {
            that.toggleSubCommandsVisibility('show');
            that.togglePlayPauseButton('play');
        });
        that.player.on('finish', function () {
            that.togglePlayPauseButton('pause');
            that.addMarkers(that.data.responses);
        });
        that.player.on('stop', function () {
            that.togglePlayPauseButton('pause');
            that.toggleSubCommandsVisibility('hide');
            that.addMarkers(that.data.responses);
        });
        that.player.on('pause', function () {
            that.togglePlayPauseButton('pause');
        });
    };



    Map.prototype.toggleSubCommandsVisibility = function (command) {
        var that = this;

        if (command === 'show') {
            that.domContainer.find('.map-player').addClass('timeline-sub-controls-visible');
            setTimeout(function () { 
                that.domContainer.find('.map-player').addClass('timeline-sub-controls-overflow');
            }, 1000);
        } else if (command === 'hide') {
            that.domContainer.find('.map-player').removeClass('timeline-sub-controls-visible');
            that.domContainer.find('.map-player').removeClass('timeline-sub-controls-overflow');
        }
    };



    Map.prototype.togglePlayPauseButton = function (state) {
        if (state === 'play') {
            this.domContainer.find('.map-player').addClass('timeline-active');
        } else if (state === 'pause') {
            this.domContainer.find('.map-player').removeClass('timeline-active');
        }
    };



    Map.prototype.initTimeSlider = function () {
        var that = this;
        var sliderEl = that.domContainer.find('.slider-line');
        sliderEl.slider({
            change: function (event, ui) {
                var value = ui.value || that.player.startDate;
                var date  = new Date(value);
                ui.handle.innerHTML = '<i>' + APP.formatDate(date) + '</i>';
                
                if (that.data.intervaledResponses) {
                    that.addMarkers(that.data.intervaledResponses[value]);
                } else {
                    that.player.trigger('stop');
                }
            }
        });
        that.slider = sliderEl.slider('instance');
    };



    Map.prototype.getMapData = function () {
        var that = this;
        var selectedOption = jQuery('.mpc-item.mpc-active');

        APP.service.getMapData({ 
            lang: that.data.lang, 
            form_id: that.data.form.id,
            item_id: selectedOption.attr('data-item-id'),
            option_id: selectedOption.attr('data-option-id'),
            from: that.domContainer.find('.date-from').val(),
            to: that.domContainer.find('.date-to').val()
        }, function (response) {
            if (!response.error) {
                that.data.captionItems = response.data.caption_items;
                that.data.intervaledResponses = response.data.intervaled_responses;
                that.data.responses = response.data.responses;

                if (!Array.isArray(that.data.responses)) {
                    if (that.markers) {
                        that.markers.clearLayers();
                    }
                    return;
                }

                var startDate = new Date(that.data.responses[that.data.responses.length - 1].datetime);
                var endDate   = new Date(that.data.responses[0].datetime);

                if (APP.formatDate(startDate) === APP.formatDate(endDate)) {
                    endDate.setDate(endDate.getDate() + 1);
                }

                var iDates     = Object.keys(that.data.intervaledResponses);
                var iStartDate = parseFloat(iDates[0]);
                var iEndDate   = parseFloat(iDates[iDates.length - 1]);

                that.player.update(iStartDate, iEndDate)
                that.slider.option({ min: iStartDate, max: iEndDate, interval: that.player.interval });
                that.addMarkers(that.data.responses);

                if (!jQuery('.date-from').val()) {
                    jQuery('.date-from').val(APP.formatDate(startDate));
                }
                if (!jQuery('.date-to').val()) {
                    jQuery('.date-to').val(APP.formatDate(endDate));
                }
                // if (!document.querySelector('#map-filters')) {
                //     that.addCaptions(that.data.captionItems);
                // }
            }
        });
    };



    Map.prototype.addCaptions = function (captionItems) {
        var that = this;
        var captions = jQuery(APP.TEMPLATE.map.captions(captionItems));
        var mpcItems = captions.find('.mpc-all-items, .mpc-item');
        that.domContainer.append(captions);

        captions.find('.mpc-all-items').addClass('mpc-active');

        mpcItems.on('click', function () {
            var itemId   = this.getAttribute('data-item-id');
            var optionId = this.getAttribute('data-option-id');

            mpcItems.removeClass('mpc-active');

            if (optionId) {
                jQuery('.mpc-item[data-option-id="' + optionId + '"]').addClass('mpc-active');
            } else {
                jQuery('.mpc-all-items').addClass('mpc-active');
            }

            that.getMapData();
        });
    };



    function createMarker(response) {
        var className = 'marker-icon';
        var icon = L.divIcon({
            className: className,
            html: '<div style="color:' + response.color + '"><span></span></div>'
        });
        var marker = L.marker([response.lat, response.lng], {
            icon: icon
        });
        // marker.bindPopup(APP.TEMPLATE.map.markerPopup(response), { autoPanPaddingTopLeft: [0, 120] });

        response.hideLocationItem = true;
        marker._modalHTMLContent = APP.TEMPLATE._dashboardReportModalContent(response);
        marker._data = response;

        marker.on('click', function () {
            var modalSettings = {
                autoOpen: true,
                height: 550,
                width: 700,
                modal: true,
                buttons: {}
            };

            var modal = jQuery(marker._modalHTMLContent).dialog(modalSettings);
            var modalEl = jQuery('.ui-dialog[aria-describedby="' + modal.attr('id') + '"]');
            var btnClose = jQuery('<svg class="ui-dialog-button-close"><use xlink:href="/img/sprite.svg#close"></use></svg>');
            modalEl.append(btnClose);

            btnClose.on('click', function () {
                modal.dialog('destroy');
            });
        });

        return marker;
    }



    function createMarkerClusterGroup() {
        return new L.markerClusterGroup({ 
            maxClusterRadius: 20,
            showCoverageOnHover: false,
            zoomToBoundsOnClick: false,
            spiderfyOnMaxZoom: false,
            iconCreateFunction: function (cluster) {
                var childCount = cluster.getChildCount();
                var c = ' marker-icon-';

                if (childCount < 10) {
                    c += 'small';
                } else if (childCount < 30) {
                    c += 'medium';
                } else {
                    c += 'large';
                }

                return new L.DivIcon({ 
                    className: 'marker-icon ' + c,
                    html: '<div><span><i>' + childCount + '</i></span></div>', 
                    iconSize: new L.Point(40, 40) 
                });
            }
        });
    }

})();