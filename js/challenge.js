/* eslint-disable no-console */
/*eslint-env browser*/

function debugAjax(){
	
	var mydata;

	$.ajax("data/MegaCities.geojson", {
		dataType: "json",
		success: function(response){
            mydata = response;
			
			debugCallback(mydata);
		}
	});

}

function debugCallback(mydata){

	$(mydiv).append('GeoJSON data: ' + JSON.stringify(mydata));
    
    console.log(mydiv);
}

$(document).ready(debugAjax);
