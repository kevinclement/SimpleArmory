'use strict';

/* Services */
var simpleArmoryServices = angular.module('simpleArmoryServices', ['ngResource']);

simpleArmoryServices.factory('LoginService', function () {
	var loggedIn = false;

	return {
	  isLoggedIn: function () {
	    return loggedIn;
	  },
	  toggleIsLoggedIn: function () {
	    loggedIn = !loggedIn;
	  }
	}
});

/*
phonecatServices.factory('Phone', ['$resource',
  function($resource){
    return $resource('phones/:phoneId.json', {}, {
      query: {method:'GET', params:{phoneId:'phones'}, isArray:true}
    });
  }]);
*/