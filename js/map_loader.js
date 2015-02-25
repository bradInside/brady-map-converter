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
var MODE_TEST = "MODE_TEST";
var MODE_NORMAL = "MODE_NORMAL";
var auto_generation = true;
var mode = MODE_NORMAL;

function startConverter(){
	
		bradymap = new bradyMapLoader('map-canvas');
		if( mode  != MODE_TEST){
			bradymap.initialize();
		}else {
			$('.sidebar').hide();
		}
		if(auto_generation){
			bradymap.generateGpx();
		}
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

		//var overviewPath = this.currentDirection.routes[0].overview_path;
		
		var $trkseg = '<trkseg>';
		if(this.currentDirection != null )
		{
			var routes = this.currentDirection.routes;
			if(routes.length > 0){
				var overview_path = routes[0].overview_path;
				var lg = overview_path.length
				for (i=0;i<lg;i++){
					if(i%2 ==  0 || i == lg-1){
						$trkseg +='<trkpt lat="'+ overview_path[i].lat() +
						 '" lon="' +
						  overview_path[i].lng() + '" ></trkpt>';
					}
				}
			}
		}
		$trkseg += '</trkseg>';
		var xmlBase = '<gpx version="1.1" creator="bradyMapCreator"><trk><name>BradyMapCreator Gpx </name>'+$trkseg+'</trk></gpx>'; 
		var xmldoc  = jQuery.parseXML(xmlBase);
		this.xmldoc = $(xmldoc);
		console.log(this.xmldoc.html());
		this.xmlBase = xmlBase;
		//var test = $('div').append(xmldoc).html();
		//$('div.exports textarea').text('').text(this.xmldoc.html());
		//var temp = '<?xml encoding="UTF-8" ?>\n' + $('div.exports textarea').val();
		//$('div.exports textarea').val(temp);
		//$('div.exports textarea').format({method: 'xml'});
		$('div.exports pre').text('<?xml encoding="UTF-8" ?>\n'+xmlBase);
		$('div.exports textarea').val($('div.exports pre').text());
		$('div.exports textarea').format({method: 'xml'});
		
	}
}
