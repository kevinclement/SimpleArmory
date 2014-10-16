'use strict';

/* Services */
var simpleArmoryServices = angular.module('simpleArmoryServices', []);

simpleArmoryServices.factory('LoginService', ['$location', '$log', '$http', '$q', function ($location, $log, $http, $q) {
	return {
	  getCharacter: function($routeParams) {
  		$log.log("Fetching " + $routeParams.character + " from server " + $routeParams.realm + "...");

  		// ## TMP #################################################################
  		// ## Good to make sure I'm honest, will remove before we go live
  		var deferred = $q.defer();
  		setTimeout(function() {
  			deferred.resolve('hello world');
  		}, 1);
  		// ########################################################################

  		var jsonp = $http.jsonp(
  				'http://' + $routeParams.region +'.battle.net/api/wow/character/' + $routeParams.realm + '/' + $routeParams.character +'?fields=pets,mounts,achievements,guild,reputation&jsonp=JSON_CALLBACK',
  				{ cache: true})
  			.error(getCharacterError)
  			.then(getCharacterComplete);

  		return $q.all([jsonp, deferred.promise]);

  		function getCharacterError(data, status, headers, config) {
  			$log.log("Trouble fetching character from battlenet");
			$location.url("error");
  		}

  		function getCharacterComplete(data, status, headers, config) {
  			data.data.region = $routeParams.region;

  			// add faction
  			data.data.faction = [,'A','H','A','A','H','H','A','H','H','H','Alliance',,,,,,,,,,,'A',,,'A','H'][data.data.race];

			return data.data;
  		}
	  }
	}
}]);

simpleArmoryServices.factory('BlizzardRealmService', ['$http', '$q', '$log', function ($http, $q, $log) {

    return {
        getRealms: function() {
            $log.log("Fetching server list for us...");
            var usPromise = $http.jsonp('http://us.battle.net/api/wow/realm/status?jsonp=JSON_CALLBACK');

            $log.log("Fetching server list for eu...");
            var euPromise = $http.jsonp('http://eu.battle.net/api/wow/realm/status?jsonp=JSON_CALLBACK');

            return $q.all([usPromise, euPromise]);
        }
    }
}]);

simpleArmoryServices.factory('AchievementsService', ['$http', '$log', 'LoginService', '$routeParams', function ($http, $log, loginService, $routeParams) {
	return {
		getAchievements: function() {
			return loginService.getCharacter({'region': $routeParams.region, 'realm':$routeParams.realm, 'character':$routeParams.character})
				.then(function(character) {
					return $http.get('data/achievements.json', { cache: true})
    	            	.then(function(data, status, headers, config) {
    	        			return parseAchievementObject(data.data.supercats, character[0]);    	
    	            	});
				})		
		}
	}

	function parseAchievementObject(supercats, character) {	
		var obj = {};
		var completed = {};
		var totalPossible = 0;
		var totalCompleted = 0;
		var totalFoS = 0;
		$log.log("Parsing achievements.json...");

		// Build up lookup for achievements that character has completed
		angular.forEach(character.achievements.achievementsCompleted, function(ach, index) {
			// hash the achievement and its timestamp
			completed[ach] = character.achievements.achievementsCompletedTimestamp[index];
		});

		// Lets parse out all the super categories and build out our structure
		angular.forEach(supercats, function(supercat) {
			var possibleCount = 0;
			var completedCount = 0;

			// Add the supercategory to the object, so we can do quick lookups on category
			obj[supercat.name] = {};
			obj[supercat.name]['categories'] = [];

			angular.forEach(supercat.cats, function(cat) {
				var myCat = {'name': cat.name, 'zones': []};

				angular.forEach(cat.zones, function(zone) {
					var myZone = {'name': zone.name, 'achievements': []};

					angular.forEach(zone.achs, function(ach) {
						var myAchievement = ach, added = false;
						myAchievement['completed'] = completed[ach.id];

						// Always add it if we've completed it, it should show up regardless if its avaiable
						if (completed[ach.id]) {
							added = true;
							myZone['achievements'].push(myAchievement);	

							// if this is feats of strength then I want to keep a seperate count for that since its not a percentage thing
							if (supercat.name == "Feats of Strength") {
								totalFoS++;
							}
						}

						// Update counts proper
						if (supercat.name != "Feats of Strength" && ach.obtainable && (ach.side == '' || ach.side == character.faction)){
							possibleCount++;
							totalPossible++;

							if (completed[ach.id]) {
								completedCount++;
								totalCompleted++;
							}			

							// if we haven't already added it, then this is one that should show up in the page of achievements
							// so add it
							if (!added) {
								myZone['achievements'].push(myAchievement);		
							}
						}				
					});

					if (myZone.achievements.length > 0) {
						myCat['zones'].push(myZone);
					}
				});

				// Add the category to the obj
				obj[supercat.name]['categories'].push(myCat);
			});

			obj[supercat.name]['possible'] = possibleCount;
			obj[supercat.name]['completed'] = completedCount;

			// Add the FoS count if this is the FoS
			if (supercat.name == "Feats of Strength") {
				obj[supercat.name]['foSTotal'] = totalFoS;
			}
    	}); 

		// Add totals
		obj['possible'] = totalPossible;
		obj['completed'] = totalCompleted;

		// Data object we expose externally
		return obj;
	}
}]);

