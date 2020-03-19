'use strict';

(function() {
    
    angular
        .module('simpleArmoryApp')
        .factory('FactionsService', FactionsService);

    function FactionsService($http, $log, LoginService, $routeParams, $q, SettingsService) {
        //  cache results
        var parsedFactions;
        LoginService.onLogin(function() {
            parsedFactions = undefined;
        });

        return {
            getFactions: function() {
                if (parsedFactions) {
                    return $q.when(parsedFactions);
                }

                var profile, all_factions;
                return LoginService.getProfile($routeParams)
                    .then(function(p) {
                        profile = p;
                        $log.log('Parsing factions.json...');
                        return $http.get('data/factions.json', { cache: true});
                    })
                    .then(function(data) {
                        all_factions = data.data;
                        return $http.get(SettingsService.apiUrl($routeParams, 'reputations'), {cache: true});
                    })
                    .then(function(data) {
                        var my_reputations = data.data.reputations;
                        parsedFactions =  parseFactions(all_factions, my_reputations);
                        return parsedFactions;
                    });
            }
        };

        function parseFactions(all_factions, my_reputations) {
            var obj = {};
            obj.categories = [];

            var standing = {};

            // Build up lookup for factions
            angular.forEach(my_reputations, function(rep, index) {
                var calculatedPerc = (rep.standing.value / rep.standing.max) * 100;

                standing[rep.faction.id] = {
                    level: rep.standing.tier,
                    perc: (isNaN(calculatedPerc) ? 100 : calculatedPerc),
                    value: rep.standing.value,
                    max: rep.standing.max
                };
            });

            // We look up each faction in the character.  
            // For each level of the faction, we compare it to the character
            // We fill in the level percentages based on this.  
            // The controller takes those percentages and sizes the bars

            // Pull all the factions out of the json
            angular.forEach(all_factions, function(factionCategory) {
                var fc = {};
                fc.name = factionCategory.name;
                fc.factions = [];

                var tillerCategory = false;

                angular.forEach(factionCategory.factions, function(faction) {
                    var f = {};
                    f.id = faction.id;
                    f.name = faction.name;

                    var stand = standing[f.id];

                    if (stand)
                    {
                        // fill out the faction values for this user
                        if (isTillerFaction(faction.id)) { 
                            f.stranger = calculateLevelPercent(0, stand);
                            f.acquaintance = calculateLevelPercent(1, stand);
                            f.buddy = calculateLevelPercent(2, stand);
                            f.friend = calculateLevelPercent(3, stand);
                            f.goodFriends = calculateLevelPercent(4, stand);
                            f.bestFriends = calculateLevelPercent(5, stand);
                            f.value = stand.value;
                            f.max = stand.max;
                            f.isTiller = true;

                            tillerCategory = true;
                        }
                        else {
                            f.hated = calculateLevelPercent(0, stand);
                            f.hostel = calculateLevelPercent(1, stand);
                            f.unfriendly = calculateLevelPercent(2, stand);
                            f.neutral = calculateLevelPercent(3, stand);
                            f.friendly = calculateLevelPercent(4, stand);
                            f.honored = calculateLevelPercent(5, stand);
                            f.revered = calculateLevelPercent(6, stand);
                            f.exalted = calculateLevelPercent(7, stand);
                            f.value = stand.value;
                            f.max = stand.max;      
                        }

                        fc.factions.push(f);
                    }
                });

                if (tillerCategory) {
                    fc.isTiller = true;
                }

                if (fc.factions.length > 0) {
                    obj.categories.push(fc);
                }                
            });

            // Data object we expose externally
            return obj;
        }

        function calculateLevelPercent(level, stand) {
            if (level === stand.level) {
                return stand.perc;
            }
            else if (level < stand.level) {
                return 100;
            }
            else {
                return 0;
            }            
        }

        function isTillerFaction(id) {
            return id === '1273' || id === '1275' || id === '1276' || 
                   id === '1277' || id === '1278' || id === '1279' || 
                   id === '1280' || id === '1281' || id === '1282' || 
                   id === '1283';
        }
    }

})();