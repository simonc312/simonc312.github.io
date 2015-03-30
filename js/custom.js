$(document).ready(function(){
    $('.js .grid').addClass('loaded');
});

$(window).load(function() {
    $('.js .grid').load(function(){ $(this).addClass('loaded')});

    $('.sidebar-nav li').hover(
    	function(){  $('#site-wrapper').addClass('show-nav'); },
    	function(){ }
    	);

    $('#site-submenu').hover(
                function() {},
                function() {$('#site-wrapper').removeClass('show-nav');}
                );

    var addCurtain = function(image,anchor) {
        if( !image ) return;
        var curtain = document.createElement( 'div' );
        curtain.className = 'curtain';
        var rgb = new ColorFinder( function favorHue(r,g,b) {
            // exclude white
            //if (r>245 && g>245 && b>245) return 0;
            return (Math.abs(r-g)*Math.abs(r-g) + Math.abs(r-b)*Math.abs(r-b) + Math.abs(g-b)*Math.abs(g-b))/65535*50+1;
        } ).getMostProminentColor( image );
        if( rgb.r && rgb.g && rgb.b ) {
            curtain.style.background = 'rgb('+rgb.r+','+rgb.g+','+rgb.b+')';
        }
        anchor.appendChild( curtain );
         $(anchor).find('.curtain').one('webkitAnimationEnd oanimationend oAnimationend msAnimationEnd animationend',function(e){
            $(anchor).removeClass('animate');
            $(anchor).addClass('shown');
        });
    };

    //iterate over items to be displayed and add curtains at random range 0-500ms
    $('.js .grid .portfolio-item').each(function(index,item){
        
        if($(item).hasClass('shown'))
            return;

        var random_delay = Math.random()*500;
        window.setTimeout(function(){
            addCurtain($(item).find('img')[0],item);
            $(item).addClass('animate');
        },random_delay);
       
    });

});