'use strict';

(function() {

    angular
        .module('simpleArmoryApp')
        .factory('MountsAndPetsService', MountsAndPetsService);

    function MountsAndPetsService($http, $log, LoginService, $routeParams, $window, $q) {
        // issues/53: Pets that we can ignore warning for because they are battle pets
        var ignoredFoundPets = 
        {
            10708:  true,
            132785: true,
            148065: true,
            148068: true,
            148069: true
        };

        //  cache results
        var parsedMounts;
        var parsedCompanions;
        var parsedPets;
        LoginService.onLogin(function() {
            parsedMounts = undefined;
            parsedCompanions = undefined;
            parsedPets = undefined;
        });

        return {
            getItems: function(jsonFile, characterProperty, collectedId) {
                if (jsonFile === 'pets' && parsedCompanions) {
                    return $q.when(parsedCompanions);
                } else if (jsonFile === 'battlepets' && parsedPets) {
                    return $q.when(parsedPets);
                } else if (jsonFile === 'mounts' && parsedMounts) {
                    return $q.when(parsedMounts);
                }

                return LoginService.getCharacter(
                        {
                            'region': $routeParams.region,
                            'realm':$routeParams.realm,
                            'character':$routeParams.character
                        })
                    .then(function(character) {
                        return $http.get('data/' + jsonFile + '.json', { cache: true, isArray:true })
                            .then(function(data) {
                                
                                $log.log('Parsing ' + jsonFile + '.json...');
                                var parsed = parseItemsObject(data.data, character, characterProperty, collectedId);

                                if (jsonFile === 'pets') {
                                    parsedCompanions = parsed; 
                                } else if (jsonFile === 'battlepets') {
                                    parsedPets = parsed; 
                                } else if (jsonFile === 'mounts') {
                                    parsedMounts = parsed;
                                }

                                return parsed;
                            });
                    });
            }
        };

        function parseItemsObject(categories, character, characterProperty, collectedId) {    
            var obj = { 'categories': [] };
            var collected = {};
            var totalCollected = 0;
            var totalPossible = 0;
            var found = {};

            // Build up lookup for items that character has
            angular.forEach(character[characterProperty].collected, function(item) {
                collected[item[collectedId]] = item;
                found[item[collectedId]] = false;               
            });

            // Fix any problems blizzard has introduced
            applyHacks(character, collected, found);

            // Lets parse out all the categories and build out our structure
            angular.forEach(categories, function(category) {

                // Add the item category to the item list
                var cat = { 'name': category.name, 'subCategories': [] };
                obj.categories.push(cat);

                angular.forEach(category.subcats, function(subCategory) {

                    var subCat = { 'name': subCategory.name, 'items':[] };

                    angular.forEach(subCategory.items, function(item) {

                        var itm = item;

                        // fix spellid typo
                        itm.spellId = item.spellid;
                        delete itm.spellid;

                        // Mark it found
                        found[itm[collectedId]] = true;

                        if (collected[itm[collectedId]]) {
                            var fullItem = collected[itm[collectedId]];
                            itm.collected =  true;

                            // Add pet info if we have it
                            if (fullItem.qualityId) {
                                var quality = '';
                                switch(fullItem.qualityId)
                                {
                                    case 0:
                                        quality = 'poor';
                                        break;
                                    case 1:
                                        quality = 'common';
                                        break;
                                    case 2:
                                        quality = 'uncommon';
                                        break;
                                    case 3:
                                        quality = 'rare';
                                        break;
                                    case 4:
                                        quality = 'epic';
                                        break;
                                    case 5:
                                        quality = 'legendary';
                                        break;
                                }

                                itm.quality = quality;
                            }

                            if (fullItem.stats) {
                                if (fullItem.stats.breedId) {
                                    var breed = '';
                                    switch(fullItem.stats.breedId)
                                    {
                                        case 4:
                                        case 14:
                                            breed = 'P/P';
                                            break;
                                        case 5:
                                        case 15:
                                            breed = 'S/S';
                                            break;
                                        case 6:
                                        case 16:
                                            breed = 'H/H';
                                            break;
                                        case 7:
                                        case 17:
                                            breed = 'H/P';
                                            break;
                                        case 8:
                                        case 18:
                                            breed = 'P/S';
                                            break;
                                        case 9:
                                        case 19:
                                            breed = 'H/S';
                                            break;
                                        case 10:
                                        case 20:
                                            breed = 'P/B';
                                            break;
                                        case 11:
                                        case 21:
                                            breed = 'S/B';
                                            break;
                                        case 12:
                                        case 22:
                                            breed = 'H/B';
                                            break;
                                        case 3:
                                        case 13:
                                            breed = 'B/B';
                                            break;
                                    }

                                    itm.breed = breed;
                                }

                                itm.level = fullItem.stats.level;
                            }
                        }

                        // Need to some extra work to determine what our url should be
                        // By default we'll use a spell id
                        var link = 'spell='+itm.spellId;

                        // If the item id is available lets use that
                        if (item.itemId) {
                            link = 'item='+item.itemId;
                        } else if (item.allianceId && (character.faction === 'A' || character.faction === 'Alliance')) {
                            link = 'item='+item.allianceId;
                        } else if (item.hordeId && (character.faction === 'H' || character.faction === 'Horde')) {
                            link = 'item='+item.hordeId;
                        } else if (item.creatureId) {
                            link = 'npc='+item.creatureId;
                        }

                        itm.link = link;

                        // What would cause it to show up in the UI:
                        //    1) You have the item
                        //    2) Its still obtainable 
                        //    3) You meet the class restriction
                        //    4) You meet the race restriction
                        var hasthis = itm.collected;            
                        var showthis = (hasthis || item.obtainable);
                        if (item.allowableRaces.length > 0)
                        {
                            var foundRace = false;
                            angular.forEach(item.allowableRaces, function(race) {
                                if (race === character.race) {
                                    foundRace = true;
                                }
                            });

                            if (!foundRace) {
                                showthis = false;
                            }
                        }

                        if (item.allowableClasses && item.allowableClasses.length > 0)
                        {
                            var foundClass = false;
                            angular.forEach(item.allowableClasses, function(allowedClass) {
                                if (allowedClass === character.class) {
                                    foundClass = true;
                                }
                            });

                            if (!foundClass) {
                                showthis = false;
                            }
                        }

                        if (showthis) {
                            subCat.items.push(itm);
                            if (hasthis) {
                                totalCollected++;
                            }

                            totalPossible++;
                        }
                    });

                    if (subCat.items.length > 0) {
                        cat.subCategories.push(subCat);
                    }
                });
            }); 

            // don't do this check for battle pets, I'm lazy and don't want to figure it out
            if (collectedId !== 'creatureId') {
                for (var collId in found) {
                    if (collId !== '0' && found.hasOwnProperty(collId) && !found[collId] && !ignoredFoundPets[collId]) {
                        $window.ga('send', 'event', 'MissingCollection', collId);
                        console.log('WARN: Found item "' + collId + '" from character but not in db.');
                    }
                }               
            }

            // Add totals
            obj.collected = totalCollected;
            obj.possible = totalPossible;
            obj.lookup = collected;

            // Add stuff that planner needs
            obj.isAlliance = (character.faction === 'A' || character.faction === 'Alliance');

            // Data object we expose externally
            return obj;
        }

        function applyHacks(character, collected, found) {
            // Hack: Horde chopper doesn't show up, so we have to check for achievement and just assume they 'learned' it
            if (character.achievements.achievementsCompleted.indexOf(9909) >= 0) {
                collected[179244] = {
                    'spellid': '179244',
                    'allianceId': null,
                    'hordeId': null,
                    'itemId': '122703',
                    'icon': 'inv_misc_key_06',
                    'obtainable': true,
                    'allowableRaces': [
                        2,
                        5,
                        6,
                        8,
                        9,
                        10,
                        26
                    ],
                    'allowableClasses': null
                };
                found[179244] = false;
            }

            // Brown Horse (if you have all the other horses, you get this.  Oprah would approve)
            if (!collected[458] && collected[23227] && collected[23229] && 
                 collected[23228] && collected[6648] && collected[470] && collected[472]) {
                
                console.log('Hack: Blizzard still has the brown horse bug');

                collected[458] = {
                    'spellid': '458',
                    'allianceId': null,
                    'hordeId': null,
                    'itemId': '5656',
                    'icon': 'ability_mount_ridinghorse',
                    'obtainable': true,
                    'allowableRaces': [
                        1,
                        3,
                        4,
                        7,
                        11,
                        22,
                        25
                    ],
                    'allowableClasses': null
                };
                found[458] = false;
            }

            // Swift Warstrider (same problem as brown horse)
            if (!collected[35028] && collected[22718] && collected[22724] && 
                 collected[22722] && collected[22721] && collected[23509] && collected[59788]) {
                
                console.log('Hack: Blizzard still has the swift warstrider bug');

                collected[35028] = {
                    'spellid': '35028',
                    'allianceId': null,
                    'hordeId': null,
                    'itemId': '34129',
                    'icon': 'ability_mount_cockatricemountelite_black',
                    'obtainable': true,
                    'allowableRaces': [
                        2,
                        5,
                        6,
                        8,
                        9,
                        10,
                        26
                    ],
                    'allowableClasses': null
                };
                found[35028] = false;
            }
        }
    }

})();