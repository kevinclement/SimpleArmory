'use strict';

/* Services */
var simpleArmoryServices = angular.module('simpleArmoryServices', ['ngResource']);

simpleArmoryServices.factory('LoginService', ['$resource', '$location', '$log', function ($resource, $location, $log) {
	var loggedIn = false;
	var character = null;

	return {
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
	  	if (character != null &&
	  		character.region.toLowerCase() == $routeParams.region.toLowerCase() &&
	  		character.name.toLowerCase() == $routeParams.character.toLowerCase() &&
	  		character.realm.toLowerCase() == $routeParams.realm.toLowerCase()) {
	  		$log.log("Using cached character");
	  		return character;
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
						character = value;
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

/*
phonecatServices.factory('Phone', ['$resource',
  function($resource){
    return $resource('phones/:phoneId.json', {}, {
      query: {method:'GET', params:{phoneId:'phones'}, isArray:true}
    });
  }]);
*/