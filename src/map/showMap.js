
$("#document").ready(function () {
    var format = 'image/png';
    var zoom = 16.56631263565161;
    var rotation = 0;
    var shouldUpdate = true;
    var center = [11775984, 2388489]
    var boundsHaNoiDiem = [11768566, 2382669, 11797756, 2401312];
    var boundsHaNoiRoads = [105.290664672852, 20.5860214233398, 106.022514343262, 21.3867664337158]
    // var boundsHaNoiDuong = [105.285301208496, 20.6077270507813, 106.023727416992, 21.3891468048096]
    // var boundsHaNoiVung = [105.285301208496, 20.5604095458984, 106.023727416992, 21.38938331604]
    var boundsHospital1 = [105.493293762207, 20.8008670806885, 105.947441101074, 21.253101348877]
    var apiKey ;
    var startPoint = new ol.Feature();
    var destPoint = new ol.Feature();

    var projection = new ol.proj.Projection({
        code: 'EPSG:3857',
        units: 'm',
        axisOrientation: 'neu'
    });
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
        zIndex: 1
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
        projection: projection,
        center: center,
        zoom: zoom,
        rotation: rotation
    });
    var map = new ol.Map({
        target: "map",
        layers: [
            layerBG, hospital1,
        ],
        // overlays: [overlay],
        view: view
    });
    //map.getView().fitExtent(bounds, map.getSize());
    map.getView().fit(boundsHaNoiDiem, map.getSize());
    // map.getView().fit(boundsHaNoiRoads, map.getSize());

    //route
    async function calculateAndHighlightRoute(startCoords, bankCoords) {
        var routingUrl = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${apiKey}&start=${startCoords.join(
            ","
        )}&end=${bankCoords.join(",")}`;

        try {
            const response = await fetch(routingUrl);
            if (!response.ok) {
                throw new Error(
                    ` Network response was not ok (${response.status} ${response.statusText})`
                );
            }

            const data = await response.json();
            if (!data || !data.features || data.features.length === 0) {
                throw new Error("Invalid response format");
            }

            distanceFromStartToBank = (
                Number(data.features[0].properties.summary.distance) / 1000
            ).toFixed(3);
            var routeGeometry = data.features[0].geometry.coordinates;

            highlightRoute(routeGeometry);
        } catch (error) {
            console.error("Error fetching route data:", error);
        }
    }

    function highlightRoute(routeCoordinates) {
        var routeGeometry = new ol.geom.LineString(
            routeCoordinates.map(function (coord) {
                return ol.proj.fromLonLat(coord);
            })
        );

        var routeFeature = new ol.Feature({
            geometry: routeGeometry,
        });

        var routeStyle = new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: "green",
                width: 4,
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

    function drawGeoJsonObj(paObjJson) {
        var vectorSource = new ol.source.Vector({
            features: (new ol.format.GeoJSON()).readFeatures(paObjJson, {
                dataProjection: 'EPSG:4326',
                featureProjection: 'EPSG:3857'
            })
        });
        var vectorLayer = new ol.layer.Vector({
            source: vectorSource
        });
        map.addLayer(vectorLayer);
    }

    function highLightGeoJsonObj(paObjJson) {
        var vectorSource = new ol.source.Vector({
            features: (new ol.format.GeoJSON()).readFeatures(paObjJson, {
                dataProjection: 'EPSG:4326',
                featureProjection: 'EPSG:3857'
            })
        });
        vectorLayer.setSource(vectorSource);
        /*
        var vectorLayer = new ol.layer.Vector({
            source: vectorSource
        });
        map.addLayer(vectorLayer);
        */
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
    map.on('singleclick', function(evt) {
        var view = map.getView();
        var viewResolution = view.getResolution();
        // var sourceHospital2 = hospital2.getSource();
        var sourceHospital1 = hospital1.getSource();
        var url1 = sourceHospital1.getGetFeatureInfoUrl(
            evt.coordinate, viewResolution, view.getProjection(),
            { 'INFO_FORMAT': 'application/json', });
        // console.log(1)
        if (url1) {
            $.ajax({
                type: "POST",
                url: url1,
                contentType: "application/json; charset=utf-8",
                dataType: 'json',
                success: function (n) {
                    var content = "<table>";
                    for (var i = 0; i < n.features.length; i++) {
                        var feature = n.features[i];
                        var featureAttr = feature.properties;
                        content += "<tr><td>" + featureAttr["name"] + "</td></tr><tr><td>Địa chỉ: " + featureAttr["addr_stree"] + "</td></tr>"
                    }
                    content += "</table>";
                    $("#popup-content").html(content);
                    overlay.setPosition(evt.coordinate);
                    document.getElementById('popup-content').innerHTML = content;
                    var vectorSource = new ol.source.Vector({
                        features: (new ol.format.GeoJSON()).readFeatures(n)
                    });
                    vectorLayer.setSource(vectorSource);
                }
            });
        }
        //alert("coordinate: " + evt.coordinate);
        //var myPoint = 'POINT(12,5)';
        var lonlat = ol.proj.transform(evt.coordinate, 'EPSG:3857', 'EPSG:4326');
        var lon = lonlat[0];
        var lat = lonlat[1];
        var myPoint = 'POINT(' + lon + ' ' + lat + ')';
        //alert("myPoint: " + myPoint);
        //*
        $.ajax({
            type: "POST",
            url: "map/LiveSearch.php",
            data: {
                functionname: 'getGeoCMRToAjax',
                paPoint: myPoint
            },
            success: function(result, status, xhr) {
                highLightObj(result);
            },
            error: function(xhr, status, error) {
                alert(xhr.responseText + " " + status + " " + error);
            }
        });
        if (startPoint.getGeometry() == null) {
            // First click.
            startPoint.setGeometry(new ol.geom.Point(evt.coordinate));
            $("#txtPoint1").val(evt.coordinate);
        } else if (destPoint.getGeometry() == null) {
            // Second click.
            destPoint.setGeometry(new ol.geom.Point(evt.coordinate));
            $("#txtPoint2").val(evt.coordinate);
        }
        //*/
    });
    //getFeatureInfo hospitatl1
    // map.on('singleclick', function (evt) {
        
    // });

    //highlight đối tượng
    var styles = {
        // 'Point': new ol.style.Style({
        //     image: new ol.style.Circle({
        //         radius: width * 2,
        //         fill: new ol.style.Fill({ color: blue }),
        //         stroke: new ol.style.Stroke({
        //             color: white, width: width / 2
        //         })
        //     })
        // }),
        'MultiPolygon': new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: 'red',
                width: 5
            })
        })
    };
    var styleFunction = function (feature) {
        return styles[feature.getGeometry().getType()];
    };
    var vectorLayer = new ol.layer.Vector({
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
    //code tim kiem doi tuong
    if (window.location.hash !== "") {
        var hash = window.location.hash.replace("#map=", "");
        var parts = hash.split("/");

        if (parts.length === 4) {
            zoom = parseInt(parts[0], 10);
            center = [parseFloat(parts[1]), parseFloat(parts[2])];
            rotation = parseFloat(parts[3]);
            // console.log(center);
        }
    }
    //di den diem
    var updatePermalink = function () {
        if (!shouldUpdate) {
            shouldUpdate = true;
            return;
        }

        var center = view.getCenter();

        var hash =
            "#map=" +
            view.getZoom() +
            "/" +
            Math.round(center[0] * 100) / 100 +
            "/" +
            Math.round(center[1] * 100) / 100 +
            "/" +
            view.getRotation();
        var state = {
            zoom: view.getZoom(),
            center: view.getCenter(),
            rotation: view.getRotation(),
        };

        window.history.pushState(state, "map", hash);
    };
    map.on('moveend', updatePermalink);
    window.addEventListener('popstate', function (event) {
        if (event.state === null) {
            return;
        }
        map.getView().setCenter(event.state.center);
        map.getView().setCenter(event.state.center);
        map.getView().setRotation(event.state.rotation);
        shouldUpdate = false;
    });

    function di_den_diem(x, y) {
        var vi_tri = ol.proj.fromLonLat([x, y], projection);
        view.animate({
            center: vi_tri,
            duration: 2000,
            zoom: 20,
        });
    }
    $(document).on('click', '.point-map-click', function (e) {
        let x = $(e.target).attr('data-point-x');
        let y = $(e.target).attr('data-point-y');
        di_den_diem(x, y);
        // console.log(x, y);
    });


    
    var vectorLayer2 = new ol.layer.Vector({
        source: new ol.source.Vector({
            features: [startPoint, destPoint]
        })
    });

    map.addLayer(vectorLayer2);
    map.on('singleclick', function (evt) {
      
    });
    var result;
    $("#btnSolve").click(function () {
         var startCoord = startPoint.getGeometry().getCoordinates();
         var destCoord = destPoint.getGeometry().getCoordinates();
        var routeFound = new ol.layer.Image({
            source: new ol.source.ImageWMS({
                url: "http://localhost:8080/geoserver/ne/wms",
                params: {
                    VIEWPARAMS: ` x1:105.74563980102539;y1:21.07782790216254;x2:105.7938941;y2:20.965248`,
                    LAYERS: "ne:route",
                    FORMAT: "image/png",
                },
            }),
        });
        // console.log(`x1:${startCoord[0]};y1:${startCoord[1]};x2:${destCoord[0]};y2:${destCoord[1]}`);
        console.log(routeFound);
        map.addLayer(routeFound);

    });
    $("#btnReset").click(function () {
        startPoint.setGeometry(null);
        destPoint.setGeometry(null);
        // Remove the result layer.
        map.removeLayer(result);
    });


    document.getElementById('searchAndZoomButton').addEventListener('click', function () {
        var searchTerm = document.getElementById('searchTermInput').value;
        searchAndZoomToFeature(searchTerm);
    });

    // Hàm tìm kiếm và zoom đến đối tượng vùng theo thuộc tính
    function searchAndZoomToFeature(term) {
        var columnName = 'name';
        var wfsUrl = 'http://localhost:8080/geoserver/ne/wms?service=WFS&version=1.1.0&request=GetFeature&typeName=ne:hospital1&outputFormat=application/json&CQL_FILTER=' + columnName + "='" + term + "'";
        var wmsLayer = new ol.layer.Image({
            source: new ol.source.ImageWMS({
                url: 'http://localhost:8080/geoserver/ne/wms',
                params: { 'LAYERS': 'ne:hospital1' } // Thay thế bằng tên lớp của bạn
            })
        });

        // Thêm lớp WMS vào bản đồ
        map.addLayer(wmsLayer);
        fetch(wfsUrl)
            .then(response => response.json())
            .then(data => {
                if (data.features.length > 0) {
                    var geometry = data.features[0].geometry.coordinates; // Tọa độ của đối tượng vùng
                    var polygon = new ol.geom.Polygon(geometry);
                    console.log(geometry);
                    // Điều chỉnh khung nhìn trên bản đồ để zoom đến tọa độ của đối tượng
                    map.getView().fit(polygon, { padding: [50, 50, 50, 50] });
                } else {
                    alert('Không tìm thấy kết quả nào.');
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }

});