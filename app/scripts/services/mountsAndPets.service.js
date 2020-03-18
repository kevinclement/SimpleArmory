'use strict';

(function() {

    angular
        .module('simpleArmoryApp')
        .factory('MountsAndPetsService', MountsAndPetsService);

    function MountsAndPetsService($http, $log, LoginService, $routeParams, $window, $q, SettingsService) {
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
        var parsedToys;
        LoginService.onLogin(function() {
            parsedMounts = undefined;
            parsedCompanions = undefined;
            parsedPets = undefined;
            parsedToys = undefined;
        });

        return {
            getItems: function(jsonFile, characterProperty, collectedId) {

                if (jsonFile === 'pets' && parsedCompanions) {
                    return $q.when(parsedCompanions);
                } else if (jsonFile === 'battlepets' && parsedPets) {
                    return $q.when(parsedPets);
                } else if (jsonFile === 'mounts' && parsedMounts) {
                    return $q.when(parsedMounts);
                } else if (jsonFile === 'toys' && parsedToys) {
                    return $q.when(parsedToys);
                }

                var profile,jsonFile_data;
                return LoginService.getProfile($routeParams)
                    .then(function(p) {
                        profile = p;

                        // parse json with all data
                        $log.log('Parsing ' + jsonFile + '.json...');
                        return $http.get(SettingsService.jsonFiles[jsonFile], { cache: true, isArray:true });
                    })
                    .then(function(data) {
                        jsonFile_data = data;

                        // TODO: other types here
                        if (jsonFile === 'mounts') {
                            return $http.get(SettingsService.apiUrl($routeParams, 'collections/mounts'), {cache: true});
                        }
                    })
                    .then(function(collected_data) {
                        var parsed = parseItemsObject(jsonFile_data.data, profile, collected_data.data, characterProperty, collectedId);

                        if (jsonFile === 'pets') {
                            parsedCompanions = parsed; 
                        } else if (jsonFile === 'battlepets') {
                            parsedPets = parsed; 
                        } else if (jsonFile === 'mounts') {
                            parsedMounts = parsed;
                        } else if (jsonFile === 'toys') {
                            parsedToys = parsed;
                        }

                        return parsed;
                    });
            }
        };

        function parseItemsObject(categories, profile, collected_data, characterProperty, collectedId) {    
            var obj = { 'categories': [] };
            var collected = {};
            var totalCollected = 0;
            var totalPossible = 0;
            var found = {};

            // Retrieve the toys from the localstorage
            // Remove this if Blizzard ever implements this in the API.
            var toys = JSON.parse(localStorage.getItem('toys'));
            profile.toys = {};
            profile.toys.collected = [];
            angular.forEach(toys, function(item) {
                profile.toys.collected.push({'itemId': item});
            });

            // Build up lookup for items that character has
            angular.forEach(collected_data[characterProperty], function(item) {
                collected[item[collectedId].id] = item;
                found[item[collectedId].id] = false;
            });

            // Fix any problems blizzard has introduced
            applyHacks(profile, characterProperty, collected, found);

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
                        found[itm.ID] = true;

                        if (collected[itm.ID]) {
                            var fullItem = collected[itm.ID];
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
                        } else if (item.allianceId && (profile.faction === 'A')) {
                            link = 'item='+item.allianceId;
                        } else if (item.hordeId && (profile.faction === 'H')) {
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
                        var showthis = (hasthis || !item.notObtainable);

                        if (item.side && item.side !== profile.faction) {
                            showthis = false;
                        }

                        if (item.allowableRaces && item.allowableRaces.length > 0)
                        {
                            var foundRace = false;
                            angular.forEach(item.allowableRaces, function(race) {
                                if (race === profile.race) {
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
                                if (allowedClass === profile.class) {
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
            obj.isAlliance = (profile.faction === 'A');

            // Data object we expose externally
            return obj;
        }

        function applyHacks(profile, characterProperty, collected, found) {
            // No hacks needed right now! :-)
        }
    }

})();
