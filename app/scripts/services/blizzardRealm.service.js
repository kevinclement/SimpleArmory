'use strict';

(function() {
    
     angular
        .module('simpleArmoryApp')
        .factory('BlizzardRealmService', BlizzardRealmService);

    function BlizzardRealmService($http, $q, $log, $window) {

        return {

            getAllRealms: function() {
                var defer = $q.defer();
                
                $q.all([
                    $http.get('data/servers.us.json').then(function(data) {
                        console.log('Got realms for US');
                        return data;
                    }),
                    $http.get('data/servers.eu.json').then(function(data) {
                        console.log('Got realms for EU');
                        return data;
                    }),
                ]).then(function(data) {

                    // combine results here so that its clean to the callers
                    var allServers = [];
                    var server;

                    // US
                    for (var i = 0; i < data[0].data.realms.length; i++) {
                        server = data[0].data.realms[i];

                        // tag region
                        server.region = 'us';

                        allServers.push(server);
                    }

                    // EU
                    for (i = 0; i < data[1].data.realms.length; i++) {
                        server = data[1].data.realms[i];

                        // tag region
                        server.region = 'eu';

                        allServers.push(server);
                    }

                    defer.resolve(allServers);
                });

                return defer.promise;
            }
        };
    }

})();