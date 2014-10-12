'use strict';

/* Services */
var simpleArmoryServices = angular.module('simpleArmoryServices', ['ngResource']);

simpleArmoryServices.factory('LoginService', ['$resource', '$location', '$log', function ($resource, $location, $log) {
	var loggedIn = false;

	return {
	  character: null,
	  isLoggedIn: function () {
	    return loggedIn;
	  },
	  resetLoggedIn: function() {
		loggedIn = false;
	  },
	  setUser: function (loginObj) {
	    this.getCharacter(loginObj).$promise.then(function(char)
	    	{
	    		$location.url(loginObj.region + "/" + loginObj.realm + "/" + loginObj.character);
	    	});
	  },

	  getCharacter: function($routeParams) {
		var self = this;

	  	if (this.character != null &&
	  		this.character.region.toLowerCase() == $routeParams.region.toLowerCase() &&
	  		this.character.name.toLowerCase() == $routeParams.character.toLowerCase() &&
	  		this.character.realm.toLowerCase() == $routeParams.realm.toLowerCase()) {
	  		$log.log("Using cached character");
	  		return this.character;
	  	}
	  	else {
	  		$log.log("Fetching " + $routeParams.character + " from server " + $routeParams.realm);
		  	return $resource(
		  		'http://:region.battle.net/api/wow/character/:realm/:character',
		  		{
		  			fields: 'fields=pets,mounts,achievements,guild,reputation',
		  			jsonp: 'JSON_CALLBACK',
		  		}, 
		  		{
      				get: { method:'JSONP' }
   			 	}).get(
   			 		{region:$routeParams.region, realm:$routeParams.realm, character:$routeParams.character},
   			 		function(value, responseHeaders) {
						// Success
						value.region = $routeParams.region;
						self.character = value;
						loggedIn = true;
   			 		},
   			 		function(httpResponse){
   			 			// Failure
   			 			$location.url("error");
   			 		});
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
	var cachedParse = null;
	return {
		getAchievements: function(character) {
			return $http.get('data/achievements.json', { cache: true})
                .then(getAchievementsComplete);

            function getAchievementsComplete(data, status, headers, config) {
            	if (cachedParse == null) {
            		cachedParse = parseAchievementObject(data.data.supercats, character);
            	}

            	return cachedParse;
            }
		}
	}

	function parseAchievementObject(supercats, character) {		
		var total = 0;
		$log.log("Parsing achievements.json...");

		// Lets parse out all the super categories and build out our structure
		angular.forEach(supercats, function(supercat) {
			var scc = 0;
			angular.forEach(supercat.cats, function(cat) {
				angular.forEach(cat.zones, function(zone) {
					angular.forEach(zone.achs, function(ach) {
						if (supercat.name != "Feats of Strength" && ach.obtainable && (ach.side == '' || ach.side == "A")){
							total++;	
							scc++;
						}
					});
				});
			});

			//$log.log(supercat.name + " : " + scc);
    	}); 

		return {
			supercats: supercats,
			total: total
		}
	}
}]);
