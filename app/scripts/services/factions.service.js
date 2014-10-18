'use strict';

(function() {
    
    angular
        .module('simpleArmoryApp')
        .factory('FactionsService', FactionsService);

    function FactionsService($http, $log, LoginService, $routeParams) {
        return {
            getFactions: function() {
                return LoginService.getCharacter(
                        {
                            'region': $routeParams.region,
                            'realm':$routeParams.realm,
                            'character':$routeParams.character
                        })
                    .then(function(character) {
                        return $http.get('data/factions.json', { cache: true})
                            .then(function(data) {
                                return parseFactions(data.data, character[0]);        
                            });
                    });
            }
        };

        function parseFactions(factions, character) {    
            var obj = {};
            obj.categories = [];

            var standing = {};
            $log.log('Parsing factions.json...');

            // Build up lookup for factions
            angular.forEach(character.reputation, function(rep, index) {
                standing[rep.id] = {
                    level: rep.standing,
                    perc: (rep.value / rep.max) * 100
                };
            });

            // We look up each faction in the character.  
            // For each level of the faction, we compare it to the character
            // We fill in the level percentages based on this.  
            // The controller takes those percentages and sizes the bars

            // Pull all the factions out of the json
            angular.forEach(factions, function(factionCategory) {
                var fc = {};
                fc.name = factionCategory.name;
                fc.factions = [];

                angular.forEach(factionCategory.factions, function(faction) {
                    var f = {};
                    f.id = faction.id;
                    f.name = faction.name;

                    var stand = standing[f.id];

                    if (stand)
                    {
                        // fill out the faction values for this user
                        f.hated = calculateLevelPercent(0, stand);
                        f.hostel = calculateLevelPercent(1, stand);
                        f.unfriendly = calculateLevelPercent(2, stand);
                        f.neutral = calculateLevelPercent(3, stand);
                        f.friendly = calculateLevelPercent(4, stand);
                        f.honored = calculateLevelPercent(5, stand);
                        f.revered = calculateLevelPercent(6, stand);
                        f.exalted = calculateLevelPercent(7, stand);

                        fc.factions.push(f);                      
                    }
                });

                if (fc.factions.length > 0) {
                    obj.categories.push(fc);
                }                
            });

            // Data object we expose externally
            return obj;
        }

        function calculateLevelPercent(level, stand) {
            if (level == stand.level) {
                return stand.perc;
            }
            else if (level < stand.level) {
                return 100;
            }
            else {
                return 0;
            }            
        }
    }

})();