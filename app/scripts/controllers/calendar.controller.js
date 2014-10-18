'use strict';

(function() {
    
    angular
        .module('simpleArmoryApp')
        .controller('CalendarCtrl' , CalendarCtrl);

    function CalendarCtrl($scope) { 

    	$scope.totalForMonth = 23;
    	$scope.totalPoints = '(15 points)';
	
		buildMonths(); 

		// Select the last month
		$scope.month = $scope.months.length - 1;

    	$scope.leftOneMonth = function() {
    		if ($scope.month > 0) {
    			$scope.month--;
    		}   
    	};

    	$scope.rightOneMonth = function() {
    		if ($scope.month < $scope.months.length - 1) {
    			$scope.month++;	
    		}    		
    	};

    	function buildMonths() {
    		var monthnames = [,'January','February','March','April','May','June','July','August','September','October','November','December'];
			var months = [];
			var today = new Date();

			for (var year = 2008; year <= today.getFullYear(); year++) {
				for (var month = 1; month <= 12; month++) {
					var monthid = ''+((month < 10)?'0':'')+month;
					
					// TODO: don't include early months if there were not achievements for that month
					/*if ((!isfirstmonth) || (typeof calendar[''+yearx+monthid] != 'undefined')) {
						calenpages.push(''+yearx+monthid);
						isfirstmonth = false;
						if ((yearx == today.getFullYear()) && (monthx == (today.getMonth()+1))) break;
					}
					*/
					
					months.push(monthnames[month] + ' ' + year);

					// Stop once we get to this month
					if ((year == today.getFullYear()) && (month == (today.getMonth()+1))) break;
				}
			}

    		$scope.months = months;
    	}
    }

})();