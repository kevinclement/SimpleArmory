/*globals $WowheadPower */
"use strict";

(function () {
    angular.module("simpleArmoryApp").controller("MountsCtrl", MountsCtrl);

    function MountsCtrl(
        $scope,
        MountsAndPetsService,
        PlannerService,
        $window,
        SettingsService
    ) {
        $scope.settings = SettingsService;

        // Analytics for page
        $window.ga("send", "pageview", "Mounts");

        MountsAndPetsService.getItems("mounts", "mounts", "mount").then(
            function (items) {
                $scope.items = items;
                $scope.faction = items.isAlliance ? "alliance" : "horde";

                // called when planner checkbox is clicked
                $scope.plannerChanged = function () {
                    if ($scope.showPlanner) {
                        $window.ga("send", "pageview", "Planner");

                        PlannerService.getSteps(items).then(function (steps) {
                            $scope.plannerReturned = true;
                            $scope.planner = steps;
                        });
                    }
                };
            }
        );
    }
})();
