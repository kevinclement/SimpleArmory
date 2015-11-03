'use strict';

(function() {
    
    angular
        .module('simpleArmoryApp')
        .factory('SettingsService', SettingsService);

    function SettingsService($log, $routeParams) {

        return {
            'WowHeadUrl': 'wowhead.com',
            'apiEndPoint':'battle.net/api',
            'apiKey': '',
            'apiProtocol': window.location.protocol + '//',
            'debug': $routeParams['debug'] && $routeParams['debug'] === '1' ? true : false,
            'fakeCompletionTime': 312
        };       
    }

})();