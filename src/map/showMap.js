
$("#document").ready(function () {
    var format = 'image/png';
    var zoom = 16.56631263565161;
    var rotation = 0;
    var center = [564429.04, 2317738.2]
    var boundsHaNoiDiem = [105.639060974121, 20.8092403411865, 106.00464630127, 21.1050090789795];
    // var boundsHaNoiDuong = [105.285301208496, 20.6077270507813, 106.023727416992, 21.3891468048096]
    // var boundsHaNoiVung = [105.285301208496, 20.5604095458984, 106.023727416992, 21.38938331604]
    // var boundsHospital1 = [105.493293762207, 20.8008670806885, 105.947441101074, 21.253101348877]

    var projection = new ol.proj.Projection({
        code: 'EPSG:404000',
        units: 'm',
        axisOrientation: 'neu'
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

    var viewMap = new ol.View({
        projection: projection,
        center: center,
        zoom: zoom,
        rotation: rotation
    });
    var map = new ol.Map({
        target: "map",
        layers: [
            layerBG, haNoiDiem, haNoiDuong, haNoiVung, hospital1, hospital2
        ],
        view: viewMap
    });
    //map.getView().fitExtent(bounds, map.getSize());
    map.getView().fit(boundsHaNoiDiem, map.getSize());

});