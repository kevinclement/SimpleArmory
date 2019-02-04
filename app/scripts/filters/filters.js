'use strict';

(function() {
    angular
    	.module('simpleArmoryApp')
        .filter('filterUnobtainables', filterUnobtainables);

	/* Filters */
	function filterUnobtainables() {

		return function (category, unobtainable) {
			var filteredCatergory = [];

		    for(var i = 0; i < category.length; i++) {
		    	if(!unobtainable) {
					unobtainable = undefined;
				}

				// Proceed if some mounts in the sub-category are obtainable OR
				// if every sub-category mount is unobtainable and the 'show unobtainables' option is enabled
		    	if(
		    		category[i].items.some(function(subCategory) { return subCategory.notObtainable === unobtainable || subCategory.collected; }) || 
		    		category[i].items.every(function(subCategory) { return subCategory.notObtainable !== unobtainable; }) && 
		    		unobtainable
		    	) {	
		    		// Proceed if all the mounts are currently in-game
		    		if(category[i].items.some(function(subCategory) { return !subCategory.notIngame; })) {
		    			filteredCatergory.push(category[i]);	
		    		}	
		    	}
		    }

		    return filteredCatergory;
		};
	}
})();