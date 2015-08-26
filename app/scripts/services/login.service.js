'use strict';

(function() {

    angular
        .module('simpleArmoryApp')
        .factory('LoginService', LoginService);

    function LoginService($location, $log, $http, $q, $window) {
        //  cache results
        var characterCached;

        return {
            getCharacter: function($routeParams, dontCache) {
                // don't fetch if we've already got it
                if (characterCached && !dontCache) {
                  return $q.when(characterCached);
                }

                $log.log('Fetching ' + $routeParams.character + ' from server ' + $routeParams.realm + '...');

                return $http.jsonp(
                    window.location.protocol + '//' + 
                      $routeParams.region +
                      '.battle.net/api/wow/character/' +
                      $routeParams.realm + 
                      '/' +
                      $routeParams.character +
                      '?fields=pets,mounts,achievements,guild,reputation&jsonp=JSON_CALLBACK',
                     { cache: true})
                    .error(getCharacterError)
                    .then(getCharacterComplete);

                //return $q.all([jsonp]);

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
                  characterCached.faction = [,'A','H','A','A','H','H','A','H','H','H','Alliance',,,,,,,,,,,'A',,,'A','H'][characterCached.race];
                  
                  return characterCached;
              }
          }
        };
    }

})();
