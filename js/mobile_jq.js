// Start with the map page
//window.location.replace(window.location.href.split("#")[0] + "#mappage");

var selectedFeature = null;
var mappopup = null;

// fix height of content
function fixContentHeight() {
  var footer = $("div[data-role='footer']:visible"),
      content = $("div[data-role='content']:visible:visible"),
      header = $("div[data-role='header']:visible"),
      //content = $("div[data-role='content']:visible"),
      mapdiv = $("#map"),
      viewHeight = $(window).height(),
      contentHeight = viewHeight - footer.outerHeight() - header.outerHeight();

  if ((content.outerHeight() + footer.outerHeight()) !== viewHeight) {
    contentHeight -= (content.outerHeight() - content.height() + 1);
    content.height(contentHeight);
    mapdiv.height(contentHeight);
  }

/*  if (window.map) {
    map.updateSize();
  } */
  if (window.map && window.map instanceof OpenLayers.Map) {
    map.updateSize();
  } else {
    // initialize map
    init_the_map( function(feature) { 
      selectedFeature = feature; 
      popup_feature(feature);
    }, addnewpoi);
    replace_poi_list(initialPoiList);
    map.zoomToExtent(spl.getDataExtent());
  } 
};

var initialPoiList = [];

var poiList = new Array();

var draw_pois = function(list) {
  spl = window.sprintersLayer;
  for(var i = 0; i < list.length; ++i) {
    var pt = new OpenLayers.Geometry.Point(list[i].lon, list[i].lat);
    pt.transform(mercator, map.getProjectionObject());
    spl.addFeatures([
        new OpenLayers.Feature.Vector(
          pt,
          {listpos: i},
          {
            graphicName: 'cross',
            strokeColor: list[i].active ? '#00f' : '#f00',
            strokeWidth: 2,
            fillOpacity: 0.1,
            strokeOpacity: list[i].active ? 1.0 : 0.6,
            pointRadius: 10
          })
        ]);
  }
}

var addnewpoi = function(pointGeometry) {
//  console.log(pointGeometry);
  var point = new OpenLayers.Geometry.Point(pointGeometry.x, pointGeometry.y);
  point.transform(map.getProjectionObject(), mercator);
  $('#addnewpoi_lon').text(point.x);
  $('#addnewpoi_lat').text(point.y);
  $('#poiname').val('');
  $('#newpoilon').val(point.x);
  $('#newpoilat').val(point.y);
  //$('#newpoipopup').popup({overlayTheme: "a", theme: "a", transition: "pop"});
//  $('#newpoipopup').dialog({overlayTheme: "a", theme: "a", transition: "pop"});
  //$('#newpoipopup').popup('open');
  $.mobile.changePage( "#newpoipopup", { role: "dialog" } );
/*  drawControl.handler.stopDown = true;
  drawControl.handler.stopUp = true; */
}

var canceladdnewpoi = function(ev) {
  newpoiClickLayer.removeAllFeatures();
}

var yesaddnewpoi = function(ev) {
  newpoiClickLayer.removeAllFeatures();
  var np = {
    name: $('#poiname').val(),
    active: true,
    score: 1.0,
    lon: $('#newpoilon').val(),
    lat: $('#newpoilat').val()
  }
  initialPoiList.push(np);
  replace_poi_list(initialPoiList);
}

var activate_poiclicker = function() {
//  map.addControl(drawControl);
  drawControl.activate();
}

