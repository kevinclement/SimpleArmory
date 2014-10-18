'use strict';

(function() {
    
    angular
        .module('simpleArmoryApp')
        .directive('saReputationRow', ReputationRow);

    function ReputationRow() {
    	return {
        	controller: ReputationRowController,
        	link: linkFn,
        	restrict: 'E',
    		scope: {
        		faction: '='
      		},
        	templateUrl: 'scripts/directives/reputationRow.html'
    	};
    }

    // Pixel widths of the differnent level types
   	var levelWidths = {
   		'hated': 150,
   		'hostel': 25,
        'unfriendly': 25,
        'neutral': 25,
        'friendly': 40,
        'honored': 60,
        'revered': 85,
        'exalted': 10
   	};

    var ReputationRowController = function ($scope, $sce) {

        $scope.getWidth = function(level) {

        	// pulls out the faction level percentage from the scope
        	// applies that percentage to the possible fixed width for the div
        	return ($scope.faction[level] / 100) * levelWidths[level] + 'px';
        };
    };

    var linkFn = function (scope, lElement, attrs, controller) {

    };

})();
