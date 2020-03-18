'use strict';

(function() {
    
    angular
        .module('simpleArmoryApp')
        .factory('SettingsService', SettingsService);

    function SettingsService($log, $routeParams) {
        // TODO: switch back to info site once this client change deploys
        var endpoint = 'https://young-sun-5018.kevinc.workers.dev/';

        return {
            'WowHeadUrl': 'wowhead.com',
            'apiEndPoint': endpoint, 
            'anchorTarget': '_blank',  // in case we want this to be a setting for _self
            'debug': $routeParams['debug'] && $routeParams['debug'] === '1' ? true : false,
            'fakeCompletionTime': 312,
            'jsonFiles': {
                'pets': 'data/pets.json',
                'battlepets': 'data/battlepets.json',
                'mounts': 'data/mounts.json',
                'toys': 'data/toys.json',
                'achievements': 'data/achievements.json'
            },
            apiUrl: function(rp, site) {
                if (site === undefined) {
                    site = '';
                }
                return endpoint + rp.region + '/' + rp.realm + '/' + rp.character + '/' + site;
            }
        };
    }

})();
