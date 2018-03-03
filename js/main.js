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
    $.ajax({
        dataType: "json",
        url: "data/lightrailusa.geojson",
        success: function(response) {
            L.geoJSON(response, {
                onEachFeature: onEachFeature,
                
                pointToLayer: function (feature, latlng) {
                    return L.marker(latlng, {icon: railIcon});
            }
            }).addTo(mymap);
        }
    })
}

function onEachFeature(feature, layer) {
    //no property named popupContent; instead, create html string with all properties
    var popupContent = "";
    if (feature.properties) {
        //loop to add feature property names and values to html string
        for (var property in feature.properties){
            popupContent += "<p>" + property + ": " + feature.properties[property] + "</p>";
        }
        layer.bindPopup(popupContent);
    };
};

var railIcon = new L.Icon({
    iconSize: [32, 32],
    iconUrl: 'img/transport_rail1.png'
});

$(document).ready(mapSetup);