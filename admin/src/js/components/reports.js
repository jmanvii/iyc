(function () {
    'use strict';
    
    APP.REPORTS = {};



    APP.REPORTS.renderForm = function (data, reportId, callback) {
        jQuery.when(
            APP.service.getForm({ lang: data.lang }),
            APP.service.getFormResponse({ lang: data.lang, id: reportId })
        ).done(function (xhrForm, xhrFormResponse) {
            data.form = xhrForm[0].data;
            data.response = xhrFormResponse[0].data;

            var modal = jQuery(APP.TEMPLATE.form.container(data));

            modal.dialog({
                dialogClass: 'admin-modal-editor',
                resizable: false,
                width: 700,
                height: 650,
                modal: true,
                open: function () {
                    modal.find('.form-item[data-type="location-search"]').each(setMapItemEventHandler);
                    modal.find('.form-item[data-type="image"] input[type="file"]').on('change', setImageUploadEventHandler);
                    modal.find('.form-item[data-type="choice"] .form-radio-buttons input[type="radio"]').on('change', setRadioButtonEventHandler);
                    modal.find('.form-item[data-type="choice"] select').on('change', setDropdownEventhandler);

                    var selectedOption = modal.find('input[type="radio"][data-item-id]:checked');
                    modal.find('.form-item[data-show-if="' + selectedOption.val() + '"]').show();
                },
                buttons: {
                    'Submit': function () {
                        modal.dialog('destroy');
                        var responseId = modal.find('input[name="response-id"]').val();
                        APP.REPORTS.setSubmitHandler(data, modal, responseId);
                    },
                    'Cancel': function() {
                        modal.dialog('destroy');
                    }
                }
            });
        });
    };



    APP.REPORTS.setSubmitHandler = function (data, modal, responseId) {
        var formData = {
            lang: data.lang,
            response_id: responseId,
            form_id: data.form.id,
            items: []
        };

        modal.find('.form-item').each(function () {
            var itemEl = jQuery(this);
            var itemData = {
                response_item_id: itemEl.attr('data-response-item-id'),
                item_id: itemEl.attr('data-id'),
                option_id: null,
                value: null
            };

            if (itemEl.attr('data-value')) {
                itemData.value = itemEl.attr('data-value');
            } else if (itemEl.attr('data-selected-option-id')) {
                itemData.option_id = itemEl.attr('data-selected-option-id');
            } else if (itemEl.attr('data-type') === 'text') {
                itemData.value = itemEl.find('input[type="text"]').val() || itemEl.find('textarea').val()
            }

            if (itemData.option_id || itemData.value) {
                formData.items.push(itemData);
            }
        });

        var errMessage = modal.find('.form-error-message').slideUp(200);

        APP.service.updateFormResponse(formData, function (response) {
            if (response.error) {
                errMessage.text(APP.LANG.text('website:' + response.error) || APP.LANG.text('website:empty-fields'));
                errMessage.slideDown(200);
            } else {
                var html = APP.TEMPLATE._response(response.data);
                jQuery('.rl-item[data-id="' + response.data.response_id + '"]').replaceWith(html);
                APP.FORM.setResponseItemHandlers(data);
                errMessage.hide();
                modal.dialog('destroy');
            }
        });
    };



    function setDropdownEventhandler() {
        var selectEl = jQuery(this);
        var parentItem = selectEl.parents('.form-item');
        parentItem.attr('data-selected-option-id', selectEl.val());
    }



    function setRadioButtonEventHandler() {
        var parentItem = jQuery(this).parents('.form-item');
        parentItem.find('.form-item').hide();
        var selectedOptionId = parentItem.find('.form-radio-buttons input[type="radio"]:checked').val();
        parentItem.attr('data-selected-option-id', selectedOptionId);
        jQuery('.form-item[data-show-if="' + selectedOptionId + '"]').show();
    }



    function setImageUploadEventHandler(e) {
        var itemEl = jQuery(this).parents('.form-item');
        var formData = new FormData();
        var i, file;

        for (i = 0; i < e.target.files.length; i += 1) {
            file = e.target.files[i];
            formData.append('image', file);
        }

        jQuery.ajax({
            type: 'POST',
            url: '/api/upload',
            data: formData,
            contentType: false,
            processData: false
        }).done(function (response) {
            if (!Array.isArray(response.data)) {
                response.data = [response.data];
            }
            if (Array.isArray(response.data)) response.data.forEach(function (file) {
                itemEl.attr('data-value', file.filename);
                jQuery('.form-image-thumbnails').html('<img src="' + APP.fileUrl(file.filename) + '" />').show();
            });
        });
    }



    function setMapItemEventHandler() {
        var itemEl = jQuery(this);
        var map = L.map(this.querySelector('.form-map-canvas'), { scrollWheelZoom: APP.config.mapDefaults.scrollWheelZoom })
                   .setView(APP.config.mapDefaults.center, APP.config.mapDefaults.zoom);
        
        var tiles = L.gridLayer.googleMutant({
            type: 'hybrid'
        }).addTo(map);

        var marker = new L.marker(APP.config.mapDefaults.center, {
            draggable: false,
            icon: L.icon({
                iconUrl: '/img/map-marker.png',
                iconSize: [48, 48]
            }),
            bounceOnAdd: true
        }).addTo(map);

        function afterMapUpdate() {
            var latlng = map.getCenter();
            var lat = latlng.lat;
            var lng = latlng.lng;

            itemEl.attr('data-value', JSON.stringify({
                lat: lat,
                lng: lng
            }));

            searchCoordinates(lat, lng, function (places) {
                var textInputEl = itemEl.find('input[type="text"]');

                if (Array.isArray(places)) {
                    textInputEl.val(places[0].formatted_address);
                    itemEl.attr('data-value', JSON.stringify({
                        name: places[0].formatted_address,
                        lat: lat,
                        lng: lng
                    }));
                } else {
                    textInputEl.val('');
                }                    
            });
        }

        map.on('move', function () {
            marker.setLatLng(map.getCenter());
        });

        map.on('dragend', function(e) {
            afterMapUpdate();
        });

        map.on('zoomend', function() {
            afterMapUpdate();
        });

        itemEl.find('input[type="text"]').on('keyup', function () {
            var elem = jQuery(this);
            var inputText = elem.val();

            if (inputText.length > 2) {
                searchPlace(inputText, function (places) {
                    var list = itemEl.find('ul').html('');

                    places.forEach(function (place) {
                        list.append('<li data-place-id="' + place.place_id + '">' + place.description + '</li>');
                    });

                    list.find('li').on('click', function () {
                        var placeName = jQuery(this).text();
                        var placeId = this.getAttribute('data-place-id');
                        var url = 'https://maps.googleapis.com/maps/api/place/details/json' + 
                                  '?placeid=' + placeId + 
                                  '&key=' + APP.config.mapDefaults.googleAPIKey;

                        getPlaceDetails(placeId, function (place) {
                            var lat = place.geometry.location.lat();
                            var lng = place.geometry.location.lng();

                            map.setView([lat, lng], APP.config.mapDefaults.zoom);
                            marker.setLatLng([lat, lng]);

                            itemEl.attr('data-value', JSON.stringify({
                                name: placeName,
                                lat: lat,
                                lng: lng
                            }));
                            list.html('');
                        });

                        elem.val(placeName);
                    });
                });
            }
        });

        var lastValue;

        itemEl.find('input[type="text"]').on('focus', function () {
            lastValue = this.value;
            this.value = '';
        });

        itemEl.find('input[type="text"]').on('blur', function () {
            if (this.value === '') {
                this.value = lastValue;
            }
        });
    }



    function searchPlace(query, callback) {
        var autocompleteService = new google.maps.places.AutocompleteService();
        autocompleteService.getPlacePredictions({
            bounds: new google.maps.LatLngBounds(
                new google.maps.LatLng(32.60178321404518, 51.58012390136719), // north-west point.
                new google.maps.LatLng(32.73732805487708, 51.740455627441406) // south-east point.
            ),
            componentRestrictions: {
                country: 'ir'
            },
            input: query
        }, callback);
    }



    function getPlaceDetails(placeId, callback) {
        var placesService = new google.maps.places.PlacesService(document.createElement('div'));
        placesService.getDetails({ placeId: placeId }, callback);
    }



    function searchCoordinates(lat, lng, callback) {
        var geocoder = new google.maps.Geocoder();
        var code = geocoder.geocode({
            latLng:  new google.maps.LatLng(lat, lng),
            region: 'ir'
        }, callback);
    }

})();