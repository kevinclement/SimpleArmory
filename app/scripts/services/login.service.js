'use strict';

(function() {

    angular
        .module('simpleArmoryApp')
        .factory('LoginService', LoginService);

    function LoginService($location, $log, $http, $q) {
        return {
            getCharacter: function($routeParams) {
                $log.log('Fetching ' + $routeParams.character + ' from server ' + $routeParams.realm + '...');

                var jsonp = $http.jsonp(
                    'http://' + 
                      $routeParams.region +
                      '.battle.net/api/wow/character/' +
                      $routeParams.realm + 
                      '/' +
                      $routeParams.character +
                      '?fields=pets,mounts,achievements,guild,reputation&jsonp=JSON_CALLBACK',
                     { cache: true})
                    .error(getCharacterError)
                    .then(getCharacterComplete);

                  return $q.all([jsonp]);

              function getCharacterError() {
                  $log.log('Trouble fetching character from battlenet');
                $location.url('error/' + $routeParams.realm + '/' + $routeParams.character);
              }

              function getCharacterComplete(data) {
                  data.data.region = $routeParams.region;

                  // add faction
                  data.data.faction = [,'A','H','A','A','H','H','A','H','H','H','Alliance',,,,,,,,,,,'A',,,'A','H'][data.data.race];

                return data.data;
              }
          }
        };
    }

})();
