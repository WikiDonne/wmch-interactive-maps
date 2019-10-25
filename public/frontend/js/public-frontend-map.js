// Client rendering and functions for Map Wizard

L.TimeDimension.Layer.timedGeoJSON = L.TimeDimension.Layer.GeoJson.extend({

    // data has property time in seconds, not in millis.
    _getFeatureTimes: function(feature) {
        if (!feature.properties) {
            return [];
        }
        if (feature.properties.hasOwnProperty('coordTimes')) {
            return feature.properties.coordTimes;
        }
        if (feature.properties.hasOwnProperty('times')) {
            return feature.properties.times;
        }
        if (feature.properties.hasOwnProperty('linestringTimestamps')) {
            return feature.properties.linestringTimestamps;
        }
        if (feature.properties.hasOwnProperty('time')) {
            return [feature.properties.time * 1000];
        }
        return [];
    },
    // Do not modify features. Just return the feature if it intersects
    // the time interval
    _getFeatureBetweenDates: function(feature, minTime, maxTime) {
        var featureStringTimes = this._getFeatureTimes(feature);
        if (featureStringTimes.length == 0) {
            return feature;
        }
        var featureTimes = [];
        for (var i = 0, l = featureStringTimes.length; i < l; i++) {
            var time = featureStringTimes[i]
            if (typeof time == 'string' || time instanceof String) {
                time = Date.parse(time.trim());
            }
            featureTimes.push(time);
        }

        if (featureTimes[0] > maxTime || featureTimes[l - 1] < minTime) {
            return null;
        }
        return feature;
    },

});

L.timeDimension.layer.timedGeojson = function(layer, options) {
    return new L.TimeDimension.Layer.timedGeoJSON(layer, options);
};

$(function() {
    // display throbble while loading
    $('#pagepop').dimmer('show');



    // get options for current map
    $.ajax ({
        type:'GET',
        url: getVarUrl(),
        dataType: 'json',
        error: function(e) {
            console.warn('Error retrieving data from url parameters');
        },
        success: function(mapOpts) {
            // set attribution to map
            mapOpts.baseAttribution = mapOpts.currentStyle.attribution + ' | ' + $('#author').html();
            mapOpts.subdomains = '1234';
            // Load map
            var options = {
                sparql: mapOpts.query,
                map: mapOpts.map
            };
            // do the query, get the results in GeoJSON format
            var allArgs = [
              'q=' + encodeURIComponent(options.sparql),
              'id=' + mapOpts.id
            ];
            $.ajax ({
                type:'GET',
                url: "/api/timedata?" + allArgs.join('&'),
                error: function(e) {
                    console.warn('Error retrieving data');
                },
                success: function(geoJsonDataRaw) {
                    var geoJsonData = enrichFeatures(geoJsonDataRaw);
                    // data loaded, hide the throbbler
                    $('#pagepop').dimmer('hide');


                    var basemap = new L.TileLayer(mapOpts.tile, {
                        maxZoom: mapOpts.maxZoom,
                        minZoom: mapOpts.minZoom,
                        attribution: mapOpts.baseAttribution,
                        subdomains: mapOpts.subdomains,
                        opacity: 1.0
                    });
                    // console.log(parsedOptions.zoom);
                    // carica la mappa nel div #wmap
                    window.map = new L.Map('wmap', {
                        center: new L.LatLng(mapOpts.startLat, mapOpts.startLng),
                        fullscreenControl: true,
                        zoom: mapOpts.zoom,
                        maxZoom: mapOpts.maxZoom,
                        minZoom: mapOpts.minZoom,
                        layers: [basemap],
                        // timeDimension options
                        fullscreenControl: true,
                        timeDimensionControl: true,
                        timeDimensionControlOptions: {
                            position: 'bottomleft',
                            autoPlay: false,
                            timeSlider: true,
                            loopButton: true,
                            playerOptions: {
                                transitionTime: 125,
                                loop: false,
                            }
                        },
                        timeDimension: true,
                        timeDimensionOptions: {
                            // timeInterval: "2019-10-21/2019-10-22",
                            // same of geoJsonTimeLayer > duration
                            period: "PT1S",

                        }
                    });

                    console.log('*** mapOpts ***', mapOpts);
                    console.log('*** geoJsonData for L.Map ***', geoJsonData);

                    // @see https://github.com/socib/Leaflet.TimeDimension/issues/14#issuecomment-158116366
                    //declare a normal GeoJson layer
                    var geojsonLayer = L.geoJson(geoJsonData , {
                        pointToLayer: function (feature, latlng) {
                            var pin = L.AwesomeMarkers.icon({
                                icon: mapOpts.pinIcon,
                                prefix: 'icon',
                                markerColor: feature.properties.pin.color,
                                extraClasses: mapOpts.pinIcon
                            });
                            return L.marker(latlng, { icon: pin }).on('popupopen', openModal);
                        }
                    });
                    // Add time capability to the geojson layer
                    var geoJsonTimeLayer = L.timeDimension.layer.timedGeojson(geojsonLayer , {
                        addlastPoint: false,
                        updateTimeDimension: true,
                        updateTimeDimensionMode: 'replace',
                        // same of Map > timeDimensionOptions > period
                        duration: 'PT1S'
                    });
                    // add the timed layer to the map
                    geoJsonTimeLayer.addTo(window.map);

                }
            });
        }
    });


});
