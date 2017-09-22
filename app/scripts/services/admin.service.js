'use strict';

(function() {
    
    angular
        .module('simpleArmoryApp')
        .factory('AdminService', AdminService);

    function AdminService() {

      return {
        getLatestBlizzardMounts: function() {
          return {};
        }
      };
    }
})();