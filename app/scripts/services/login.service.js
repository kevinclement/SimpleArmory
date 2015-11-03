'use strict';

(function() {

    angular
        .module('simpleArmoryApp')
        .factory('LoginService', LoginService);

    function LoginService($location, $log, $http, $q, $window, SettingsService) {
        //  cache results
        var characterCached;

        // callbacks to call once we've logged in
        // this allows for aggregator type behavior where we can clear caches
        var callbacks = [];

        // saved from last time soemone tried to use the login service
        var gRegion;
        var gRealm;
        var gCharacter;

        return {
            
            // allow consumers to register when a login has occcured
            onLogin: function(callback) {
              callbacks.push(callback);
            },

            getCharacter: function($routeParams, noCache) {
                // don't fetch if we've already got it
                var sameUser = checkIfSameUser($routeParams.region, $routeParams.realm, $routeParams.character);
                if (sameUser && characterCached) {
                  return $q.when(characterCached);
                }

                // notify others to clear their caches
                if (!sameUser) {
                  for (var i=0; i<callbacks.length; i++) {
                    callbacks[i]('logged in');
                  }
                }

                $log.log('Fetching ' + $routeParams.character + ' from server ' + $routeParams.realm + '...');

                return $http.jsonp(
                    SettingsService.apiProtocol + 
                      $routeParams.region +
                      '.' + SettingsService.apiEndPoint + '/wow/character/' +
                      $routeParams.realm + 
                      '/' +
                      $routeParams.character + 
                      '?fields=pets,mounts,achievements,guild,reputation' + 
                      SettingsService.apiKey + 
                      '&jsonp=JSON_CALLBACK',
                     { cache: true})
                    .error(getCharacterError)
                    .then(getCharacterComplete);

              function getCharacterError() {
                $log.log('Trouble fetching character from battlenet');

                // let's figure out what the errors are
                $window.ga('send', 'event', 'LoginError', $routeParams.region + ':' + $routeParams.realm + ':' + $routeParams.character);

                $location.url('error/' + $routeParams.realm + '/' + $routeParams.character);
              }

              function getCharacterComplete(data) {
                  // lets figure out who uses the site
                  $window.ga('send', 'event', 'Login', $routeParams.region + ':' + $routeParams.realm + ':' + $routeParams.character);

                  characterCached = data.data;

                  // add region and faction to character
                  characterCached.region = $routeParams.region;
                  characterCached.faction = [,'A','H','A','A','H','H','A','H','H','H','A',,,,,,,,,,,'A',,,'A','H'][characterCached.race];

                  gRegion = $routeParams.region;
                  gRealm = $routeParams.realm;
                  gCharacter = $routeParams.character;
                  
                  return characterCached;
              }

              function checkIfSameUser(region, realm, character) {
                if ((region && gRegion && region.toLowerCase() === gRegion.toLowerCase())  &&
                    (realm && gRealm && realm.toLowerCase() === gRealm.toLowerCase())  &&
                    (character && gCharacter && character.toLowerCase() === gCharacter.toLowerCase())) {
                    return true;
                }
                return false;
              }
            },
        };
    }

})();
