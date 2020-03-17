'use strict';

(function() {

    angular
        .module('simpleArmoryApp')
        .factory('ToysService', ToysService);

    function ToysService($http, $log, LoginService, $routeParams, $window, $q, SettingsService) {
        //  cache results
        var parsedToys;
        LoginService.onLogin(function() {
            parsedToys = undefined;
        });

        return {
            getItems: function(skipCache) {
                if (parsedToys && !skipCache) {
                    return $q.when(parsedToys);
                }

                var jsonFile = 'toys';
                return LoginService.getProfile(
                    {
                        'region': $routeParams.region,
                        'realm':$routeParams.realm,
                        'character':$routeParams.character
                    })
                .then(function(character) {
                    return $http.get(SettingsService.jsonFiles[jsonFile], { cache: true, isArray:true })
                        .then(function(data) {

                            $log.log('Parsing ' + jsonFile + '.json...');
                            var parsed = parseItemsObject(data.data, character);
                            parsedToys = parsed;

                            return parsed;
                        });
                });
            }
        };

        function parseItemsObject(categories, character, toysOwned) {
            var obj = { 'categories': [] };
            var collected = {};
            var collectedId = 'itemId';
            var characterProperty = 'toys';
            var totalCollected = 0;
            var totalPossible = 0;
            var found = {};

            // Retrieve the toys from the localstorage
            // Remove this if Blizzard ever implements this in the API.
            var toys = JSON.parse(localStorage.getItem('toys'));
            character.toys = {};
            character.toys.collected = [];
            angular.forEach(toys, function(item) {
                character.toys.collected.push({'itemId': item});
            });

            // Build up lookup for items that character has
            angular.forEach(character[characterProperty].collected, function(item) {
                collected[item[collectedId]] = item;
                found[item[collectedId]] = false;
            });

            // Lets parse out all the categories and build out our structure
            angular.forEach(categories, function(category) {

                // Add the item category to the item list
                var cat = { 'name': category.name, 'subCategories': [] };
                obj.categories.push(cat);

                angular.forEach(category.subcats, function(subCategory) {

                    var subCat = { 'name': subCategory.name, 'items':[] };

                    angular.forEach(subCategory.items, function(item) {

                        var itm = item;

                        // Mark it found
                        found[itm[collectedId]] = true;

                        if (collected[itm[collectedId]]) {
                            var fullItem = collected[itm[collectedId]];
                            itm.collected =  true;
                        }

                        itm.link = 'item='+item.itemId;

                        // What would cause it to show up in the UI:
                        //    1) You have the item
                        //    2) Its still obtainable 
                        //    3) You meet the class restriction
                        //    4) You meet the race restriction
                        var hasthis = itm.collected;
                        var showthis = (hasthis || !item.notObtainable);

                        if (item.side && item.side !== character.faction) {
                            showthis = false;
                        }

                        if (item.allowableRaces && item.allowableRaces.length > 0)
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

            for (var collId in found) {
                if (collId !== '0' && found.hasOwnProperty(collId) && !found[collId]) {
                        $window.ga('send', 'event', 'MissingCollection', collId);
                        console.log('WARN: Found item "' + collId + '" from character but not in db.');
                }
            }

            // Add totals
            obj.collected = totalCollected;
            obj.possible = totalPossible;
            obj.lookup = collected;

            // Data object we expose externally
            return obj;
        }
    }

})();