var replace_poi_list = function(list) {
  poiList = new Array();
  spl = window.sprintersLayer;
  spl.removeAllFeatures();
  $('#poiList').empty();
  for(var i = 0; i < list.length; ++i) {
    poiList.push(list[i]);
    var lie = $('<li>', {});
    var lia = $('<a>', {href: "#",
                        text: list[i].name});
    lie.append(lia);
    var lipmd = $('<div>', {'data-role': "controlgroup",
                            'data-type': "horizontal",
                            'data-mini': "true"});
    var lip = $('<button>', {
                        class: "ui-btn ui-corner-all ui-icon-plus ui-btn-icon-bottom"});
    lip.on('click', null, i, function(ev) {
      ev.stopPropagation();
      var listpos = ev.data;
      poiList[listpos].score += 1;
      var tmp = $(this).parent().parent().parent();
      tmp.find('#score').text(poiList[listpos].score);
    });
    var lim = $('<button>', {
                        class: "ui-btn ui-corner-all ui-icon-minus ui-btn-icon-bottom"});
    lim.on('click', null, i, function(ev) {
      ev.stopPropagation();
      var listpos = ev.data;
      poiList[listpos].score -= 1;
      if(poiList[listpos].score < 1) {
        poiList[listpos].score = 1;
      }
      var tmp = $(this).parent().parent().parent();
      tmp.find('#score').text(poiList[listpos].score);
    });
    lipmd.append(lip);
    lipmd.append(lim);
    lie.append(lipmd);
    var liflip = $('<select>', {'data-role': "slider"});
    var liflip_on = $('<option>', {value: "on",
                                   text: "visit"});
    var liflip_off = $('<option>', {value: "off",
                                   text: "no visit"});
    liflip.change(i, function(ev) {
      ev.stopPropagation();
      var listpos = ev.data;
      var active = $(this)[0].selectedIndex == 0 ? false : true;
      poiList[listpos].active = active;
      spl = window.sprintersLayer;
      spl.removeAllFeatures();
      draw_pois(poiList);
    });

    liflip.append(liflip_off);
    liflip.append(liflip_on);
    lie.append(liflip); 
    if(list[i].active) {
      liflip.val('on');
    } else {
      liflip.val('off');
    }
    var lisp = $('<span>', {text: list[i].score,
                     id: 'score',
                     class: "ui-li-count"});
    lia.append(lisp);
    lia.on('click', null, i, function(ev) {
      ev.stopPropagation();
      var listpos = ev.data;
//      alert('pos: ' + listpos + ' active: ' + poiList[listpos].active);
      var lonlat = new OpenLayers.LonLat(poiList[listpos].lon, poiList[listpos].lat);
      lonlat.transform(mercator, map.getProjectionObject());
      map.panTo(lonlat);
/*      map.setCenter(new OpenLayers.LonLat(poiList[listpos].lon,
                                          poiList[listpos].lat)); */
    });
    lie.appendTo('#poiList');
  }
  draw_pois(poiList);
  $('#poiList').listview().listview('refresh');
  $('#poiListPanel').trigger('create');
/*   var scbar = $("#poiListPanel").data("plugin_tinyscrollbar");
  scbar.update(); */
  //$("#poiList").data("mobileIscrollview").refresh();
//  $('#poiList').iscrollview("refresh");
};

var append_to_popup = function(text) {
  $('#popup_textarea').val($('#popup_textarea').val() + text);
};

function factorial(num) {
  var rval=1;
  for (var i = 2; i <= num; i++)
    rval = rval * i;
  return rval;
}

var shortest = null;
var shortest_distance = null;

function calc_for_permutation(dists, pois, perm) {
  var dist = 0.0;
  for(var i = 1; i < perm.length; ++i) {
    dist += dists[perm[i-1]][perm[i]] * (1.0 / pois[i].score);
  }
  if(!shortest_distance) {
    shortest_distance = dist;
    // copy permutation
    shortest = perm.slice();
  } else {
    if(dist < shortest_distance) {
      shortest_distance = dist;
      shortest = perm.slice();
    }
  }
}

function permute_and_calc(dists, pois, perm) {
  var N = perm.length;
  var p = new Array(N+1);
  for(var i = 0; i < N+1; ++i) {
    p[i] = i;
  }
  var i = 1;
  var j = 0;
  calc_for_permutation(dists, pois, perm);
  while(i < N) {
    p[i] = p[i] - 1;
    if(i % 2 != 0) {
      j = p[i];
    } else {
      j = 0;
    }
    // swap
    var tmp = perm[j];
    perm[j] = perm[i];
    perm[i] = tmp;
    calc_for_permutation(dists, pois, perm);
    i = 1;
    while(p[i] == 0) {
      p[i] = i;
      ++i;
    }
  }
}

