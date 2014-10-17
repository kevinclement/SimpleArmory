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

        function repbar(level,maxrep,curlevel,currep,color) {
            if (level > curlevel) {
                return '';
            }
           
           var compareto = (level < curlevel) ? maxrep:currep;
           
           return '<div style="height: 1em; margin: 0 1px; width: '+Math.ceil(compareto/150)+'px; background-color: '+color+'; float: left"></div>';
        }

        function parseFactions(factions, character) {    
            var obj = {};
            obj.categories = [];
            $log.log('Parsing factions.json...');

            // Build up lookup for factions
            angular.forEach(character.reputation, function(rep, index) {


                // {id: 1098, name: "Knights of the Ebon Blade", standing: 7, value: 999, max: 999}



                //completed[ach] = character.achievements.achievementsCompletedTimestamp[index];
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

                    // fill out the faction values for this user
                    f.hated = 100;
                    f.hostel = 0;
                    f.unfriendly = 0;
                    f.neutral = 0;
                    f.friendly = 0;
                    f.honored = 0;
                    f.revered = 0
                    f.exalted = 0;

                    fc.factions.push(f);
                });

                obj.categories.push(fc);
            });

            // Data object we expose externally
            return obj;
        }
    }

})();