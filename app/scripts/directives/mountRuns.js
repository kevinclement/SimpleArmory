"use strict";

(function () {
    angular.module("simpleArmoryApp").directive("mountRuns", MountRuns);

    var capitals = {
        alliance: "Stormwind",
        horde: "Orgrimmar"
    };

    var emblems = {
        alliance: "images/alliance.png",
        horde: "images/horde.png"
    };

    /*@ngInject*/
    var MountRunsController = function ($scope, $filter, SettingsService) {
        $scope.settings = SettingsService;

        $scope.showDone = angular.isDefined($scope.showDone)
            ? $scope.showDone
            : false;

        $scope.expanded = angular.isDefined($scope.expanded)
            ? $scope.expanded
            : false;

        $scope.$watch(
            "runs",
            function () {
                $scope.filteredRuns = $filter("plannerStepHasRun")(
                    $scope.runs,
                    $scope.showDone
                );
            },
            true
        );

        $scope.toggleRun = function (step) {
            step.hasRun = !step.hasRun;
        };

        // anchor css used for planner checkbox
        $scope.anchorCss = function (boss) {
            return boss.epic ? "mnt-plan-epic" : "mnt-plan-rare";
        };

        // img src for planner image
        $scope.getPlanImageSrc = function (boss) {
            return boss.icon
                ? "//wow.zamimg.com/images/wow/icons/tiny/" + boss.icon + ".gif"
                : "";
        };

        // img src for planner image
        $scope.getPlanStepImageSrc = function (step) {
            var src = "";

            if (step.capital) {
                src = emblems[$scope.faction];
            } else if (step.hearth) {
                src = "images/hearth.png";
            }

            return src;
        };

        $scope.getStepTitle = function (step) {
            return step.capital
                ? step.title + capitals[$scope.faction]
                : step.title;
        };
    };

    function MountRuns() {
        return {
            controller: MountRunsController,
            restrict: "E",
            scope: {
                faction: "@",
                heading: "@",
                runs: "=",
                showDone: "=?",
                expanded: "=?"
            },
            templateUrl: "views/mountRuns.html"
        };
    }
})();
