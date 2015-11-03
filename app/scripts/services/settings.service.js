'use strict';

(function() {
    
    angular
        .module('simpleArmoryApp')
        .factory('SettingsService', SettingsService);

    function SettingsService($log, $routeParams) {

        return {
            'WowHeadUrl': 'wowhead.com',
            'apiEndPoint':'api.battle.net',
            'apiKey': '&apikey=kwptv272nvrashj83xtxcdysghbkw6ep',
            'apiProtocol': 'https://',
            'debug': $routeParams['debug'] && $routeParams['debug'] === '1' ? true : false,
            'fakeCompletionTime': 312
        };       
    }

})();