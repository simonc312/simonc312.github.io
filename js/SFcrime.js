      //constants for indices of vehicle_theft_data element fields 
      var DATA = {'LONGITUDE':0,'LATITUDE':1,'DISTRICT':2};
      //constants for indices of vehicle theft date data element fields
      var DATE_DATA = {'DAY':0,'DATE':1,'TIME':2,'DESC':3,'ADDR':4,'ISAM':5};
      var DISTRICT_CIRCLE = {'COLOR': {'ON':'red','OFF':'transparent'},'OPACITY': {'ON':0.4,'OFF':0}};
      var LEVEL = {'DISTRICT':13,'HEAT_MAP':14,'UNIQUE_MARKER':15}
      var vehicle_theft_data;
      var vehicle_theft_date_data;
      var vehicle_theft_district_data;
      var sf_district_bios;
      var lastValidCenter;
      var curZoomLevel = 13;
      var current_marker;
      var heatmap = {}; //dictionary of heatmaps per district
      var heatmapData = []; //array of heat map pts grouped by district ex 'TARAVAL'
      var district_markers = [];
      var unique_markers = []; //array of marker objects grouped by description ex 'STOLEN VEHICLE'
      var gradients = [];
      var heatmap_all;
      var heatmapData_all = []; //used for toggling heatmap display mode from district view or individual markers
      
    // bounds of the desired area
      var allowedBounds = new google.maps.LatLngBounds(
          new google.maps.LatLng(37.590059187414685, -122.63448208007815),
          new google.maps.LatLng(37.80174049420249, -122.3091720214844)
      );
      var marker_icons = [ {'name': "STOLEN VEHICLE", 'icon': '../../assets/sf_crime_icons/car.png', 'inactive_icon':'../../assets/sf_crime_icons/car-inactive.png'},
                           {'name': "ATTEMPTED STOLEN VEHICLE", 'icon': '../../assets/sf_crime_icons/car-attempted.png', 'inactive_icon':'../../assets/sf_crime_icons/car-inactive.png'},
                           {'name': "STOLEN AND RECOVERED VEHICLE", 'icon':  '../../assets/sf_crime_icons/car-recovered.png', 'inactive_icon':'../../assets/sf_crime_icons/car-inactive.png'},
                           {'name': "STOLEN MOTORCYCLE", 'icon': '../../assets/sf_crime_icons/motorcycle2.png', 'inactive_icon':'../../assets/sf_crime_icons/motorcycle-inactive.png'},
                           {'name': "STOLEN TRUCK", 'icon': '../../assets/sf_crime_icons/truck2.png','inactive_icon':'../../assets/sf_crime_icons/truck-inactive.png'}]
      
      //only one infowindow needed to avoid clutter
      var infowindow = new google.maps.InfoWindow(
          {
            maxWidth: 340
          });

      google.maps.InfoWindow.prototype.isOpen = function(){
        var map = infowindow.getMap();
        return (map !== null && typeof map !== "undefined");
      }

      //determine which style is active
      var isDay = true;
      //lunar landing stype from snazzy maps 
      var nightStyles = {
        styles: [{"stylers":[{"hue":"#ff1a00"},{"invert_lightness":true},{"saturation":-100},{"lightness":33},{"gamma":0.5}]},{"featureType":"water","elementType":"geometry","stylers":[{"color":"#2D333C"}]}]
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
              icon: getCircle(magnitude,DISTRICT_CIRCLE.COLOR.ON,DISTRICT_CIRCLE.OPACITY.ON),
              labelContent: "<div class='district_font_size'>"+district+"<div class='district_total'>"+magnitude+"</div></div>",
              labelAnchor: new google.maps.Point(50, 10),
              labelClass: "district_labels", 
              labelStyle: {opacity: 0.9},
              labelInBackground: false
            });

            district_markers[i] = marker;

            google.maps.event.addListener(marker, 'dblclick', function() {
                marker.setVisible(false);
                map.setCenter(marker.position);
                map.setZoom(LEVEL.UNIQUE_MARKER);
            });

            google.maps.event.addListener(marker, 'click', function() {
              var district_bio = $('#district_bio');
              if(heatmap[i].getMap() != null){
                heatmap[i].setMap(null);
                marker.setIcon(getCircle(magnitude,DISTRICT_CIRCLE.COLOR.ON,DISTRICT_CIRCLE.OPACITY.ON));
                var data = district_bio.data('current_district');
                if(data != undefined && data === district)
                  district_bio.addClass('hide');
              }
              else{
                marker.setIcon(getCircle(magnitude,DISTRICT_CIRCLE.COLOR.OFF,DISTRICT_CIRCLE.OPACITY.OFF));
                heatmap[i].setMap(map);
                district_bio.data('current_district',district);
                district_bio.html(getDistrictBio(district));
                district_bio.removeClass('hide');
              }
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
            var lat = data[DATA.LATITUDE];
            var lng = data[DATA.LONGITUDE];
            var district = data[DATA.DISTRICT];
            var location = new google.maps.LatLng(lat, lng); 
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

      function getDistrictBio(district){
        for(var i=0;i<sf_district_bios.length;i++){
          var district_obj = sf_district_bios[i];
          if(district_obj.district === district){
            var content = document.createElement('div');
            content.className = "bio-window min-width";
            content.innerHTML = "<h3>"+district+" District Bio<h3>";
            for(var index=0;index< district_obj.full_name.length;index++){
              var innerDiv = document.createElement('div');
              innerDiv.className = "border-row";
              innerDiv.innerHTML =  "<h4 class='spacing'>"+district_obj.full_name[index]+"</h4>"+
                                    "<div><p>"+district_obj.description[index]+"</p></div>"+
                                    '<a href="'+district_obj.url[index]+'" target="_blank">Read more</a>'
                                    
              content.appendChild(innerDiv);
            }
            return content;
          }
        }
      }

      function getUniqueIcon(description){
        for(var i=0; i<marker_icons.length;i++){
          if(marker_icons[i].name === description)
            return marker_icons[i].icon;
        }
        return marker_icons[0].icon; //default stolen automobile icon
      }

      function addUniqueData(){
        var normal_size = new google.maps.Size(28, 33);
        var scaled_size = new google.maps.Size(32,37);
        var normal_anchor = new google.maps.Point(16, 33);
        var scaled_anchor = new google.maps.Point(16, 37);

        var updateIcon = function(marker,icon,size,anchor){
          icon.scaledSize = size;
          icon.size = size;
          icon.anchor = anchor;
          marker.setIcon(icon);
        } 

        $.each( vehicle_theft_date_data, function( i, data){
          var loc  = heatmapData_all[i];
          var time = data[DATE_DATA.TIME];
          var isAM = data[DATE_DATA.ISAM];
          var date = data[DATE_DATA.DATE];
          var day  = data[DATE_DATA.DAY];
          var address   = data[DATE_DATA.ADDR];
          var description = data[DATE_DATA.DESC];
          var content = "<div class='infowindow'>"+
                            "<h3>"+description+"</h3>"+
                            "<div><span>address:</span> "+address+"</div>"+
                            "<div><span>date: </span> "+date+" "+day+" "+time+" "+isAM+"</div>"+
                        "</div>"
          
          var marker_array = unique_markers[description]
          if(marker_array == undefined)
            return false; //skip this datapoint because it has an abnormal description not handled by legend
          var icon = {
            url: getUniqueIcon(description),
            size: normal_size,
            scaledSize : normal_size,
            origin: new google.maps.Point(0,0),
            anchor: normal_anchor
          };
          var marker = new google.maps.Marker({
            position: loc,
            map: map,
            title: description,
            icon: icon, 
            visible: false
          });
          
          marker_array.push(marker);
          var activateIcon = function(){updateIcon(marker,icon,scaled_size,scaled_anchor);}
          var normalizeIcon = function(){updateIcon(marker,icon,normal_size,normal_anchor);}
          google.maps.event.addListener(marker,'mouseover',activateIcon);

          google.maps.event.addListener(marker,'mouseout',function(){
            if(current_marker != marker)
              normalizeIcon();
          });

          google.maps.event.addListener(marker, 'click', function() {
            var is_next_marker = current_marker != marker;
            if(infowindow.isOpen()){
              google.maps.event.trigger(infowindow,'closeclick'); //we always want to close infowindow on second click and reset
            }
            if(is_next_marker){
              current_marker = marker;
              infowindow.setContent(content);
              infowindow.open(map,marker);
              google.maps.event.addListenerOnce(infowindow,'closeclick',function(){
                normalizeIcon();
                current_marker = undefined;
                infowindow.close();
            });
            }
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

      function toggleMapStyle(){
        if(isDay)
          map.setOptions(nightStyles);
        else
          map.setOptions(dayStyles);
        isDay = !isDay;
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

      function toggleUniqueMarkers(turnOn){
        if(turnOn){
          $('.active-icon').each(function(){
            setMarkersVisible(unique_markers[this.name],true);
          });
        }
        else{
           $('.active-icon').each(function(){
            setMarkersVisible(unique_markers[this.name],false);
          });
        }
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
          var legend = $('#legend');
          $('#zoom_level').text('Zoom Level: ' + zoomLevel);

          //conditions to turn on district view
          if(zoomLevel <= LEVEL.DISTRICT){
            if(zoomLevel < curZoomLevel){
              if(heatmap_all.getMap())
                toggleHeatmap(); //turn off
                toggleUniqueMarkers(false); //turn off
            } 
            else if(!district_markers[0].getVisible())
              toggleDistrictMarkers(); //turn on
          }
          //conditions to turn on heat map view
          if(zoomLevel == LEVEL.HEAT_MAP){
            if(zoomLevel < curZoomLevel)
              toggleUniqueMarkers(false); //turn off
            if(heatmap_all.getMap() == null) //if off turn on
              toggleHeatmap();
          }
          //conditions to turn on unique markers view
          if(zoomLevel >= LEVEL.UNIQUE_MARKER){
            legend.removeClass('hide');
            if(heatmap_all.getMap()) //turn off heat map view
              setHeatmapVisible(false);
            toggleUniqueMarkers(true);
            //turn on based on active legend symbols
          }else{
            if(legend.hasClass('hide') == false)
              legend.addClass('hide');
          }

        //infowindow only relevant when zoom is high enough to see symbols
          if(zoomLevel < LEVEL.UNIQUE_MARKER){
            infowindow.close();
          }
          curZoomLevel = zoomLevel;
        }

      function setUpLegend(){
        var legend = document.getElementById('legend');
        var container = document.createElement('div');
        container.innerHTML = "<div><h3>Interactive Legend</h3><div>";
        container.className = 'bio-window slide';
        container.id = 'inner_legend';
        $.each(marker_icons, function(i,marker){
          var name = marker.name;
          var icon = marker.icon;
          var inactive_icon = marker.inactive_icon;
          var symbolDiv = document.createElement('div');
          var image = document.createElement('img');

          unique_markers[name] = []; //setup uniquemarkers array of arrays
          image.setAttribute('src',icon);
          image.setAttribute('id','legend-icon'+i);
          image.className = 'active-icon'; //all icons start active
          image.name = name; //stored name in image to reference later when toggling unique marker visibility
          symbolDiv.appendChild(image);
          symbolDiv.innerHTML += name;
          container.appendChild(symbolDiv);
        });
        legend.appendChild(container);
        legend.innerHTML += "<a id='legend_arrow' class='arrow sprite-up-arrow' href='javascript:void(0)'></a>";
        $('#legend_arrow').click(function(){
          var self = $(this);
          var updateArrow = function(){self.toggleClass("sprite-up-arrow sprite-down-arrow");};
          $('#inner_legend').slideToggle('linear',updateArrow);
        });

        $.each(marker_icons,function(i,marker){
          var icon = marker.icon;
          var inactive_icon = marker.inactive_icon;
          $('#legend-icon'+i).click(function(){
            var self = $(this);
            if(self.hasClass('inactive-icon')){
              self.attr('src',icon);
              self.toggleClass("active-icon inactive-icon");
              setMarkersVisible(unique_markers[marker.name],true);
            }
            else{  
              self.attr('src',inactive_icon);
              self.toggleClass("active-icon inactive-icon");
              setMarkersVisible(unique_markers[marker.name],false);
            }
          });
        });
      }
    
      function initialize() {
        var sanFrancisco = new google.maps.LatLng(37.78763688993816, -122.42317685292451);
        var mapOptions = {
          center: sanFrancisco,
          zoom: curZoomLevel,
          minZoom: 12,
          streetViewControl: false,
          mapTypeId: google.maps.MapTypeId.ROAD
        };

        map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
        map.controls[google.maps.ControlPosition.RIGHT_TOP].push(document.getElementById('panel'));
        map.controls[google.maps.ControlPosition.LEFT_TOP].push(document.getElementById('zoom_level'));
        map.setOptions(dayStyles);
        
        $('#zoom_level').text('Zoom Level: ' + curZoomLevel);
        lastValidCenter = map.getCenter();
        google.maps.event.addListener(map, 'center_changed', centerChangedEventHandler);
        google.maps.event.addListener(map, 'zoom_changed', zoomChangeEventHandler);
      }

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
        }),
        // Get text descriptions of districts and url links to read more
        $.getJSON("../../assets/sf_district_bios.json", function(json) {
          sf_district_bios = json;
        })

      ).then(function() {//consider adding on fail or on progress function handling
        // All is ready now
        initialize();
        addDistrictData();
        initializeHeatMapArray();
        addHeatMapData();
        setUpLegend();
        addUniqueData();
      });