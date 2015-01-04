      //constants for indices of vehicle_theft_data element fields 
      var LONGITUDE = 0;
      var LATITUDE  = 1;
      var DISTRICT  = 2;

      //constants for indices of vehicle theft date data element fields
      var DAY  = 0;
      var DATE = 1;
      var TIME = 2;
      var DESC = 3;
      var ADDR = 4;
      var ISAM = 5;
      
      var vehicle_theft_data;
      var vehicle_theft_date_data;
      var vehicle_theft_district_data;
      var curZoomLevel = 12;
      var heatmap = {}; //dictionary of heatmaps per district
      var heatmapData = []; //2 dimensional array heat map pts by district
      var district_markers = [];
      var unique_markers = [];
      var gradients = [];
      var heatmap_all;
      var heatmapData_all = []; //used for toggling heatmap display mode from district view or individual markers
      var lastValidCenter;
    // bounds of the desired area
      var allowedBounds = new google.maps.LatLngBounds(
          new google.maps.LatLng(37.590059187414685, -122.63448208007815),
          new google.maps.LatLng(37.80174049420249, -122.3091720214844)
      );
      var marker_icons = [ {'name': 'STOLEN AUTOMOBILE', 'icon': '../../assets/sf_crime_icons/car.png'},
                           {'name': 'ATTEMPTED STOLEN VEHICLE', 'icon': '../../assets/sf_crime_icons/car-attempted.png'},
                           {'name': 'STOLEN AND RECOVERED VEHICLE', 'icon':  '../../assets/sf_crime_icons/car-recovered.png'},
                           {'name': 'STOLEN MOTORCYCLE', 'icon': '../../assets/sf_crime_icons/motorcycle2.png'},
                           {'name': 'STOLEN TRUCK', 'icon': '../../assets/sf_crime_icons/truck2.png'}]
      //lunar landing stype from snazzy maps 
      var nightStyles = {
        styles: [{"stylers":[{"hue":"#ff1a00"},{"invert_lightness":true},{"saturation":-100},{"lightness":33},{"gamma":0.5}]},{"featureType":"water","elementType":"geometry","stylers":[{"color":"#2D333C"}]}]
      };

      var highLevelStyles = {
        styles: [{
            'featureType': 'all',
                'elementType': 'labels',
                'stylers': [{
                'visibility': 'on'
            }]
        }]
      };
      //pale dawn style from snazzy maps
      var dayStyles = {styles: [{"featureType":"water","stylers":[{"visibility":"on"},{"color":"#acbcc9"}]},{"featureType":"landscape","stylers":[{"color":"#f2e5d4"}]},{"featureType":"road.highway","elementType":"geometry","stylers":[{"color":"#c5c6c6"}]},{"featureType":"road.arterial","elementType":"geometry","stylers":[{"color":"#e4d7c6"}]},{"featureType":"road.local","elementType":"geometry","stylers":[{"color":"#fbfaf7"}]},{"featureType":"poi.park","elementType":"geometry","stylers":[{"color":"#c5dac6"}]},{"featureType":"administrative","stylers":[{"visibility":"on"},{"lightness":33}]},{"featureType":"road"},{"featureType":"poi.park","elementType":"labels","stylers":[{"visibility":"on"},{"lightness":20}]},{},{"featureType":"road","stylers":[{"lightness":20}]}]
      };

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
              labelClass: "district_labels", // the CSS class for the label
              labelStyle: {opacity: 0.9},
              labelInBackground: false
            });

            district_markers[i] = marker;

            google.maps.event.addListener(marker, 'click', function() {
                //marker.setIcon(getCircle(magnitude,'transparent',.1));
                marker.setVisible(false);
                map.setCenter(marker.position);
                map.setZoom(15);
            });

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
        $.each( vehicle_theft_data, function(i,data) {
            var lat = data[LATITUDE];
            var lng = data[LONGITUDE];
            var location = new google.maps.LatLng(lat, lng);
            var district = data[DISTRICT]; 
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

      function getUniqueIcon(description){
        for(var i=0; i<marker_icons.length;i++){
          if(marker_icons[i].name === description)
            return marker_icons[i].icon
        }
        return marker_icons[0].icon
      }

      function addUniqueData(){
        $.each( vehicle_theft_date_data, function( i, data){
          var loc  = heatmapData_all[i];
          var time = data[TIME];
          var isAM = data[ISAM];
          var date = data[DATE];
          var day  = data[DAY];
          var address   = data[ADDR];
          var description = data[DESC];
          var labelDivs = "<div>"+description+"<div class='unique_marker'>"+date+"</div>"+"<div>"+day + " " + time + " " + isAM +"</div>"+ "</div>"
          var image = {
            url: getUniqueIcon(description),
            size: new google.maps.Size(32, 37),
            origin: new google.maps.Point(0,0),
            anchor: new google.maps.Point(16, 37)
          };
          var marker    = new MarkerWithLabel({
            position: loc,
            map: map,
            title: description,
            //animation: google.maps.Animation.DROP,
            icon: image, 
            labelContent: labelDivs,
            labelAnchor: new google.maps.Point(50, 20),
            labelClass: "unique_labels", // the CSS class for the label
            //labelStyle: {opacity: 0.0},
            labelInBackground: false,
            labelVisible: false,
            visible: false
          });

          unique_markers[i] = marker;

          google.maps.event.addListener(marker, 'mouseover', function() {
              marker.labelVisible = true;
              
          });

          google.maps.event.addListener(marker, 'mouseout', function() {
              marker.labelVisible = false;
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

      function setMarkersVisible(markers,state){
         $.each(markers,function(i,marker){
              marker.setVisible(state);
            });
      }

      function setHeatmapVisible(state){
        if(state)
          heatmap_all.setMap(map);
        else
          heatmap_all.setMap(null);
      }

      function toggleNightStyle(){
        map.setOptions(nightStyles);
        map.setOptions(highLevelStyles);
      }

      function toggleHeatmap() {

          if(heatmap_all.getMap()){
            setHeatmapVisible(false);
            setMarkersVisible(district_markers,true);
          }else{
            setMarkersVisible(district_markers,false);
            setHeatmapVisible(true);
          }
      }

      function toggleMarkers(markers){
        if(markers[0].getVisible())
          setMarkersVisible(markers,false);
        else
          setMarkersVisible(markers,true);
      }

      function toggleUniqueMarkers(){
        toggleMarkers(unique_markers);
      }

      function toggleDistrictMarkers(){
        toggleMarkers(district_markers);
      }
     
      function centerChangedEventHandler() {
            if (allowedBounds.contains(map.getCenter())) {
              // still within valid bounds, so save the last valid position
              lastValidCenter = map.getCenter();
            } else{
              // not valid anymore => return to last valid position
              map.panTo(lastValidCenter);
            }
        }

      function zoomChangeEventHandler() {
          var zoomLevel = map.getZoom();
          $('#zoom_level').text('Zoom Level: ' + zoomLevel);

          //conditions to turn on district view
          if(zoomLevel <= 13){
            if(heatmap_all.getMap() && zoomLevel < curZoomLevel) //curZoomLevel is 14
              toggleHeatmap();
          }
          //conditions to turn on heat map view
          if(zoomLevel == 14){
            if(zoomLevel < curZoomLevel) //curZoomLevel is 15
              toggleUniqueMarkers(); //turn off
            if(heatmap_all.getMap() == null) //if off turn on
              toggleHeatmap();
          }
          //conditions to turn on unique markers view
          if(zoomLevel >= 15){
            if(heatmap_all.getMap()) //turn off heat map view
              setHeatmapVisible(false);
            if(unique_markers[0].getVisible() == false)
              toggleUniqueMarkers(); //turn on
          }

          curZoomLevel = zoomLevel;
        }
    
      function initialize() {

        var sanFrancisco = new google.maps.LatLng(37.774546, -122.433523);
        var mapOptions = {
          center: sanFrancisco,
          zoom: curZoomLevel,
          minZoom: 12,
          streetViewControl: false,
          mapTypeId: google.maps.MapTypeId.ROAD
        };
        var legend = document.getElementById('legend');
        map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
        map.controls[google.maps.ControlPosition.RIGHT_TOP].push(legend);
        map.controls[google.maps.ControlPosition.LEFT_TOP].push(document.getElementById('zoom_level'));
        map.setOptions(dayStyles);

        $.each(marker_icons, function(i,marker){
          var name = marker.name;
          var icon = marker.icon;
          var div = document.createElement('div');
          div.innerHTML = '<img src="' + icon + '"> ' + name;
          legend.appendChild(div);
        });

        $('#zoom_level').text('Zoom Level: ' + curZoomLevel);
        

        lastValidCenter = map.getCenter();

        google.maps.event.addListener(map, 'center_changed', centerChangedEventHandler);

        google.maps.event.addListener(map, 'zoom_changed', zoomChangeEventHandler);
      }

      google.maps.event.addDomListener(window, 'load', initialize);

      $.when(
        // Get all the data points for vehicle thefts
        $.getJSON('../../assets/vehicle.theft.json', function(json) {
          vehicle_theft_data =  json;
        }),

        // Get the PdDistrict mean locations and numbers
        $.getJSON("../../assets/vehicle.theft.location.json", function(json) {
          vehicle_theft_district_data = json;
        }),

        $.getJSON("../../assets/vehicle.theft.date.json", function(json) {
          vehicle_theft_date_data = json;
        })


      ).then(function() {//consider adding on fail or on progress function handling

        // All is ready now
        addDistrictData();
        initializeHeatMapArray();
        addHeatMapData();
        addUniqueData();
      });