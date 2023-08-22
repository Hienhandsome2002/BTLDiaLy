
$("#document").ready(function () {
    // var format = 'image/png';
    // var zoom = 16.56631263565161;
    // var rotation = 0;
    // var center = [11775984, 2388489]
    // // var boundsHaNoiDiem = [11768566, 2382669, 11797756, 2401312];
    // var boundsHaNoiRoads = [105.290664672852, 20.5860214233398, 106.022514343262, 21.3867664337158]
    // // var boundsHaNoiDuong = [105.285301208496, 20.6077270507813, 106.023727416992, 21.3891468048096]
    // // var boundsHaNoiVung = [105.285301208496, 20.5604095458984, 106.023727416992, 21.38938331604]
    // var boundsHospital1 = [105.493293762207, 20.8008670806885, 105.947441101074, 21.253101348877]
    var format = "image/png";
    var vectorSource;
    var minX = 105.45895568847656;
    var minY = 20.58451416015625;
    var maxX = 106.02007293701172;
    var maxY = 21.385278701782227;
    var cenX = (minX + maxX) / 2;
    var cenY = (minY + maxY) / 2;
    var mapLat = cenY;
    var mapLng = cenX;
    var mapDefaultZoom = 12;
    var apiKey = '5b3ce3597851110001cf62482c08783aacd24f3e9f4339b2fba37d8c';

    var startPoint = []
    var destPoint = []

    // var projection = new ol.proj.Projection({
    //     code: 'EPSG:3857',
    //     units: 'm',
    //     axisOrientation: 'neu'
    // });
    //HaNoiRoads
    var roads = new ol.layer.Image({
        source: new ol.source.ImageWMS({
            url: 'http://localhost:8080/geoserver/ne/wms',
            params: {
                'FORMAT': format,
                'VERSION': '1.1.0',
                STYLES: '',
                LAYERS: 'ne:hanoi_route',
            }
        })
    });

    //OpenStreetMap
    layerBG = new ol.layer.Tile({
        source: new ol.source.OSM({})
    });

    // HaNoiDiem
    var haNoiDiem = new ol.layer.Image({
        source: new ol.source.ImageWMS({
            ratio: 1,
            url: 'http://localhost:8080/geoserver/ne/wms',
            params: {
                'FORMAT': format,
                'VERSION': '1.1.0',
                STYLES: '',
                LAYERS: 'ne:hanoidiem',
            }
        }),
    })

    // HaNoiDuong
    var haNoiDuong = new ol.layer.Image({
        source: new ol.source.ImageWMS({
            ratio: 1,
            url: 'http://localhost:8080/geoserver/ne/wms',
            params: {
                'FORMAT': format,
                'VERSION': '1.1.0',
                STYLES: '',
                LAYERS: 'ne:hanoiduong',
            }
        }),
    })

    // HaNoiVung
    var haNoiVung = new ol.layer.Image({
        source: new ol.source.ImageWMS({
            ratio: 1,
            url: 'http://localhost:8080/geoserver/ne/wms',
            params: {
                'FORMAT': format,
                'VERSION': '1.1.0',
                STYLES: '',
                LAYERS: 'ne:hanoivung',
            }
        }),
        // zIndex: 1
    })

    // Hosital1
    var hospital1 = new ol.layer.Image({
        source: new ol.source.ImageWMS({
            ratio: 1,
            url: 'http://localhost:8080/geoserver/ne/wms',
            params: {
                'FORMAT': format,
                'VERSION': '1.1.0',
                STYLES: '',
                LAYERS: 'ne:hospital1',

            }
        }),
        zIndex: 2
    })

    // Hosital2
    var hospital2 = new ol.layer.Image({
        source: new ol.source.ImageWMS({
            ratio: 1,
            url: 'http://localhost:8080/geoserver/ne/wms',
            params: {
                'FORMAT': format,
                'VERSION': '1.1.0',
                STYLES: '',
                LAYERS: 'ne:hospital2',
            }
        }),
        zIndex: 2
    })

    var view = new ol.View({
        // projection: projection,
        center: ol.proj.fromLonLat([mapLng, mapLat]),
        zoom: mapDefaultZoom,
        minZoom: mapDefaultZoom - 2
    });
    var map = new ol.Map({
        target: "map",
        layers: [
            layerBG, hospital1, haNoiVung
        ],
        // overlays: [overlay],
        view: view
    });
    //map.getView().fitExtent(bounds, map.getSize());
    // map.getView().fit(boundsHospital1, map.getSize());
    // map.getView().fit(boundsHaNoiRoads, map.getSize());

    //route

    // Bật tắt layer
    $("#check-hospital1").change(function () {
        if ($("#check-hospital1").is(":checked")) {
            hospital1.setVisible(true);
        } else {
            hospital1.setVisible(false);
        }
    });

    $("#check-HaNoiVung").change(function () {
        if ($("#check-HaNoiVung").is(":checked")) {
            haNoiVung.setVisible(true);
        } else {
            haNoiVung.setVisible(false);
        }
    });

    async function calculateAndHighlightRoute(startPoint, destPoint) {
        var routingUrl = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${apiKey}&start=${startPoint.join(
            ","
        )}&end=${destPoint.join(",")}`;

        try {
            const response = await fetch(routingUrl);
            // console.log(response);
            if (!response.ok) {
                throw new Error(
                    ` Network response was not ok (${response.status} ${response.statusText})`
                );
            }

            const data = await response.json();
            if (!data || !data.features || data.features.length === 0) {
                throw new Error("Invalid response format");
            }
            console.log(data);

            distanceFromStartToBank = (
                Number(data.features[0].properties.summary.distance) / 1000
            ).toFixed(3);
            var routeGeometry = data.features[0].geometry.coordinates;
            // console.log(startPoint);
            // console.log(destPoint);
            highlightRoute(routeGeometry);
        } catch (error) {
            console.error("Error fetching route data:", error);
        }
    }

    function highlightRoute(routeCoordinates) {
        // console.log(routeCoordinates);
        var routeGeometry = new ol.geom.LineString(
            routeCoordinates.map(function (coord) {
                // console.log(coord);
                return coord
            })
        );
        console.log(routeGeometry);
        var routeFeature = new ol.Feature({
            geometry: routeGeometry,
        });

        var routeStyle = new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: "green",
                width: 12,
            }),
        });

        routeFeature.setStyle(routeStyle);
        vectorSource.addFeature(routeFeature);
    }


    function createJsonObj(result) {
        var geojsonObject = '{' +
            '"type": "FeatureCollection",' +
            '"crs": {' +
            '"type": "name",' +
            '"properties": {' +
            '"name": "EPSG:4326"' +
            '}' +
            '},' +
            '"features": [{' +
            '"type": "Feature",' +
            '"geometry": ' + result +
            '}]' +
            '}';
        return geojsonObject;
    }

    function highLightGeoJsonObj(paObjJson) {
        var vectorSource = new ol.source.Vector({
            features: (new ol.format.GeoJSON()).readFeatures(paObjJson, {
                dataProjection: 'EPSG:4326',
                featureProjection: 'EPSG:3857'
            })
        });
        vectorLayer.setSource(vectorSource);

    }

    function highLightObj(result) {
        //alert("result: " + result);
        var strObjJson = createJsonObj(result);
        //alert(strObjJson);
        var objJson = JSON.parse(strObjJson);
        //alert(JSON.stringify(objJson));
        //drawGeoJsonObj(objJson);
        highLightGeoJsonObj(objJson);
    }
    map.on('singleclick', function (evt) {

        // var sourceHospital2 = hospital2.getSource();
        // alert("coordinate: " + evt.coordinate);
        //var myPoint = 'POINT(12,5)';x`
        var lonlat = ol.proj.transform(evt.coordinate, 'EPSG:3857', 'EPSG:4326');
        var lon = lonlat[0];
        var lat = lonlat[1];
        var myPoint = 'POINT(' + lon + ' ' + lat + ')';
        // alert("myPoint: " + myPoint);
        //*
        // alert(evt.coordinate);
        $.ajax({
            type: "POST",
            url: "map/LiveSearch.php",
            data: {
                functionname: 'getGeoCMRToAjax',
                paPoint: myPoint
            },
            success: function (result, status, xhr) {
                async function Geo(result) {
                    highLightObj(result);
                    destPoint = [...JSON.parse(result).coordinates[0][0][0]]
                    console.log([...JSON.parse(result).coordinates[0][0][0]])
                    console.log(startPoint = [lon, lat]);
                    await calculateAndHighlightRoute(startPoint, destPoint)
                    $.ajax({
                        type: "POST",
                        url: "map/LiveSearch.php",
                        data: {
                            functionname: 'getInfoCMRToAjax',
                            paPoint: myPoint
                        },
                        success: function (n) {
                            $("#popup-content").html(n);
                            overlay.setPosition(evt.coordinate);
                            document.getElementById('popup-content').innerHTML = n;
                            var vectorSource = new ol.source.Vector({
                                features: (new ol.format.GeoJSON()).readFeatures(n)
                            });
                            vectorLayer.setSource(vectorSource);
                        },
                        error: function (xhr, status, error) {
                            alert(xhr.responseText + " " + status + " " + error);
                        }
                    });
                }
                Geo(result)
            },
            error: function (xhr, status, error) {
                alert(xhr.responseText + " " + status + " " + error);
            }
        });
        if (!startPoint) {
            // First click.
            startPoint = [lon, lat]
            $("#txtPoint1").val(lon, lat);
        }
    });


    //highlight đối tượng
    white = [255, 255, 255, 1],
        blue = [0, 153, 255, 1],
        red = [0, 100, 200, 1]
    var styles = {
        'MultiPolygon': new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: 'red',
                width: 6
            })
        }),
        // 'LineString': new ol.style.Style({
        //     stroke: new ol.style.Stroke({
        //         color: 'red',
        //         width: 5
        //     })
        // })
    };
    var styleFunction = function (feature) {
        return styles[feature.getGeometry().getType()];
    };
    var vectorSource = new ol.source.Vector();
    var vectorLayer = new ol.layer.Vector({
        source: vectorSource,
        style: styleFunction
    });
    map.addLayer(vectorLayer);

    //popup
    var container = document.getElementById('popup');
    var content = document.getElementById('popup-content');
    var closer = document.getElementById('popup-closer');
    var overlay = new ol.Overlay(/** @type {olx.OverlayOptions} */({
        element: container,
        autoPan: true,
        autoPanAnimation: {
            duration: 250
        }
    }));
    map.addOverlay(overlay);
    closer.onclick = function () {
        overlay.setPosition(undefined);
        closer.blur();
        return false;
    };


    // var vectorLayer2 = new ol.layer.Vector({
    //     source: new ol.source.Vector({
    //         features: [startPoint, destPoint]
    //     })
    // });

    // map.addLayer(vectorLayer2);

    // $("#btnSolve").click(function () {
    //     var startCoord = startPoint.getGeometry().getCoordinates();
    //     var destCoord = destPoint.getGeometry().getCoordinates();
    //     var routeFound = new ol.layer.Image({
    //         source: new ol.source.ImageWMS({
    //             url: "http://localhost:8080/geoserver/ne/wms",
    //             params: {
    //                 VIEWPARAMS: `x1:${startCoord[0]};y1:${startCoord[1]};x2:${destCoord[0]};y2:${destCoord[1]}`,
    //                 LAYERS: "ne:route",
    //                 FORMAT: "image/png",
    //             },
    //         }),
    //     });
    //     console.log(`x1:${startCoord[0]};y1:${startCoord[1]};x2:${destCoord[0]};y2:${destCoord[1]}`);
    //     console.log(routeFound);
    //     map.addLayer(routeFound);

    // });
    // $("#btnReset").click(function () {
    //     startPoint.setGeometry(null);
    //     destPoint.setGeometry(null);
    //     // Remove the result layer.
    //     map.removeLayer(result);
    // });


    // document.getElementById('searchAndZoomButton').addEventListener('click', function () {
    //     var searchTerm = document.getElementById('searchTermInput').value;
    //     searchAndZoomToFeature(searchTerm);
    // });

    // Hàm tìm kiếm và zoom đến đối tượng vùng theo thuộc tính

});