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
                         return $http.get('data/planner.json', { cache: true, isArray:true })
                             .then(function(data) {
                                
                                 $log.log('Parsing planner.json...');
                                 return parseItemsObject(data.data, character[0]);        
                             });
                     });
            }
        };

        function parseItemsObject(steps, character) {    
            
            // Data object we expose externally
            return steps;
        }
    }

})();