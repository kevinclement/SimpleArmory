'use strict';

(function() {
    
     angular
        .module('simpleArmoryApp')
        .factory('BlizzardRealmService', BlizzardRealmService);

    function BlizzardRealmService($http, $q, $log) {

        return {

            getUSRealms: function() {
                $log.log('Fetching server list for us...');
                return $http.jsonp(window.location.protocol + '//us.battle.net/api/wow/realm/status?jsonp=JSON_CALLBACK');
            },

            getEURealms: function() {
                $log.log('Fetching server list for eu...');
                return $http.jsonp(window.location.protocol + '//eu.battle.net/api/wow/realm/status?jsonp=JSON_CALLBACK');
            },

            getEUDefaultRealms: function() {
                $log.log('Using default eu realms');

                return $http.get('data/euServers.json', { cache: true})
                    .then(function(data) {
                        return data.data;
                    });
            }
        };
    }

})();