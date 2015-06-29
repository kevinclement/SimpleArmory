'use strict';

(function() {
    
    angular
        .module('simpleArmoryApp')
        .factory('SettingsService', SettingsService);

    function SettingsService($log, $routeParams) {
        return {
            'WowHeadUrl': 'www.wowhead.com'
        };       
    }

})();