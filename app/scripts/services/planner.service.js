'use strict';

(function() {

    angular
        .module('simpleArmoryApp')
        .factory('PlannerService', PlannerService);

    function PlannerService($http, $log, LoginService, $routeParams) {
        return {
            getSteps: function(items) {
                return LoginService.getCharacter(
                    {
                        'region': $routeParams.region,
                        'realm':$routeParams.realm,
                        'character':$routeParams.character
                    })
                    .then(function(character) {
                         return $http.get('data/planner.json', { cache: true })
                             .then(function(data) {
                                
                                 $log.log('Parsing planner.json...');
                                 return parseStepsObject(data.data.steps, items);
                             });
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
            var neededBosses = [];

            // check to see if we've finished all the bosses
            if (step.bosses) {
                angular.forEach(step.bosses, function(boss) {
                    // TMP: REMOVE || before shipping
                    if (items.lookup[boss.spellId] === undefined || 1===1) {
                        neededBosses.push(boss);
                        completed = false;
                    }
                });
            }

            // reset bosses array to the ones we need
            step.bosses = neededBosses;

            return completed;
        }
    }

})();