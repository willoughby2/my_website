/* eslint-disable no-console */
/*eslint-env browser*/
function mapSetup(){
    
    var mymap = L.map('mapid').setView([34.45, -96.77], 4);

    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox.light',
    accessToken: 'pk.eyJ1Ijoid2lsbG91Z2hieTIiLCJhIjoiY2lzc2J5aWtpMDc2ODJ5cGh5MTlxNjczeSJ9.7FKJ5Mye4bhoImWAeCRhZg'
    }).addTo(mymap);
    
    addData(mymap);
    
}

function addData(mymap){
    $.ajax("data/lightrailusa.geojson", {
        dataType: "json",
        success: function(response){

            console.log(response)

            var markers = L.markerClusterGroup();

            for (var i = 0; i < response.features.length; i++) {
                var a = response.features[i];
                //add properties html string to each marker
                var properties = "";
                for (var property in a.properties){
                    properties += "<p>" + property + ": " + a.properties[property] + "</p>";
                };
                var marker = L.marker(new L.LatLng(a.geometry.coordinates[1], a.geometry.coordinates[0]), { properties: properties });
                //add a popup for each marker
                marker.bindPopup(properties);
                //add marker to MarkerClusterGroup
                markers.addLayer(marker);
            }

            //add MarkerClusterGroup to map
            mymap.addLayer(markers);
        }
    });
}

$(document).ready(mapSetup);