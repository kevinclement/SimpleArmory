'use strict';

(function() {
    
    angular
        .module('simpleArmoryApp')
        .controller('CompanionsCtrl' , CompanionsCtrl);

    function CompanionsCtrl($scope, MountsAndPetsService, $window) {

    	// Analytics for page
        $window.ga('send', 'pageview', 'Companions');
     
        MountsAndPetsService.getItems('pets', 'pets', 'spellId').then(function(items){
            $scope.items = items;
          });
    }

})();
