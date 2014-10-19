'use strict';

/* Directives */
(function() {

	angular
        .module('simpleArmoryApp')
        .directive('ngEnter', ngEnter);

    function ngEnter() {
	    return function (scope, element, attrs) {
	        element.bind("keydown keypress", function (event) {
	            if(event.which === 13) {
	                scope.$apply(function (){
	                    scope.$eval(attrs.ngEnter);
	                });

	                event.preventDefault();
	            }
	        });
	    };
    }

})();
