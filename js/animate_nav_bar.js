/**
 * cbpAnimatedHeader.js v1.0.0
 * http://www.codrops.com
 *
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 * 
 * Copyright 2013, Codrops
 * http://www.codrops.com
 */
var cbpAnimatedHeader = (function() {

  var docElem = document.documentElement,
    header = document.querySelector( '.navbar-fixed-top' ),
    didScroll = false,
    changeHeaderOn = 0;
  var timeOut = 250;
  var sy_old = Number.POSITIVE_INFINITY;

  function init() {
    window.addEventListener( 'scroll', function( event ) {
      if( !didScroll ) {
        didScroll = true;
        setTimeout( scrollPage, timeOut );
      }
    }, false );
  }

  function scrollPage() {
    var sy = scrollY();
    if(shouldChange(sy, sy_old))
      $(header).removeClass('navbar-slide-up');
    else
      $(header).addClass('navbar-slide-up');
    sy_old = sy;
    didScroll = false;
  }

  function scrollY() {
    return window.pageYOffset || docElem.scrollTop;
  }

  function shouldChange(sy, sy_old) {
    return (sy_old - sy) >= changeHeaderOn;
  }

  init();

})();