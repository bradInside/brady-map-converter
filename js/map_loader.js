
google.maps.event.addDomListener(window, 'load', startConverter );
var bradymap = null;

function startConverter(){
	bradymap = new bradyMapLoader('map-canvas');
	bradymap.initialize();
	bradymap.setAutocomplete('start_pt');
	bradymap.setAutocomplete('end_pt');
}



function bradyMapLoader(mapContainerId){
	
	// id of the container where ggmap will inject his code
	this.mapContainerId = mapContainerId;
	//render options
	this.rendererOptions = {
  		draggable: true
	};

	// center of the map 
	this.startTown = new google.maps.LatLng(45.75, 4.85);
	// zoom level
	this.zoom = 7;
	// computed options
	this.mapOptions = {
		zoom:this.zoom,
		center:this.startTown
	};
	// will contain the ggmap object
	this.map = null;
	// directionDisplay service
	this.directionsDisplay = new google.maps.DirectionsRenderer(this.rendererOptions);
	// direction service
	this.directionsService = new google.maps.DirectionsService();
	// store autocompletes services
	this.autocompletes = [];


	// initialize the converter
	this.initialize = function (){
		// creating the map
		this.map = new google.maps.Map(
			document.getElementById(this.mapContainerId),
			this.mapOptions);
		// linkin the direction service with the map
		this.directionsDisplay.setMap(this.map);
		// listen to draggable events
		google.maps.event.addListener(this.directionsDisplay, 'directions_changed', function() {
				bradymap.onDirectionsChanged();
  		});
	}

	this.setAutocomplete = function (inputId){
		// load the autocomplete service on a field
		var autocomplete = new google.maps.places.Autocomplete(document.getElementById(inputId) );
		// store it in a tab var.
		this.autocompletes[''+inputId] =  autocomplete;
		google.maps.event.addListener(autocomplete, 'place_changed', function(inputId,autocomplete) {
		    bradymap.onAutoCompleteChanged();
		  });
	}


	this.onDirectionsChanged = function(){
		console.log('directionChanged');
		//console.log(this.directionsDisplay.getDirections());
	}

	this.onAutoCompleteChanged = function (inputId,autocomplete){

		if( $('#start_pt').val() != '' && $('#end_pt').val() != ''){
			this.drawingRoute([$('#start_pt').val(), $('#end_pt').val()]);
		}
	}

	this.drawingRoute = function(points){
		var start = points[0];
		var end = points[points.length-1];
		  var request = {
		      origin:start,
		      destination:end,
		      travelMode: google.maps.TravelMode.DRIVING
		  };
		  this.directionsService.route(request, function(response, status) {
		    console.log('ok');
		    if (status == google.maps.DirectionsStatus.OK) {
		    	console.log(response);
		    	console.log(bradymap);
		    	console.log(bradymap.directionsDisplay);
		      bradymap.directionsDisplay.setDirections(response);
		    }
		  });
	}
}
