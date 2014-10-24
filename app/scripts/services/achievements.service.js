'use strict';

(function() {
    
    angular
        .module('simpleArmoryApp')
        .factory('AchievementsService', AchievementsService);

    function AchievementsService($http, $log, LoginService, $routeParams) {
        return {
            getAchievements: function() {
                return LoginService.getCharacter(
                        {
                            'region': $routeParams.region,
                            'realm':$routeParams.realm,
                            'character':$routeParams.character
                        })
                    .then(function(character) {
                        return $http.get('data/achievements.json', { cache: true})
                            .then(function(data) {
                                return parseAchievementObject(data.data.supercats, character[0]);        
                            });
                    });
            }
        };

        function parseAchievementObject(supercats, character) {    
            var obj = {};
            var completed = {};
            var totalPossible = 0;
            var totalCompleted = 0;
            var totalFoS = 0;
            var totalLegacy = 0;
            var found = {};
            $log.log('Parsing achievements.json...');

            // Build up lookup for achievements that character has completed
            angular.forEach(character.achievements.achievementsCompleted, function(ach, index) {
                // hash the achievement and its timestamp
                completed[ach] = character.achievements.achievementsCompletedTimestamp[index];
                found[ach] = false;
            });

            // Lets parse out all the super categories and build out our structure
            angular.forEach(supercats, function(supercat) {
                var possibleCount = 0;
                var completedCount = 0;

                // Add the supercategory to the object, so we can do quick lookups on category
                obj[supercat.name] = {};
                obj[supercat.name].categories = [];

                angular.forEach(supercat.cats, function(cat) {
                    var myCat = {'name': cat.name, 'zones': []};

                    angular.forEach(cat.zones, function(zone) {
                        var myZone = {'name': zone.name, 'achievements': []};

                        angular.forEach(zone.achs, function(ach) {

                            // Mark this achievement in our found tracker
                            found[ach.id] = true;

                            var myAchievement = ach, added = false;
                            myAchievement.completed = completed[ach.id];
                            if (myAchievement.completed) {
                                myAchievement.rel = 'who=' + character.name + '&when=' + myAchievement.completed;
                            }

                            // Always add it if we've completed it, it should show up regardless if its avaiable
                            if (completed[ach.id]) {
                                added = true;
                                myZone.achievements.push(myAchievement);    

                                // if this is feats of strength then I want to keep a seperate count for that 
                                // since its not a percentage thing
                                if (supercat.name === 'Feats of Strength') {
                                    totalFoS++;
                                } else if (supercat.name === 'Legacy') {
                                    totalLegacy++;
                                }
                            }

                            // Update counts proper
                            if (supercat.name !== 'Feats of Strength' && supercat.name !== 'Legacy' && ach.obtainable && 
                                (ach.side === '' || ach.side === character.faction)){
                                possibleCount++;
                                totalPossible++;

                                if (completed[ach.id]) {
                                    completedCount++;
                                    totalCompleted++;
                                }            

                                // if we haven't already added it, then this is one that should show up in the page of achievements
                                // so add it
                                if (!added) {
                                    myZone.achievements.push(myAchievement);
                                }
                            }                
                        });

                        if (myZone.achievements.length > 0) {
                            myCat.zones.push(myZone);
                        }
                    });

                    // Add the category to the obj
                    obj[supercat.name].categories.push(myCat);
                });

                obj[supercat.name].possible = possibleCount;
                obj[supercat.name].completed = completedCount;

                // Add the FoS count if this is the FoS
                if (supercat.name === 'Feats of Strength') {
                    obj[supercat.name].foSTotal = totalFoS;
                } else if (supercat.name === 'Legacy') {
                    obj[supercat.name].legacyTotal = totalLegacy;
                }
            }); 


            for (var achId in found) {
                if (found.hasOwnProperty(achId) && !found[achId]) {
                    console.log('WARN: Found achievement "' + achId + '" from character but not in db.');
                }
            }

            // Add totals
            obj.possible = totalPossible;
            obj.completed = totalCompleted;

            // Data object we expose externally
            return obj;
        }
    }

})();