'use strict';

(function() {
    
    angular
        .module('simpleArmoryApp')
        .directive('saReputationRow', ReputationRow);

    function ReputationRow() {
        return {
            controller: ReputationRowController,
            restrict: 'E',
            scope: {
                faction: '=', 
            },
            templateUrl: function () {
                return 'views/reputationRow.html';
            }
        };
    }

    // Pixel widths of the different level types
   	var levelWidths = {
   		'hated': 150,
   		'hostel': 25,
        'unfriendly': 25,
        'neutral': 25,
        'friendly': 40,
        'honored': 60,
        'revered': 85,
        'exalted': 10,
        'stranger': 50,
        'acquaintance': 50,
        'buddy': 50,
        'friend': 50,
        'goodFriends': 50,
        'bestFriends': 50
   	};

    /*@ngInject*/ 
    var ReputationRowController = function ($scope, SettingsService) {

        $scope.settings = SettingsService;
    
        $scope.getWidth = function(level) {

            var num = $scope.faction[level] ? $scope.faction[level] : 0;

        	// pulls out the faction level percentage from the scope
        	// applies that percentage to the possible fixed width for the div
        	return (num / 100) * levelWidths[level] + 'px';
        };

        $scope.shouldShow = function(show) {
            // if we're at max, don't show the hover
            if ($scope.faction.max === 0) {
                $scope.show = false;
            } else {
                $scope.show = show;
            }
        }
    };
})();
