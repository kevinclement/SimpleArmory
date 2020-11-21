'use strict';

(function() {

    angular
        .module('simpleArmoryApp')
        .factory('PlannerService', PlannerService);

    function PlannerService($http, $log, LoginService, $routeParams, $q) {
        //  cache results
        var parsedStepsObject;
        LoginService.onLogin(function() {
            parsedStepsObject = undefined;
        });

        return {
            getSteps: function(items) {
                if (parsedStepsObject) {
                    return $q.when(parsedStepsObject);
                }

                var profile;
                return LoginService.getProfile($routeParams)
                    .then(function(p) {
                        profile = p;
                        $log.log('Parsing planner.json...');
                        return $http.get('data/planner.json', { cache: true});
                    })
                    .then(function(data) {
                        parsedStepsObject = parseStepsObject(data.data.steps, items);
                        return parsedStepsObject;
                    });
            }
        };

        // gotta love recursion
        function parseStepsObject(steps, items) {
            var neededSteps = [];
            angular.forEach(steps, function(step) {
                if (step.steps) {
                    var neededChildSteps = parseStepsObject(step.steps, items);

                    // if we have child steps and we found ones that were needed, then we can
                    // go ahead and add ourself as a step and our children too
                    if (neededChildSteps.length > 0) {
                        neededSteps.push(step);
                        neededSteps = neededSteps.concat(neededChildSteps);
                        if (step.finalStep) {
                            neededSteps.push({'title':step.finalStep, 'hearth':true});
                        }
                    }
                }
                else if (!checkStepCompleted(step, items)) {
                    neededSteps.push(step);
                }
            });

            return neededSteps;
        }

        function checkStepCompleted(step, items) {
            var completed = true;
            var showAll = false; // used for debugging
            var neededBosses = [];

            // check to see if we've finished all the bosses
            if (step.bosses) {
                angular.forEach(step.bosses, function(boss) {

                    var bossIsNeutral = !boss.isAlliance && !boss.isHorde;
                    var character = items; // aliasing for clarity
                    var characterNeedsBoss = function(id){ return !character.lookup[id]; };
                    var addBoss = function(boss) {
                            neededBosses.push(boss);
                            completed = false;
                        };

                    if (showAll) { addBoss(boss); return; }
                    if (boss.ID === undefined) { return; } // continue the loop, bad boss data
                    if (!characterNeedsBoss(boss.ID)) { return; }

                    if ( bossIsNeutral || (boss.isAlliance && character.isAlliance) || (boss.isHorde && character.isHorde)) {
                        addBoss(boss);
                        return;
                    }

                });
            }

            // reset bosses array to the ones we need
            step.bosses = neededBosses;

            return completed;
        }
    }

})();
