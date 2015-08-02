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
        $scope.anchorCss = function (step) {
            if (step.epic) {
                return 'mnt-plan-epic';
            }

            return 'mnt-plan-rare';
        };

        // img src for planner image
        $scope.getPlanImageSrc = function (step) {
            if (!step.icon) {
                return '';
            }

            return '//wow.zamimg.com/images/wow/icons/tiny/' + step.icon + '.gif';
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