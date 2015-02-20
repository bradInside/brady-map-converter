/**
 *
 * Use HTML5 Sortable jQuery Plugin
 * http://farhadi.ir/projects/html5sortable
 *
 * Copyright 2012, Ali Farhadi
 * Released under the MIT license.
 */

google.maps.event.addDomListener(window, 'load', startConverter );
var bradymap = null;
var nb_step =0;

function startConverter(){
	bradymap = new bradyMapLoader('map-canvas');
	bradymap.initialize();
	bradymap.setAutocomplete('start_pt');
	bradymap.setAutocomplete('end_pt');

	setNewStepListener();
	setBaseListeners();
	setSortable();
}


/**
	create a new step, need to use list 
**/
function addNewStep($button){
	nb_step++;
	var id = 'step_'+nb_step;

	// creating the new input
	var $newStep = $('#template_new_step').clone();
	$newStep.find('label').text('Etape '+nb_step);
	$newStep.find('input').attr('id','step_'+nb_step);
	$newStep.removeAttr('id').attr('draggable','true');
	// creating the new button
	$newButton = $('#add_step_li_tp').clone();
	$newButton.removeAttr('id');
	$($newStep).insertAfter($button.parents('.add_step_li'));
	$($newButton).insertAfter($newStep);
	setNewStepListener();
	setSortable();
	bradymap.setAutocomplete(id);
}

function setNewStepListener(){
	$('.add_step_button').unbind('click').click(function(e){
		e.preventDefault();
		addNewStep($(this));
	});
}

function setSortable(){
	$('.sortable').sortable();
}

function setBaseListeners(){
	$('#generateGpx').unbind('click').click(function(){
		bradymap.generateGpx();
		return false;
	});

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

	this.currentDirection = null;


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
		console.log(bradymap.directionsDisplay.getDirections());
		this.currentDirection = bradymap.directionsDisplay.getDirections();
	}

	this.onAutoCompleteChanged = function (inputId,autocomplete){

		if( $('#start_pt').val() != '' && $('#end_pt').val() != ''){
			this.drawingRoute([$('#start_pt').val(), $('#end_pt').val()]);
		}
	}

	this.drawingRoute = function(points){
		var start = points[0];
		var end = points[points.length-1];
		var waypts = [];

		$('.waypt').each(function(){
			var $inp = $(this).find('input');
			if($inp.val() != ''){
				waypts.push({
					location: $inp.val()
				});
			}
		});
		  var request = {
		      origin:start,
		      destination:end,
		      waypoints: waypts,
      		  optimizeWaypoints: true,
		      travelMode: google.maps.TravelMode.DRIVING
		  };
		  this.directionsService.route(request, function(response, status) {
		    //console.log('ok');
		    if (status == google.maps.DirectionsStatus.OK) {
		      bradymap.directionsDisplay.setDirections(response);
		    }
		  });
	}

	this.generateGpx = function(){
		var $root = $('<XMLDocument />');
		$root.append(
			$('<metadata />').append(
				$('<name></name>').text('trajet xxxx')
			)
		);
		$('div.exports').text($root.html());
	}
}
