'use strict';

 angular
    .module('simpleArmoryApp')
    .controller('CompanionsCtrl' , CompanionsCtrl);

function CompanionsCtrl($scope, MountsAndPetsService) {
  
  MountsAndPetsService.getItems('pets', 'pets', 'spellId').then(function(items){
      $scope.items = items;
  });
}
