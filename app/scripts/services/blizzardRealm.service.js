'use strict';

(function() {
    
     angular
        .module('simpleArmoryApp')
        .factory('BlizzardRealmService', BlizzardRealmService);

    function BlizzardRealmService($http, $q, $log) {

        return {

            getAllRealms: function() {
                var defer = $q.defer();
                
                $q.all([
                    $http.get(window.location.protocol + '//cdn.simplearmory.com/json/servers.us.json').then(function(data) {

                        // initial fetch for us looks good.  TODO: if our update ever goes bad, we'll need more checks here
                        console.log('Got realms for US');
                        return data;
                    }, function(reason) {
                        
                        // had some problems loading data from cdn.  lets load the local copy
                        console.log('Failed to get realms for US: ' + reason.status + ' ' + reason.statusText);
                        return $http.get('data/servers.us.json');
                    }),
                    $http.get(window.location.protocol + '//cdn.simplearmory.com/json/servers.eu.json').then(function(data) {
                        console.log('Got realms for EU');

                        // todo: verify data is good

                        return data;
                    }, function(reason) {

                       // had some problems loading data from cdn.  lets load the local copy
                       console.log('Failed to get realms for EU: ' + reason.status + ' ' + reason.statusText);
                       return $http.get('data/servers.eu.json'); 
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