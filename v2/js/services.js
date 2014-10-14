'use strict';

/* Services */
var simpleArmoryServices = angular.module('simpleArmoryServices', ['ngResource']);

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

simpleArmoryServices.factory('BlizzardRealmService', ['$resource', '$q', '$log', function ($resource, $q, $log) {

	return {
		getRealms: function() {
	  		$log.log("Fetching server list for us...");
	  		var usPromise = $resource(
		  		'http://us.battle.net/api/wow/realm/status',
		  		{
		  			jsonp: 'JSON_CALLBACK',
		  		}, 
		  		{
      				get: { method:'JSONP', }
   			 	}).get().$promise;

	  		$log.log("Fetching server list for eu...");
	  		var euPromise = $resource(
		  		'http://eu.battle.net/api/wow/realm/status',
		  		{
		  			jsonp: 'JSON_CALLBACK',
		  		}, 
		  		{
      				get: { method:'JSONP', }
   			 	}).get().$promise;

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

simpleArmoryServices.factory('MountsService', ['$http', '$log', 'LoginService', '$routeParams', function ($http, $log, loginService, $routeParams) {
	return {
		getMounts: function() {
			return loginService.getCharacter({'region': $routeParams.region, 'realm':$routeParams.realm, 'character':$routeParams.character})
				.then(function(character) {
					return $http.get('data/mounts.json', { cache: true, isArray:true })
    	            	.then(function(data, status, headers, config) {
    	        			return parseMountsObject(data.data, character[0]);    	
    	            	});
				})		
		}
	}

	function parseMountsObject(mountsCategories, character) {	
		var obj = { 'categories': [] };
		var collected = {};
		var totalCollected = 0;
		var totalPossible = 0;
		$log.log("Parsing mounts.json...");
		
		// Build up lookup for mounts that character has
		angular.forEach(character.mounts.collected, function(mount, index) {
			collected[mount.spellId] = mount;
			totalCollected++;
		});

		// Lets parse out all the categories and build out our structure
		angular.forEach(mountsCategories, function(category) {

			// Add the mount category to the mount list
			var cat = { 'name': category.name, 'subCategories': [] };
			obj.categories.push(cat);

			angular.forEach(category.subcats, function(subCategory) {

				var subCat = { "name": subCategory.name, "mounts":[] };

				// console.log("subcat: " +subCategory.name + " items: " + subCategory.items.length);	

				angular.forEach(subCategory.items, function(item) {
					
					var mount = item;

					// fix spellid typo
					mount.spellId = item.spellid;
					delete mount.spellid;

					mount.collected = collected[mount.spellId] != null;

					// Need to some extra work to determine what our url should be
                    // By default we'll use a spell id
                    var link = "spell="+mount.spellId;

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

					mount.link = link;

					// What would cause it to show up in the UI:
					//	1) You have the item
					//  2) Its still obtainable 
					//	3) You meet the class restriction
					//  4) You meet the race restriction
                    var hasthis = mount.collected;			
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
						subCat.mounts.push(mount);
						totalPossible++;
					}
				});

				if (subCat.mounts.length > 0) {
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
