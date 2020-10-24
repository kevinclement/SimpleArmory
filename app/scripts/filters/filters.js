"use strict";

/* Filters */
(function () {
    angular
        .module("simpleArmoryApp")
        .filter("plannerStepHasRun", plannerStepHasRun);

    function plannerStepHasRun() {
        return function (steps, hasRun) {
            hasRun = typeof hasRun === "undefined" ? true : hasRun;
            var filtered = [];
            angular.forEach(steps, function (step) {
                if (step.hasRun === hasRun) {
                    filtered.push(step);
                }
            });
            return filtered;
        };
    }
})();
