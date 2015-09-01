'use strict';

(function() {
    
    angular
        .module('simpleArmoryApp')
        .factory('SettingsService', SettingsService);

    function SettingsService($log, $routeParams) {

        return {
            'WowHeadUrl': 'ptr.wowhead.com',
            'debug': $routeParams['debug'] && $routeParams['debug'] === '1' ? true : false,
            'fakeCompletionTime': 312
        };       
    }

})();