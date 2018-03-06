/* eslint-disable no-console */
/*eslint-env browser*/
L.map = function (id, options) {
    return new L.Map(id, options);
};

function mapSetup(){
    
    var map = L.map('mapid').setView([34.45, -96.77], 4);

    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox.light',
    accessToken: 'pk.eyJ1Ijoid2lsbG91Z2hieTIiLCJhIjoiY2lzc2J5aWtpMDc2ODJ5cGh5MTlxNjczeSJ9.7FKJ5Mye4bhoImWAeCRhZg'
    }).addTo(map);
    
    getData(map);
    
}

function calcPropRadius(attValue) {
    //scale factor to adjust symbol size evenly
    var scaleFactor = .000005;
    //area based on attribute value and scale factor
    var area = attValue * scaleFactor;
    //radius calculated based on area
    var radius = Math.sqrt(area/Math.PI);

    return radius;
}

function createPropSymbols(data, map, attributes){

    //create a Leaflet GeoJSON layer and add it to the map
    L.geoJson(data, {
        pointToLayer: function(feature,latlng){
            return pointToLayer(feature, latlng, attributes);
        }
    }).addTo(map);
}

function updatePropSymbols(map, attribute){
    map.eachLayer(function(layer){
        if (layer.feature && layer.feature.properties[attribute]){
            
            var props = layer. feature.properties;
            
            var radius = calcPropRadius(props[attribute]);
            layer.setRadius(radius);
            
            var popupContent =  "<br><b>Rail Name: </b>" + props.name + "<br><b>City: </b>" + props.city + "<br><b>State: </b>" + props.state + "<br><b>Established in: </b>" + props.established;
            
            var year = attribute.split("_")[1];
            
            popupContent += "<p><b>Ridership in " + year + ":</b> " + props[attribute]/1000000 + " million</p>";
            
            layer.bindPopup(popupContent, {
                offset: new L.Point(0,0)
            });
            
        }
    })
}

function updateLegend(map, attribute){
    map.eachLayer(function(layer){
        if (layer.feature && layer.feature.properties[attribute]){
                        
            var year = attribute.split("_")[1];
            
            legendContent += "<p><b>Ridership in " + year;
            
            return legendContent;
            }
            
    })
    
}


function createSequenceControls(map, attributes){
    
    $('#panel').append('<button class="skip" id="reverse">Reverse</button>');
    $('#panel').append('<button class="skip" id="forward">Skip</button>');
    $('#reverse').html('<img width="50%" src="img/backward.png">');
    $('#forward').html('<img width="50%" src="img/forward.png">');
    
    $('#panel').append('<input class="range-slider" display="inline-block" type="range">');
    
    $('.range-slider').attr({
        max: 4,
        min: 0,
        value: 4,
        step: 1
    })
    
    $('.skip').click(function(){
        
        map.closePopup();
        
        var index = $('.range-slider').val();
        
        if ($(this).attr('id') == 'forward'){
            index++;
            index = index > 4 ? 0: index;
        } else if ($(this).attr('id') == 'reverse') {
            index--;
            index = index < 0 ? 4: index;
        }
        
        $('.range-slider').val(index);
        
        updatePropSymbols(map, attributes[index]);
        
    });
    
    $('.range-slider').on('input', function(){
        
        var index= $(this).val();
        
        updatePropSymbols(map, attributes[index]);
        updateLegend(map,attributes[index]);
        
    }); 

}

function processData(data){
    
    var attributes = [];
    
    var properties = data.features[0].properties;
    
    for (var attribute in properties){
        if (attribute.indexOf("riders") > -1){
            attributes.push(attribute);
        }
    }
    
    return attributes;
}

function pointToLayer(feature, latlng, attributes){
    
    var attribute = attributes[4];
    
    var options = {
        radius: 8,
        fillColor: "#cd2626",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8,
    };
    
    var attValue = Number(feature.properties[attribute]);
    
    options.radius = calcPropRadius(attValue);
    
    var layer = L.circleMarker(latlng, options);
    
    var popupContent = "<br><b>Rail Name: </b>" + feature.properties.name + "<br><b>City: </b>" + feature.properties.city + "<br><b>State: </b>" + feature.properties.state + "<br><b>Established in: </b>" + feature.properties.established + "<p><b>Ridership in 2016: </b> " + feature.properties[attribute]/1000000 + " million</p>";
    
    layer.bindPopup(popupContent);
    
    return layer;
     
}

function getData(map){

    $.ajax("data/railusa.geojson", {
        dataType: "json",
        success: function(response){
            
            var attributes = processData(response);
 
            createPropSymbols(response, map, attributes);
            createSequenceControls(map, attributes);
            createLegend(map, attributes);
        }
    });
}

function createLegend(map, attributes){
    var LegendControl = L.Control.extend({
        options: {
            position: 'bottomleft'
        },
        
        onAdd: function (map) {
            
            console.log(attributes);
            
            var container = L.DomUtil.create('div', 'legend-control-container');
            
            $(container).append('<div id="temporal-legend">')
            
            var year = attribute.split("_")[1];
            
            legendContent += "<p><b>Ridership in " + year;
            
            $(container).append(legendContent);
            
            return container;
        }
    })
    
    map.addControl(new LegendControl());
}

$(document).ready(mapSetup);