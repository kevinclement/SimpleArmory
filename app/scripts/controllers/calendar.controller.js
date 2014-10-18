'use strict';

(function() {
    
    angular
        .module('simpleArmoryApp')
        .controller('CalendarCtrl' , CalendarCtrl);

    function CalendarCtrl($scope, $sce) { 

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

			var calendarHtml = '';

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
					
					var thisMonth = (year == today.getFullYear()) && (month == (today.getMonth()+1));

					months.push(monthnames[month] + ' ' + year);

					// Add this month to the calendar html
					var rowData = buildRows(month, year);
					calendarHtml += '<table class="calendar" id="calendar'+ year + monthid +'" style="display: ' + (thisMonth ? "block" : "none")+ '" total="' + rowData.total + '" points="' + rowData.points + '"">';
					calendarHtml += rowData.rows;
					calendarHtml += '</table>';

					// Stop once we get to this month
					if (thisMonth) break;
				}
			}

			$scope.tableHtml = $sce.trustAsHtml(calendarHtml);
    		$scope.months = months;
    	}

    	function buildRows(month, year) {
			var rows = "";
		    var total = 0;
		    var points = 0;
		    for (var day = 1; day <= 31; day++) {
		        var d = new Date(year, month - 1, day);
		        if (d.getDate() != day) break;
		        if ((day == 1) || (d.getDay() == 0)) rows += '<tr>';
		        if ((day == 1) && (d.getDay() > 0)) rows += '<td colspan="'+(d.getDay())+'" class="dayspacer"></td>';
		        rows += '<td>' + day;

		        // TODO: build out achieve data
		        // if ((typeof calendarData != 'undefined') && (typeof calendarData[day] != 'undefined')) {
		        //     day = calendarData[day];
		        //     day.sort(achdatesort);
		        //     rows += '<div>'
		        //     for (achx in day) {
		        //         ach = day[achx];
		        //         rows += '<a href="http://www.wowhead.com/achievement='+ach.id+'" rel="who=' + latestprofile.name + '&amp;when='+ach.completed+'"><img src="http://wow.zamimg.com/images/wow/icons/medium/'+ach.icon.toLowerCase()+'.jpg" width="36" height="36" border="0"></a>';

		        //         total++;
		        //         points += ach.points;
		        //     }
		        //     rows += '</div>';
		        // }

		        rows += '</td>';
		        if (d.getDay() == 6) rows += '</tr>';
		    }
		    if (d.getDay() < 6) rows += '<td colspan="'+(6-d.getDay())+'" class="dayspacer"></td>';

		    rows += "</tr>";

		    return { "rows": rows, "total": total, "points": points };
    	}
    }

})();