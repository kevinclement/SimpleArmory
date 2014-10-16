'use strict';

(function() {
    
     angular
        .module('simpleArmoryApp')
        .factory('BlizzardRealmService', BlizzardRealmService);

    function BlizzardRealmService($http, $q, $log) {

        return {
            getRealms: function() {
                $log.log('Fetching server list for us...');
                var usPromise = $http.jsonp('http://us.battle.net/api/wow/realm/status?jsonp=JSON_CALLBACK');

                $log.log('Fetching server list for eu...');
                var euPromise = $http.jsonp('http://eu.battle.net/api/wow/realm/status?jsonp=JSON_CALLBACK');

                return $q.all([usPromise, euPromise]);
            }
        };
    }

})();