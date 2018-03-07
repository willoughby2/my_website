/* eslint-disable no-console */
/*eslint-env browser*/
L.map = function (id, options) {
    return new L.Map(id, options);
};

function mapSetup(){
    // set the view for the contiguous United States
    var map = L.map('mapid').setView([34.45, -96.77], 4);

    //I chose mapbox.light map since its grayscale would all my icons to stand out. 
    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox.light',
    accessToken: 'pk.eyJ1Ijoid2lsbG91Z2hieTIiLCJhIjoiY2lzc2J5aWtpMDc2ODJ5cGh5MTlxNjczeSJ9.7FKJ5Mye4bhoImWAeCRhZg'
    }).addTo(map);
    
    getData(map);
    
}

function calcPropRadius(attValue) {
    //scale factor had to be extremely small since data was in the millions
    var scaleFactor = .000005;

    var area = attValue * scaleFactor;

    var radius = Math.sqrt(area/Math.PI);

    return radius;
}

function createPropSymbols(data, map, attributes){

    L.geoJson(data, {
        pointToLayer: function(feature,latlng){
            return pointToLayer(feature, latlng, attributes);
        }
    }).addTo(map);
}

function updatePropSymbols(map, attribute){
    map.eachLayer(function(layer){
        if (layer.feature && layer.feature.properties[attribute]){
            
            var props = layer.feature.properties;
            
            var radius = calcPropRadius(props[attribute]);
            layer.setRadius(radius);
            
            //Included all important data in popup
            var popupContent =  "<br><b>Rail Name: </b>" + props.name + "<br><b>City: </b>" + props.city + "<br><b>State: </b>" + props.state + "<br><b>Established in: </b>" + props.established;
            
            var year = attribute.split("_")[1];
            
            //I truncated the ridership numbers to make them easier to read.
            popupContent += "<p><b>Ridership in " + year + ":</b> " + props[attribute]/1000000 + " million</p>";
            
            layer.bindPopup(popupContent, {
                offset: new L.Point(0,0)
            });
            
        }
    })
}

//clears the initial legend and updates as the slider is initialized
function updateLegend(map, attribute){
    map.eachLayer(function(layer){
        if (layer.feature && layer.feature.properties[attribute]){
            
            $(".legend-control-container").html("");
                        
            var year = attribute.split("_")[1];

            var legendContent = "<p5><b>Ridership in " + year + "</p5>";
            
            $(".legend-control-container").append(legendContent);
            
            return legendContent;
            }
            
    })
    
}

//creates the marker filter
function createFilter (map, layer, feature) {
    $('.menu a').click(function() {
        $('.menu a.active').removeClass('active');
        
        var filter = $(this).data('filter');
        
        if (filter = 'all') {
            $(this).addClass('active').siblings().removeClass('active');            
            
            
        };
        
        if (filter = 'before_1950') {
            
             $(this).addClass('active').siblings().removeClass('active');
            
            //trying to call the true/false attribute, but it comes back as undefined. I would love help on this part.
            if (layer.properties.before_1950 = true) return true;
            else return false;
            
        };
        
        if (filter = 'after_1950') {
             $(this).addClass('active').siblings().removeClass('active');
            
            //trying to call the true/false attribute, but it comes back as undefined.
            if (layer.properties.after_1950 = true) return true;
            else return false;
            
        }
        
    })
    
}


function createSequenceControls(map, attributes){
    //creates the buttons for the slider
    $('#panel').append('<button class="skip" id="reverse">Reverse</button>');
    $('#panel').append('<button class="skip" id="forward">Skip</button>');
    $('#reverse').html('<img width="50%" src="img/backward.png">');
    $('#forward').html('<img width="50%" src="img/forward.png">');
    
    //creates the slider
    $('#panel').append('<input class="range-slider" display="inline-block" type="range">');
    
    $('.range-slider').attr({
        max: 4,
        min: 0,
        //I started the value at the end to step the slider back in time.
        value: 4,
        step: 1
    })
    
    $('.skip').click(function(){
        //added to close popups before the slider updates the propsymbols layer
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
        
        //slider will update symbols on the map and the legend
        updatePropSymbols(map, attributes[index]);
        updateLegend(map,attributes[index]);
        
    });
    
    $('.range-slider').on('input', function(){
        
        var index= $(this).val();
        
        updatePropSymbols(map, attributes[index]);
        updateLegend(map,attributes[index]);
        
    }); 

}

function processData(data){
    //sets up the attributes variable
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
    
    //I chose a red color to make it pop against the grayscale map
    var options = {
        radius: 8,
        fillColor: "#cd2626",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.7,
    };
    
    var attValue = Number(feature.properties[attribute]);
    
    options.radius = calcPropRadius(attValue);
    
    //creates the circle markers using options above
    var layer = L.circleMarker(latlng, options);
    
    //creates the popup
    var popupContent = "<br><b>Rail Name: </b>" + feature.properties.name + "<br><b>City: </b>" + feature.properties.city + "<br><b>State: </b>" + feature.properties.state + "<br><b>Established in: </b>" + feature.properties.established + "<p><b>Ridership in 2016: </b> " + feature.properties[attribute]/1000000 + " million</p>";
    
    //adds the popup info to the circle marker layer
    layer.bindPopup(popupContent);
    
    return layer;
     
}


//creates the legend with Ridership year
function createLegend(map, attributes){
    var LegendControl = L.Control.extend({
        options: {
            position: 'bottomleft'
        },
        
        onAdd: function (map) {
            
            var container = L.DomUtil.create('div', 'legend-control-container');

            var legendContent = "<p4><b>Ridership in 2016</p4>"
            
            $(container).append('<div id="temporal-legend">', legendContent)
            
            return container;
        }
    })
    
    map.addControl(new LegendControl());
}

function getData(map){

    $.ajax("data/railusa.geojson", {
        dataType: "json",
        success: function(response){
            
            var attributes = processData(response);
 
            createPropSymbols(response, map, attributes);
            createSequenceControls(map, attributes);
            createLegend(map, attributes);
            createFilter(map, response);
        }
    });
}

$(document).ready(mapSetup);