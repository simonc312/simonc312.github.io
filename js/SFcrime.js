var vehicle_theft_data;
      var vehicle_theft_district_data;
      var lat;
      var curZoomLevel = 12;
      var heatmap = {}; //dictionary of heatmaps per district
      var heatmapData = []; //2 dimensional array heat map pts by district
      var district_markers = [];
      var gradients = [];
      var heatmap_all;
      var heatmapData_all = [];

      function initializeHeatMapArray(){
        $.each(vehicle_theft_district_data.PdDistrict, function(i, district){
          heatmapData[district] = [];
          heatmap[i] = district;
          gradients[i] =  [
              'rgba(0, 255, 255, 0)',
              'rgba(0, 255, 255, 1)',
              'rgba(0, 191, 255, 1)',
              'rgba(0, 127, 255, 1)',
              'rgba(0, 63, 255, 1)',
              'rgba(0, 0, 255, 1)',
              'rgba(0, 0, 223, 1)',
              'rgba(0, 0, 191, 1)',
              'rgba(0, 0, 159, 1)',
              'rgba(0, 0, 127, 1)',
              'rgba(63, 0, 91, 1)',
              'rgba(127, 0, 63, 1)',
              'rgba(191, 0, 31, 1)',
              'rgba(255, 0, 0, 1)',
            ];
        });
      }

      function addHeatMapData(){
        $.each( vehicle_theft_data.X, function( i, lng ) {
            var location = new google.maps.LatLng(lat[i], lng);
            var district = vehicle_theft_data.PdDistrict[i];
            heatmapData[district].push(location);
            heatmapData_all.push(location);
        });

        $.each( heatmap, function(i, district){
          heatmap[i] = new google.maps.visualization.HeatmapLayer({
            data: heatmapData[district],
            gradient: gradients[i]
          });
          heatmap[i].setMap(null);
          });

        heatmap_all = new google.maps.visualization.HeatmapLayer({
            data: heatmapData_all
          });
          heatmap_all.setMap(null); 
        
      };

      function toggleHeatmap() {

          if(heatmap_all.getMap()){
            heatmap_all.setMap(null);
            $.each(district_markers,function(i,marker){
              marker.setVisible(true);
            });
          }else{
            $.each(district_markers,function(i,marker){
              marker.setVisible(false);
            });
            heatmap_all.setMap(map);
          }
      }

     function addDistrictData(){
      $.each( vehicle_theft_district_data.PdDistrict, function( i, district){
          var loc = new google.maps.LatLng(vehicle_theft_district_data.Y[i], vehicle_theft_district_data.X[i]);
          var magnitude = vehicle_theft_district_data.Total[i];
          var marker = new MarkerWithLabel({
            position: loc,
            map: map,
            title: district,
            animation: google.maps.Animation.DROP,
            icon: getCircle(magnitude,'red',.4),
            labelContent: "<div>"+district+"<div class='district_total'>"+magnitude+"</div></div>",
            labelAnchor: new google.maps.Point(50, 10),
            labelClass: "labels", // the CSS class for the label
            labelStyle: {opacity: 0.9},
            labelInBackground: false
          });

          district_markers[i] = marker;

          google.maps.event.addListener(marker, 'mouseover', function() {
              marker.setIcon(getCircle(magnitude,'transparent',.1));
              heatmap[i].setMap(map);
          });

          google.maps.event.addListener(marker, 'mouseout', function() {
              heatmap[i].setMap(null);
              marker.setIcon(getCircle(magnitude,'red',.4));
          });
        }
      );
     };

     function getCircle(magnitude,fColor,fOpacity) {
        return {
          path: google.maps.SymbolPath.CIRCLE,
          fillColor: fColor,
          fillOpacity: fOpacity,
          scale: 0.25*magnitude,
          strokeColor: 'white',
          strokeWeight: 0
        };
      };
     
    
      function initialize() {


        var sanFrancisco = new google.maps.LatLng(37.774546, -122.433523);
        var mapOptions = {
          center: sanFrancisco,
          zoom: curZoomLevel,
          minZoom: 12,
          streetViewControl: false,
          mapTypeId: google.maps.MapTypeId.ROAD
        };

        map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
        map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(document.getElementById('legend'));
        map.controls[google.maps.ControlPosition.LEFT_TOP].push(document.getElementById('zoom_level'));
        $('#zoom_level').text('Zoom Level: ' + curZoomLevel);
        map.setOptions(highLevelStyles);

          // bounds of the desired area
      var allowedBounds = new google.maps.LatLngBounds(
          new google.maps.LatLng(37.590059187414685, -122.63448208007815),
          new google.maps.LatLng(37.80174049420249, -122.3091720214844)
      );
      var lastValidCenter = map.getCenter();

      google.maps.event.addListener(map, 'center_changed', function() {
          if (allowedBounds.contains(map.getCenter())) {
            // still within valid bounds, so save the last valid position
            lastValidCenter = map.getCenter();
          } else{
            // not valid anymore => return to last valid position
            map.panTo(lastValidCenter);
          }
      });

        google.maps.event.addListener(map, 'zoom_changed', function () {
          var zoomLevel = map.getZoom();
          $('#zoom_level').text('Zoom Level: ' + zoomLevel);
          
          if((heatmap_all.getMap() && zoomLevel > curZoomLevel) || zoomLevel < 12 || zoomLevel > 13){
            $.each(district_markers,function(i,marker){
              marker.setVisible(false);
            });
              if(heatmap_all.getMap()== null){
                toggleHeatmap();
              }

          }else{

              if(heatmap_all.getMap()){
                toggleHeatmap();
              }

            $.each(district_markers,function(i,marker){
              marker.setVisible(true);
            });
          }

          if (zoomLevel > 10) {
              map.setOptions(highLevelStyles);
          } else {
              map.setOptions(lowLevelStyles);
          }
          curZoomLevel = zoomLevel;
        });
      }

      var highLevelStyles = {
        styles: [{
            'featureType': 'all',
                'elementType': 'labels',
                'stylers': [{
                'visibility': 'on'
            }]
        }]
    };

    var lowLevelStyles = {
        styles: [{
            'featureType': 'all',
                'elementType': 'labels',
                'stylers': [{
                'visibility': 'off'
            }]
        }, {
            'featureType': 'road',
                'elementType': 'labels.icon',
                'stylers': [{
                'visibility': 'off'
            }]
        }, {
            'stylers': [{
                'hue': '#00aaff'
            }, {
                'saturation': -50
            }, {
                'gamma': 1.15
            }, {
                'lightness': 12
            }]
        }, {
            'featureType': 'road',
                'elementType': 'labels.text.fill',
                'stylers': [{
                'visibility': 'on'
            }, {
                'lightness': 24
            }]
        }, {
            'featureType': 'road',
                'elementType': 'geometry',
                'stylers': [{
                'lightness': 85
            }]
        }]
    };

      google.maps.event.addDomListener(window, 'load', initialize);


           $.when(
        // Get all the data points for vehicle thefts
        $.getJSON('../../assets/vehicle.theft.json', function(json) {
          vehicle_theft_data =  json;
          lat = vehicle_theft_data.Y;
        }),

        // Get the PdDistrict mean locations and numbers
        $.getJSON("../../assets/vehicle.theft.location.json", function(json) {
          vehicle_theft_district_data = json;
        })


      ).then(function() {//consider adding on fail or on progress function handling

        // All is ready now
        addDistrictData();
        initializeHeatMapArray();
        addHeatMapData();
      });