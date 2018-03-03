/* eslint-disable no-console */
/*eslint-env browser*/

var mymap = L.map('mapid').setView([34.45, -96.77], 4);

L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
}).addTo(mymap);

var lightraildata = new L.geoJson();
lightraildata.addTo(mymap);

$.ajax({
dataType: "json",
url: "data/lightrailusa.geojson",
success: function(data) {
    $(data.features).each(function(key, data) {
        lightraildata.addData(data);
    });
}
}).error(function() {});