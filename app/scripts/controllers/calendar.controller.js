'use strict';

(function() {
    
    angular
        .module('simpleArmoryApp')
        .controller('CalendarCtrl' , CalendarCtrl);

    function CalendarCtrl($scope, AchievementsService, $sce, $routeParams, $window, SettingsService) { 

        $scope.settings = SettingsService;
    
		// Analytics for page
        $window.ga('send', 'pageview', 'Calendar');

    	AchievementsService.getAchievements().then(function(achievements){
	
			buildMonths(achievements, $routeParams.character); 

			// Select the last month
			$scope.selectedMonth = $scope.months[$scope.months.length - 1];
			$scope.selectionChanged();
        });

    	$scope.leftOneMonth = function() {
    		if ($scope.selectedMonth.index > 0) {
    			$scope.selectedMonth = $scope.months[$scope.selectedMonth.index - 1];
    			$scope.selectionChanged();
    		}       		
    	};

    	$scope.rightOneMonth = function() {
    	
    		if ($scope.selectedMonth.index < $scope.months.length - 1) {
    			$scope.selectedMonth = $scope.months[$scope.selectedMonth.index + 1];
    			$scope.selectionChanged();
    		}    		
    	};

    	$scope.selectionChanged = function() {
    		var cc = $('.curCalendar');
    		cc.removeClass('curCalendar');
    		cc.hide();

			var newCC = $('#calendar' + $scope.selectedMonth.value);
			newCC.addClass('curCalendar');
			newCC.show();

			// Fill in the totals 
			$scope.totalForMonth = $scope.selectedMonth.total;
    		$scope.totalPoints = '(' + $scope.selectedMonth.points + ' points)';
    	};

    	function buildMonths(achievements, charname) {
    		var monthnames = ['','January','February','March','April','May','June',
    						   'July','August','September','October','November','December'];
			var months = [];
			var today = new Date();
			var achByMonths = {};

			var calendarHtml = '';

			// build a lookup of month to achievement list
			angular.forEach(achievements, function(supercat) {
				angular.forEach(supercat.categories, function(cat) {
					angular.forEach(cat.subcat, function(subcat) {
						angular.forEach(subcat.achievements, function(ach) {
							if (ach.completed) {
								var dt = new Date(ach.completed);
								var monthid = ''+dt.getFullYear()+((dt.getMonth() < 9)?'0':'')+(dt.getMonth()+1);

								if (!achByMonths[monthid]) {
									achByMonths[monthid] = new Array(31);
								}
								if (!achByMonths[monthid][dt.getDate()]) {
									achByMonths[monthid][dt.getDate()] = [];
								} 
								
								achByMonths[monthid][dt.getDate()].push(ach);

								achByMonths[monthid].hasAchievements = true;
							}
						});		
					});
				});
			});

			var index = 0;
			var foundFirstMonth = false;
			for (var year = 2008; year <= today.getFullYear(); year++) {
				for (var month = 1; month <= 12; month++) {
					var monthid = '' + year + ((month < 10)?'0':'') + month;
					var thisMonth = (year === today.getFullYear()) && (month === (today.getMonth()+1));

					// if we're still trying to find the first month, don't include a bunch of months that don't have achievements
					if (!foundFirstMonth && (!achByMonths[monthid] || !achByMonths[monthid].hasAchievements)) {
						continue;
					}
					foundFirstMonth = true;
					
					// build up the table information
					var rowData = buildRows(month, year, achByMonths, charname);

					// Add the table to the html
					calendarHtml += '<table class="calendar' + (thisMonth ? ' curCalendar' : '') + 
						'" id="calendar'+ monthid +'" style="display: ' + (thisMonth ? 'block' : 'none') + '">';
					calendarHtml += rowData.rows;
					calendarHtml += '</table>';

					// Add the months to the list of months
					months.push({
						value:monthid,
						text:monthnames[month] + ' ' + year,
						index: index++,
						total: rowData.total,
						points: rowData.points
					});

					// Stop once we get to this month
					if (thisMonth) {
						break;
					}
				}
			}

			$scope.tableHtml = $sce.trustAsHtml(calendarHtml);
    		$scope.months = months;
    	}

    	function buildRows(month, year, achByMonths, charname) {
			var rows = '';
		    var total = 0;
		    var points = 0;
		    var d;
		    var prettyName = charname.charAt(0).toUpperCase() + charname.slice(1);
			var lookup = '' + year + ((month < 10)?'0':'') + month;

		    for (var day = 1; day <= 31; day++) {
		        d = new Date(year, month - 1, day);
		        if (d.getDate() !== day) {
		        	break;
		        }
		        if ((day === 1) || (d.getDay() === 0)) {
		        	rows += '<tr>';	
		        } 
		        if ((day === 1) && (d.getDay() > 0)) {
		        	rows += '<td colspan="'+(d.getDay())+'" class="dayspacer"></td>';
		        }
		        rows += '<td>' + day;

		        if (achByMonths[lookup] && achByMonths[lookup][day]) {
		        	var  achievs = achByMonths[lookup][day];
		        	achievs.sort(achievementDaySort);

			        rows += '<div>';
			        angular.forEach(achievs, function(ach) {
						rows += '<a target="' + $scope.settings.anchorTarget + '" href="//' + 
								$scope.settings.WowHeadUrl + '/achievement=' + ach.id + '" ' +
			        			'rel="who=' + prettyName + '&amp;when=' + ach.completed +'">' +
			        			'<img src="//wow.zamimg.com/images/wow/icons/medium/' + 
			        			ach.icon.toLowerCase() + '.jpg" width="36" height="36" border="0"></a>';

			            total++;
						points += ach.points;
					});
			        rows += '</div>';
		        }

		        rows += '</td>';
		        if (d.getDay() === 6) {
		        	rows += '</tr>';	
		        } 
		    }
		    if (d.getDay() < 6) {
		    	rows += '<td colspan="'+(6-d.getDay())+'" class="dayspacer"></td>';
		    }

		    rows += '</tr>';

		    return { 'rows': rows, 'total': total, 'points'	: points };
    	}
    }

    function achievementDaySort(achieve1, achieve2) {
		if (achieve1.completed === achieve2.completed) {
			return (parseInt(achieve1.id,10) < parseInt(achieve2.id,10)) ? -1 : 1;
		}

		return (achieve1.completed < achieve2.completed) ? -1 : 1;
	}

})();