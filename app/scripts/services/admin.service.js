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

        getMissingMounts: function() {
          return $http.get(SettingsService.jsonFiles.mounts, { cache: true, isArray:true })
          .then(function(data) {
            return [
              { collected:true, icon:'inv_moosemount2nightmare', link: 'item=141216'},
              { collected:true, icon:'inv_moosemount2nightmare', link: 'item=141216'},
              { collected:true, icon:'inv_moosemount2nightmare', link: 'item=141216'},
              { collected:true, icon:'inv_moosemount2nightmare', link: 'item=141216'},
              { collected:true, icon:'inv_moosemount2nightmare', link: 'item=141216'},
              { collected:true, icon:'inv_moosemount2nightmare', link: 'item=141216'},
              { collected:true, icon:'inv_moosemount2nightmare', link: 'item=141216'},
              { collected:true, icon:'inv_moosemount2nightmare', link: 'item=141216'},
              { collected:true, icon:'inv_moosemount2nightmare', link: 'item=141216'},
              { collected:true, icon:'inv_moosemount2nightmare', link: 'item=141216'},
              { collected:true, icon:'inv_moosemount2nightmare', link: 'item=141216'},
              { collected:true, icon:'inv_moosemount2nightmare', link: 'item=141216'},
            ];
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