var calc_route = function() {
  $.mobile.changePage('#popup', {transition: 'pop', role: 'dialog'});
  $('#popup_textarea').val('');
  
  spl = window.sprintersLayer;

  append_to_popup('Fetching all distances ...\n');

  var cleanPoi = new Array();

  for(var i = 0; i < poiList.length; ++i) {
    if(poiList[i].active) {
      cleanPoi.push(poiList[i]);
    }
  }

  var poilen = cleanPoi.length;
  var total_dists = (poilen * poilen - poilen) / 2;
  var total_ctr = 0;
  var dists = new Array();

  for(var i = 0; i < poilen; ++i) {
    dists.push(new Array());
    for(var j = 0; j < poilen; ++j) {
      dists[i].push(0.0);
    }
  }

  for(var i = 0; i < cleanPoi.length; ++i) {
    for(var j = 0; j < i; ++j) {
      ++total_ctr;
      append_to_popup('  ' + total_ctr + '/' + total_dists + '\n');
      var point1 = new OpenLayers.Geometry.Point(cleanPoi[i].lon, cleanPoi[i].lat);
//        point1.transform(geographic, mercator);
      var point2 = new OpenLayers.Geometry.Point(cleanPoi[j].lon, cleanPoi[j].lat);
//        point2.transform(geographic, mercator);
//        var dist = point1.distanceTo(point2);
      var line = new OpenLayers.Geometry.LineString([point1, point2]);
      var dist = line.getGeodesicLength(mercator);
      dists[i][j] = dist;
    }
  }

  for(var i = 0; i < poilen; ++i) {
    for(var j = i+1; j < poilen; ++j) {
      dists[i][j] = dists[j][i];
    }
  }
  
  append_to_popup('Creating all permutations (' + factorial(cleanPoi.length) +  ')... \n');

  var perm_init = new Array();
  for(var i = 0; i < cleanPoi.length; ++i) {
    perm_init.push(i);
  }

  shortest_distance = null;
  shortest = null;

  permute_and_calc(dists, cleanPoi, perm_init);

  append_to_popup('Shortest distance: ' + shortest_distance + '\n');

  var perm = shortest;

  spl.removeAllFeatures();
  var startpoint = new OpenLayers.Geometry.Point(cleanPoi[perm[0]].lon, cleanPoi[perm[0]].lat);
  // startpoint.transform(geographic, mercator);
  startpoint.transform(mercator, map.getProjectionObject());
  spl.addFeatures([                
      new OpenLayers.Feature.Vector(
        startpoint,
        {listpos: perm[0]},
        {       
          graphicName: 'star',
          strokeColor: '#0ff',
          strokeWidth: 2,
          fillOpacity: 0,
          strokeOpacity: 1.0,
          pointRadius: 10
        })
      ]);

  draw_pois(poiList);

  for(var i = 1; i < shortest.length; ++i) {
    var point1 = new OpenLayers.Geometry.Point(cleanPoi[perm[i-1]].lon, cleanPoi[perm[i-1]].lat);
    //        point1.transform(geographic, mercator);          
    var point2 = new OpenLayers.Geometry.Point(cleanPoi[perm[i]].lon, cleanPoi[perm[i]].lat);
    //        point2.transform(geographic, mercator);
    drawline = new OpenLayers.Geometry.LineString([point1.transform(mercator,
          map.getProjectionObject()), point2.transform(mercator, map.getProjectionObject())]);
    spl.addFeatures([                
        new OpenLayers.Feature.Vector(
          drawline,
          {},
          { 
            strokeColor: '#f00',
            strokeOpacity: 0.5,
            strokeWidth: 2
          })
        ]);
  }
  map.zoomToExtent(spl.getDataExtent());
  
//  $('#popup').dialog('close');
};

var popup_feature = function(feature) {
 /* if(window.mappopup) {
    map.removePopup(window.mappopup);
    window.mappopup.destroy();
    window.mappopup = null;
  }

  var popup = new OpenLayers.Popup.FramedCloud("popup",
    OpenLayers.LonLat.fromString(feature.geometry.toShortString()),
    null,
    "<div>" + poiList[feature.attributes.listpos].name + "</div>",
    null,
    true);
  window.mappopup = popup;
  map.addPopup(popup);*/
  $('#namepopup_content').text(poiList[feature.attributes.listpos].name);
//  $.mobile.changePage('#namepopup', {role: "popup", transition: "pop"});
//  $.mobile.changePage('#namepopup', "pop");
  $('#namepopup').popup({overlayTheme: "a", theme: "a", transition: "pop"});
  $('#namepopup').popup('open');
};

$(document).ready(function() {
  // one-time initialisation of button handlers 

  $("#plus").on('click', function(){
    map.zoomIn();
  });

  $("#minus").on('click', function(){
    map.zoomOut();
  });

  $("#locate").on('click', function(){
    var control = map.getControlsBy("id", "locate-control")[0];
    if (control.active) {
      control.getCurrentLocation();
    } else {
      control.activate();
    }
  });

  $('#show_all_pois').on('click', function() {
    spl = window.sprintersLayer;
    map.zoomToExtent(spl.getDataExtent());
  });

  //fix the content height AFTER jQuery Mobile has rendered the map page
  $('#mappage').on('pageshow', function (){
    fixContentHeight();
  });

  $(window).bind("orientationchange resize", fixContentHeight);

  $("#calculate_route").on('click', calc_route);

  $("#add_new_poi").on('click', activate_poiclicker);
  $("#cancaladdnewpoi").on('click', canceladdnewpoi);
  $("#yesaddnewpoi").on('click', yesaddnewpoi);

  $("#popup_close").on('click', function(ev) {
    $('#popup').dialog('close'); 
  });

  /* init_the_map( function(feature) { 
          selectedFeature = feature; 
    //    $.mobile.changePage("#popup", "pop"); 
  }); */
  
//  $("#poiListPanel").tinyscrollbar();
  
  window.location.replace(window.location.href.split("#")[0] + "#mappage");
});
