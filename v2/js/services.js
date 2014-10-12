'use strict';

/* Services */
var simpleArmoryServices = angular.module('simpleArmoryServices', ['ngResource']);

simpleArmoryServices.factory('LoginService', ['$location', '$log', '$http', function ($location, $log, $http) {
	return {
	  getCharacter: function($routeParams) {
  		$log.log("Fetching " + $routeParams.character + " from server " + $routeParams.realm);

  		return $http.jsonp('http://' + $routeParams.region +'.battle.net/api/wow/character/' + $routeParams.realm + '/' + $routeParams.character +'?fields=pets,mounts,achievements,guild,reputation&jsonp=JSON_CALLBACK')
  			.error(getCharacterError)
  			.then(getCharacterComplete);

  		function getCharacterError(data, status, headers, config) {
  			$log.log("Trouble fetching character from battlenet");
			$location.url("error");
  		}

  		function getCharacterComplete(data, status, headers, config) {
  			data.data.region = $routeParams.region;
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

simpleArmoryServices.factory('AchievementsService', ['$http', '$log', 'LoginService', function ($http, $log, loginService) {
	return {
		getAchievements: function(character) {
			return $http.get('data/achievements.json', { cache: true})
                .then(getAchievementsComplete);

            function getAchievementsComplete(data, status, headers, config) {
            	return parseAchievementObject(data.data.supercats, character);
            }
		}
	}

	function parseAchievementObject(supercats, character) {	
		var obj = {};
		var completed = {};
		var totalPossible = 0;
		var totalCompleted = 0;
		$log.log("Parsing achievements.json...");

		// TODO: Fix feats of strength
		// TODO: faction check stuff

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
						var myAchievement = ach;

						if (supercat.name != "Feats of Strength" && ach.obtainable && (ach.side == '' || ach.side == "A")){
							possibleCount++;
							totalPossible++;

							if (completed[ach.id]) {
								completedCount++;
								totalCompleted++;
							}

							myAchievement['completed'] = completed[ach.id];
						}

						myZone['achievements'].push(myAchievement);
					});

					myCat['zones'].push(myZone);
				});

				// Add the category to the obj
				obj[supercat.name]['categories'].push(myCat);
			});

			obj[supercat.name]['possible'] = possibleCount;
			obj[supercat.name]['completed'] = completedCount;
    	}); 

		// Add totals
		obj['possible'] = totalPossible;
		obj['completed'] = totalCompleted;

		// Data object we expose externally
		return obj;
	}
}]);
