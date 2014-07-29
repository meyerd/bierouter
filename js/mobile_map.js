// initialize map when page ready
var map;

/* 
// Get rid of address bar on iphone/ipod
var fixSize = function() {
    window.scrollTo(0,0);
    document.body.style.height = '100%';
    if (!(/(iphone|ipod)/.test(navigator.userAgent.toLowerCase()))) {
        if (document.body.parentNode) {
            document.body.parentNode.style.height = '100%';
        }
    }
};
setTimeout(fixSize, 700);
setTimeout(fixSize, 1500);
*/
var geographic = new OpenLayers.Projection("EPSG:900913");
var mercator = new OpenLayers.Projection("EPSG:4326");
var sprintersLayer;
var newpoiLayer;
var newpoiClickLayer;
var drawControl;

var init_the_map = function (onSelectFeatureFunction, onNewPoiFeatureFunction) {
  var vector = new OpenLayers.Layer.Vector("Vector Layer", {});

  sprintersLayer = new OpenLayers.Layer.Vector("Sprinters", {});

  newpoiLayer = new OpenLayers.Layer.Vector("newpoiLayer");
  newpoiClickLayer = new OpenLayers.Layer.Vector("newpoiClickLayer");

  var selectControl = new OpenLayers.Control.SelectFeature(sprintersLayer, {
    autoActivate: true,
    onSelect: onSelectFeatureFunction
  });

  var geolocate = new OpenLayers.Control.Geolocate({
    id: 'locate-control',
      geolocationOptions: {
        enableHighAccuracy: false,
        maximumAge: 0,
        timeout: 7000
      }
  });

  var featureAdded = function(event) {
    newpoiLayer.removeAllFeatures();
    // Get the centre xy
    var widthOffset = (event.feature.geometry.bounds.right - event.feature.geometry.bounds.left) / 2;
    var centreX = event.feature.geometry.bounds.left + widthOffset;

    var heightOffset = (event.feature.geometry.bounds.top - event.feature.geometry.bounds.bottom) / 2;
    var centreY = event.feature.geometry.bounds.bottom + heightOffset;

    // Create the point geometry
    var pointGeometry = new OpenLayers.Geometry.Point(centreX, centreY);

    var pointFeature = new OpenLayers.Feature.Vector(pointGeometry, {}, 
        {
          graphicName: 'cross',
          strokeColor: '#0ff',
          strokeWidth: 2,
          fillOpacity: 0,
          strokeOpacity: 1.0,
          pointRadius: 10
        });
    newpoiLayer.addFeatures([pointFeature]);

    drawControl.deactivate();
    map.removeControl(drawControl);

    onNewPoiFeatureFunction(pointGeometry);
  };

  newpoiClickLayer.events.register('featureadded', this, featureAdded);

  var drawOptions = {
    handlerOptions: {
      freehand: true
    }
  };

  //drawControl = new OpenLayers.Control.DrawFeature(newpoiClickLayer, OpenLayers.Handler.Point, drawOptions);
  drawControl = new OpenLayers.Control.DrawFeature(newpoiClickLayer, OpenLayers.Handler.Point, drawOptions);
//  map.addControl(drawControl);
  drawControl.deactivate();
 

  // create map
  map = new OpenLayers.Map({
    div: "map",
    //theme: null,
//    projection: proj,
    numZoomLevels: 18,
    controls: [
      new OpenLayers.Control.Zoom(),
      new OpenLayers.Control.Attribution(),
      new OpenLayers.Control.TouchNavigation({
        dragPanOptions: {
          enableKinetic: true
        }
      }), 
      geolocate,
      drawControl,
      selectControl
    ],
    layers: [
      new OpenLayers.Layer.OSM("OpenStreetMap", null, {
        transitionEffect: 'resize'
      }),
      vector,
      newpoiLayer,
      newpoiClickLayer,
      sprintersLayer
    ],
    center: new OpenLayers.LonLat(0, 0),
    zoom: 1 
  });

//  drawControl.activate();
/*  drawControl.handler.stopDown = false;
  drawControl.handler.stopUp = false;  */
/*  drawControl.handler.stopDown = true;
  drawControl.handler.stopUp = true; */

  var style = {
    fillOpacity: 0.1,
    fillColor: '#000',
    strokeColor: '#f00',
    strokeOpacity: 0.6
  };

  geolocate.events.register("locationupdated", this, function(e) {
    vector.removeAllFeatures();
    vector.addFeatures([
      new OpenLayers.Feature.Vector(
        e.point,
        {},
        {
          graphicName: 'cross',
          strokeColor: '#f00',
          strokeWidth: 2,
          fillOpacity: 0,
          pointRadius: 10
        }),
      new OpenLayers.Feature.Vector(
        OpenLayers.Geometry.Polygon.createRegularPolygon(
          new OpenLayers.Geometry.Point(e.point.x, e.point.y),
                                        e.position.coords.accuracy / 2,
                                        50,
                                        0
              ),
          {},
          style)
    ]);
    map.zoomToExtent(vector.getDataExtent());
  });
};

