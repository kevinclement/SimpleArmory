'use strict';

(function() {

    angular
        .module('simpleArmoryApp')
        .factory('LoginService', LoginService);

    function LoginService($location, $log, $http, $q, $window, SettingsService) {
        //  cache results
        var profileCached;

        // callbacks to call once we've logged in
        // this allows for aggregator type behavior where we can clear caches
        var callbacks = [];

        // saved from last time someone tried to use the login service
        var pRegion;
        var pRealm;
        var pCharacter;

        return {

            // allow consumers to register when a login has occcured
            onLogin: function(callback) {
              callbacks.push(callback);
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
                  SettingsService.apiUrl($routeParams),
                  {cache: true})
                  .error(getProfileError)
                  .then(getProfileComplete);

              function getProfileError() {
                    $log.error('Trouble fetching character from battlenet');
    
                    // let's figure out what the errors are
                    $window.ga('send', 'event', 'LoginError', $routeParams.region + ':' + $routeParams.realm + ':' + $routeParams.character);
    
                    $location.url('error/' + $routeParams.realm + '/' + $routeParams.character);
              }

              function getProfileComplete(data) {
                  // lets figure out who uses the site
                  $window.ga('send', 'event', 'Login', $routeParams.region + ':' + $routeParams.realm + ':' + $routeParams.character);

                  profileCached = data.data;

                  // add region, faction and class to character
                  profileCached.region = $routeParams.region;
                  profileCached.realm = $routeParams.realm;
                  profileCached.class = data.data.character_class.id;
                  profileCached.faction = [
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
                    'H',  // Vulpera
                    'H',  // Mag'har Orc
                    'A',  // Mechagnome
                  ][profileCached.race.id];

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

            getProfileMedia: function($routeParams) {
              return $http.get(SettingsService.apiUrl($routeParams, 'character-media'), {cache: true})
                .then(function(pMedia) {
                  return pMedia;
                });
            },
        };
    }

})();
