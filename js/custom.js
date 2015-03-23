function toggleNav() {
    if ($('#site-wrapper').hasClass('show-nav')) {
        // Do things on Nav Close
        $('#site-wrapper').removeClass('show-nav');
    } else {
        // Do things on Nav Open
        $('#site-wrapper').addClass('show-nav');
    }

    //$('#site-wrapper').toggleClass('show-nav');
}


$(window).load(function() {

    var circleDataset = [{name : "New York"},{name:"Houston"},
    {name:"San Francisco"},{name:"Berkeley"}];
$('.sidebar-nav li').hover(
	function(){  $('#site-wrapper').addClass('show-nav'); },
	function(){ }
	);

$('#site-submenu').hover(
            function() {},
            function() {$('#site-wrapper').removeClass('show-nav');}
            );

}
);