/*globals $WowheadPower */
'use strict';

(function() {
    
    angular
        .module('simpleArmoryApp')
        .controller('MountsCtrl' , MountsCtrl);

    function MountsCtrl($scope, MountsAndPetsService, PlannerService, $window) {

    	// Analytics for page
        $window.ga('send', 'pageview', 'Mounts');

        // called when planner checkbox is clicked
        $scope.plannerChanged = function() {
            if ($scope.showPlanner) {
                PlannerService.getSteps().then(function(steps){
                    $scope.planner = steps;
                });
            }
        };

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

            // need to define here so that we have access to the items that came from callback
            $scope.isCollected = function (id) {
                return items.lookup[id] !== undefined;
            };            
        });       
    }

})();