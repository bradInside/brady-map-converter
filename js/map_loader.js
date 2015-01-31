
//google.maps.event.addDomListener(window, 'load', startConverter );
function initialize() {
        var mapOptions = {
          center: { lat: -34.397, lng: 150.644},
          zoom: 8
        };
        var map = new google.maps.Map(document.getElementById('map-canvas'),
            mapOptions);
      }
      google.maps.event.addDomListener(window, 'load', initialize);
var bradymap = null;

function startConverter(){
	alert('hello');
	bradymap = new bradyMapLoader('map-canvas');
	bradymap.initialize();
}



function bradyMapLoader(mapContainerId){
	
	this.mapContainerId = mapContainerId;
	this.rendererOptions = {
  		draggable: true
	};
	this.startTown = new google.maps.LatLng(45.75, 4.85);
	this.zoom = 7;
	this.mapOptions = {
		zoom:7,
		center:this.startTown
	};
	this.map = null;
	this.directionsDisplay = new google.maps.DirectionsRenderer(this.rendererOptions);
	this.directionsService = new google.maps.DirectionsService();


	this.initialize = function (){
		this.map = new google.maps.Map(
			document.getElementById(this.mapContainerId),
			this.mapOptions);
		this.directionsDisplay.setMap(this.map);
		google.maps.event.addListener(this.directionsDisplay, 'directions_changed', function() {
				this.onDirectionsChanged();
  		});
	}

	this.loadMap = function(url)
	{
		var _iframe = '<iframe id="temp_iframe" src="'+url+'"></iframe>';
		$('#map_iframe_container').append(_iframe);
		$('#map_iframe_container').load(function(){
			var iframe = $('#filecontainer').contents();
		});
	}

	this.onDirectionsChanged = function(){
		console.log(directionsDisplay.getDirections());
	}
}
