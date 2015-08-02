/*globals $WowheadPower */
'use strict';

(function() {
    
    angular
        .module('simpleArmoryApp')
        .controller('MountsCtrl' , MountsCtrl);

    function MountsCtrl($scope, MountsAndPetsService, PlannerService, $window) {

    	// Analytics for page
        $window.ga('send', 'pageview', 'Mounts');

        // anchor css used for planner checkbox
        $scope.anchorCss = function (boss) {
            if (boss.epic) {
                return 'mnt-plan-epic';
            }

            return 'mnt-plan-rare';
        };

        // img src for planner image
        $scope.getPlanImageSrc = function (boss) {
            if (!boss.icon) {
                return '';
            }

            return '//wow.zamimg.com/images/wow/icons/tiny/' + boss.icon + '.gif';
        };

        MountsAndPetsService.getItems('mounts', 'mounts', 'spellId').then(function(items){
            $scope.items = items;

            // called when planner checkbox is clicked
            $scope.plannerChanged = function() {
                if ($scope.showPlanner) {
                    $window.ga('send', 'pageview', 'Planner');

                    PlannerService.getSteps(items).then(function(steps){
                        $scope.planner = steps;
                    });
                }
            };            
        });       
    }

})();