simpleArmoryServices.factory('MountsAndPetsService', ['$http', '$log', 'LoginService', '$routeParams', function ($http, $log, loginService, $routeParams) {
	return {
		getItems: function(jsonFile, characterProperty, collectedId) {
			return loginService.getCharacter({'region': $routeParams.region, 'realm':$routeParams.realm, 'character':$routeParams.character})
				.then(function(character) {
					return $http.get('data/' + jsonFile + '.json', { cache: true, isArray:true })
    	            	.then(function(data, status, headers, config) {
							
							$log.log("Parsing " + jsonFile + ".json...");
    	        			return parseItemsObject(data.data, character[0], characterProperty, collectedId);    	
    	            	});
				})		
		}
	}

	function parseItemsObject(categories, character, characterProperty, collectedId) {	
		var obj = { 'categories': [] };
		var collected = {};
		var totalCollected = 0;
		var totalPossible = 0;
	
		// Build up lookup for items that character has
		angular.forEach(character[characterProperty].collected, function(item, index) {
			collected[item[collectedId]] = item;
		});

		// Lets parse out all the categories and build out our structure
		angular.forEach(categories, function(category) {

			// Add the item category to the item list
			var cat = { 'name': category.name, 'subCategories': [] };
			obj.categories.push(cat);

			angular.forEach(category.subcats, function(subCategory) {

				var subCat = { "name": subCategory.name, "items":[] };

				angular.forEach(subCategory.items, function(item) {
					
					var itm = item;

					// fix spellid typo
					itm.spellId = item.spellid;
					delete itm.spellid;

					if (collected[itm[collectedId]]) {
						var fullItem = collected[itm[collectedId]];
						itm.collected =  true;

						totalCollected++;

						// Add pet info if we have it
						if (fullItem.qualityId) {
							var quality = "";
							switch(fullItem.qualityId)
                            {
                                case 0:
                                	quality = "poor";
                                    break;
                                case 1:
                                    quality = "common";
                                    break;
                                case 2:
                                    quality = "uncommon";
                                    break;
                                case 3:
                                    quality = "rare";
                                    break;
								case 4:
                                    quality = "epic";                                    
                                    break;
								case 5:
                                    quality = "legendary";                                    
                                    break;                                    
                            }

                            itm.quality = quality;
						}

						if (fullItem.stats) {
							if (fullItem.stats.breedId) {
								var breed = "";
								switch(fullItem.stats.breedId)
	                            {
	                                case 4:
	                                case 14:
	                                    breed = "P/P";
	                                    break;
	                                case 5:
	                                case 15:
	                                    breed = "S/S";
	                                    break;
	                                case 6:
	                                case 16:
	                                    breed = "H/H";
	                                    break;
	                                case 7:
	                                case 17:
	                                    breed = "H/P";
	                                    break;
	                                case 8:
	                                case 18:
	                                    breed = "P/S";
	                                    break;
	                                case 9:
	                                case 19:
	                                    breed = "H/S";
	                                    break;
	                                case 10:
	                                case 20:
	                                    breed = "P/B";
	                                    break;
	                                case 11:
	                                case 21:
	                                    breed = "S/B";
	                                    break;
	                                case 12:
	                                case 22:
	                                    breed = "H/B";
	                                    break;
	                                case 3:
	                                case 13:
	                                    breed = "B/B";
	                                    break;
	                            }

	                            itm.breed = breed;
							}

							itm.level = fullItem.stats.level;
						}
					}

					// Need to some extra work to determine what our url should be
                    // By default we'll use a spell id
                    var link = "spell="+itm.spellId;

                    // If the item id is available lets use that
                    if (item.itemId) {
                        link = "item="+item.itemId;
                    } else if (item.allianceId && character.faction == 'A') {
                        link = "item="+item.allianceId;
                    } else if (item.hordeId && character.faction == 'H') {
                        link = "item="+item.hordeId;
                    } else if (item.creatureId) {
                        link = "npc="+item.creatureId;
                    }

					itm.link = link;

					// What would cause it to show up in the UI:
					//	1) You have the item
					//  2) Its still obtainable 
					//	3) You meet the class restriction
					//  4) You meet the race restriction
                    var hasthis = itm.collected;			
					var showthis = (hasthis || item.obtainable);
                    if (item.allowableRaces.length > 0)
                    {
                    	var foundRace = false;
                    	angular.forEach(item.allowableRaces, function(race) {
							if (race == character.race) {
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
							if (allowedClass == character.class) {
								foundClass = true;
							}
						});

						if (!foundClass) {
							showthis = false;
						}
                    }

					if (showthis) {
						subCat.items.push(itm);
						totalPossible++;
					}
				});

				if (subCat.items.length > 0) {
					cat.subCategories.push(subCat);	
				}				
			});
    	}); 

		// Add totals
		obj['collected'] = totalCollected;
		obj['possible'] = totalPossible;

		// Data object we expose externally
		return obj;
	}
}]);
