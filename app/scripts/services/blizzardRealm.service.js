'use strict';

(function() {
    
     angular
        .module('simpleArmoryApp')
        .factory('BlizzardRealmService', BlizzardRealmService);

    function BlizzardRealmService($http, $q, $log) {

        return {

            getUSRealms: function() {
                $log.log('Fetching server list for us...');
                return $http.jsonp('http://us.battle.net/api/wow/realm/status?jsonp=JSON_CALLBACK');
            },

            getEURealms: function() {
                $log.log('Fetching server list for eu...');
                return $http.jsonp('http://eu.battle.net/api/wow/realm/status?jsonp=JSON_CALLBACK');
            }
        };
    }

})();