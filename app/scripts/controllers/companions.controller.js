'use strict';

(function() {
    
    angular
        .module('simpleArmoryApp')
        .controller('CompanionsCtrl' , CompanionsCtrl);

    function CompanionsCtrl($scope, MountsAndPetsService, $window, SettingsService) {

        $scope.settings = SettingsService;
    
    	// Analytics for page
        $window.ga('send', 'pageview', 'Companions');
     
        MountsAndPetsService.getItems('pets', 'pets', 'species').then(function(items){
            $scope.items = items;
          });
    }

})();
