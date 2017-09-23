'use strict';

(function() {
    
    angular
        .module('simpleArmoryApp')
        .factory('AdminService', AdminService);

    function AdminService($http, $log, SettingsService) {

      return {
        getLatestBlizzardMounts: function() {
          return {};
        },

        getMountCategories: function() {
          return $http.get(SettingsService.jsonFiles.mounts, { cache: true, isArray:true })
          .then(function(data) {
            // data is the json
            return data;
          });
        },

        getMountData: function() {
          return $http.get(SettingsService.jsonFiles.mounts, { cache: true, isArray:true })
          .then(function(data) {
            // data is the json
            return data.data;
          });
        },
      };
    }
})();