$(document).ready(function(){
	wireEvents();
});

function wireEvents() {
/*
	$cswrapper = $('#city-select-wrapper');
	$cslist = $('#city-select-list');
	$cslist.top = $cswrapper.top + $cswrapper.height;
	$cslist.left = $cswrapper.left;
	$cslist.hide();
*/
	
	$('#city-select-wrapper').click(function() {
		toggleCitySelect();
	})
	
}
function toggleCitySelect() {
	if($('#city-select-list').css('display') == 'none')
		$('#city-select-list').slideDown(50);
	else
		$('#city-select-list').slideUp(50);
}