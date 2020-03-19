'use strict';

(function() {
  
    angular
        .module('simpleArmoryApp')
        .controller('BattlePetsCtrl' , BattlePetsCtrl);

    function BattlePetsCtrl($scope, MountsAndPetsService, $window, SettingsService) {

        $scope.settings = SettingsService;
    
        // Analytics for page
        $window.ga('send', 'pageview', 'BattlePets');

        MountsAndPetsService.getItems('battlepets', 'pets', 'species').then(function(items){
            $scope.items = items;
        });
    }

})();
