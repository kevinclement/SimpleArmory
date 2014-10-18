'use strict';

(function() {
    
    angular
        .module('simpleArmoryApp')
        .controller('CalendarCtrl' , CalendarCtrl);

    function CalendarCtrl($scope) { 

    	$scope.totalForMonth = 23;
    	$scope.totalPoints = '(15 points)';
    }

})();