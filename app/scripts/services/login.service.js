'use strict';

(function() {

    angular
        .module('simpleArmoryApp')
        .factory('LoginService', LoginService);

    function LoginService($location, $log, $http, $q, $window, SettingsService) {
        //  cache results
        var characterCached;
        var profileCached;

        // callbacks to call once we've logged in
        // this allows for aggregator type behavior where we can clear caches
        var callbacks = [];

        // saved from last time someone tried to use the login service
        var gRegion;
        var gRealm;
        var gCharacter;

        var pRegion;
        var pRealm;
        var pCharacter;

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

                return $http.get(
                  SettingsService.apiEndPoint +
                  'character/' +
                  $routeParams.region + '/' +
                  $routeParams.realm + '/' +
                  $routeParams.character,
                  {cache: true})
                  .error(getCharacterError)
                  .then(getCharacterComplete);

              function getCharacterError() {
                $log.error('Trouble fetching character from battlenet');

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

                  characterCached.faction = [
                    '',
                    'A',  // Human
                    'H',  // Orc
                    'A',  // Dwarf
                    'A',  // Night Elf
                    'H',  // Undead
                    'H',  // Tauren
                    'A',  // Gnome
                    'H',  // Troll
                    'H',  // Goblin
                    'H',  // Blood Elf
                    'A',  // Draenei
                    '', '', '', '', '', '', '', '', '', '',
                    'A',  // Worgen
                    '',
                    '',
                    'A',  // Pandaren Alliance
                    'H',  // Pandaren Horde
                    'H',  // Nightborne
                    'H',  // Highmountain Tauren
                    'A',  // Void Elf
                    'A',  // Lightforged Draenei
                    'H',  // Zandalari Troll
                    'A',  // Kul Tiran
                    '',
                    'A',  // Dark Iron Dwarf
                    '',
                    'H',  // Mag'har Orc
                  ][characterCached.race];

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

            getProfile: function($routeParams, noCache) {
                // don't fetch if we've already got it
                var sameUser = checkIfSameUser($routeParams.region, $routeParams.realm, $routeParams.character);
                if (sameUser && profileCached) {
                  return $q.when(profileCached);
                }

                // notify others to clear their caches
                if (!sameUser) {
                  for (var i=0; i<callbacks.length; i++) {
                    callbacks[i]('logged in');
                  }
                }

                $log.log('Fetching ' + $routeParams.character + ' from server ' + $routeParams.realm + '...');

                return $http.get(
                  SettingsService.apiEndPoint +
                  'profile/' +
                  $routeParams.region + '/' +
                  $routeParams.realm + '/' +
                  $routeParams.character,
                  {cache: true})
                  .then(getProfileComplete);

              function getProfileComplete(data) {
                  // lets figure out who uses the site
                  $window.ga('send', 'event', 'Login', $routeParams.region + ':' + $routeParams.realm + ':' + $routeParams.character);

                  profileCached = data.data;

                  // add region and faction to character
                  profileCached.region = $routeParams.region;

                  profileCached.faction = ['',
                    'A','H','A','A','H','H','A','H','H','H',
                    'A','','','','','','','','','',
                    '','A','','','A','H','H','H','A','A',
                    'H','A','','A','','H'][profileCached.race.id];

                  pRegion = $routeParams.region;
                  pRealm = $routeParams.realm;
                  pCharacter = $routeParams.character;

                  return profileCached;
              }

              function checkIfSameUser(region, realm, character) {
                if ((region && pRegion && region.toLowerCase() === pRegion.toLowerCase())  &&
                    (realm && pRealm && realm.toLowerCase() === pRealm.toLowerCase())  &&
                    (character && pCharacter && character.toLowerCase() === pCharacter.toLowerCase())) {
                    return true;
                }
                return false;
              }
            },
        };
    }

})();
