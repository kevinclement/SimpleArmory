'use strict';

(function() {

    angular
        .module('simpleArmoryApp')
        .factory('PlannerService', PlannerService);

    function PlannerService($http, $log, LoginService, $routeParams) {
        return {
            getSteps: function() {
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
                                 return parseStepsObject(data.data.steps, character[0]);
                             });
                     });
            }
        };

        // gotta love recursion
        function parseStepsObject(steps, character) {    
            var neededSteps = [];
            angular.forEach(steps, function(step) {
                if (step.steps) {
                    var neededChildSteps = parseStepsObject(step.steps, character);

                    // if we have child steps and we found ones that were needed, then we can
                    // go ahead and add ourself as a step and our children too
                    if (neededChildSteps.length > 0) {
                        neededSteps.push(step);
                        neededSteps = neededSteps.concat(neededChildSteps);
                    }
                }
                else if (!checkStepCompleted(step)) {
                    neededSteps.push(step);        
                }
            });

            return neededSteps;
        }

        function checkStepCompleted(step) {
            return false;
        }
    }

})();