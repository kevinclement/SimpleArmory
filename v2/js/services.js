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
	    		loggedIn = true;
	    		$location.url(loginObj.region + "/" + loginObj.realm + "/" + loginObj.character);
	    	});
	  },

	  getCharacter: function($routeParams) {
	  	if (character != null &&
	  		character.region.toLowerCase() == $routeParams.region.toLowerCase() &&
	  		character.name.toLowerCase() == $routeParams.character.toLowerCase() &&
	  		character.realm.toLowerCase() == $routeParams.realm.toLowerCase()) {
	  		$log.log("Using cache'd character");
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
      				getCharacter: {
      					method:'JSONP',
      				}
   			 	}).getCharacter(
   			 		{region:$routeParams.region, realm:$routeParams.realm, character:$routeParams.character},
   			 		function(value, responseHeaders) {
						// Success
						value.region = $routeParams.region;
						character = value;
   			 		},
   			 		function(httpResponse){
   			 			// Failure
   			 			// TODO: We should be redirecting to a error page
   			 			$location.url("error");
   			 		});
	  	}
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