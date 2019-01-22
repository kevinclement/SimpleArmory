'use strict';

(function() {
    
    angular
        .module('simpleArmoryApp')
        .factory('SettingsService', SettingsService);

    function SettingsService($log, $routeParams) {

        return {
            'WowHeadUrl': 'wowhead.com',
            'apiEndPoint':'https://armorystats.info/character/',
            'anchorTarget': '_blank',  // in case we want this to be a setting for _self
            'debug': $routeParams['debug'] && $routeParams['debug'] === '1' ? true : false,
            'fakeCompletionTime': 312,
            'jsonFiles': {
                'pets': 'data/pets.json',
                'battlepets': 'data/battlepets.json',
                'mounts': 'data/mounts.json',
                'toys': 'data/toys.json',
                'achievements': 'data/achievements.json'
            }
        };
    }

})();
