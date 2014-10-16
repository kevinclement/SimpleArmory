'use strict';

 angular
    .module('simpleArmoryApp')
    .controller('BattlePetsCtrl' , BattlePetsCtrl);

function BattlePetsCtrl($scope, MountsAndPetsService) {

  MountsAndPetsService.getItems('battlepets', 'pets', 'creatureId').then(function(items){
      $scope.items = items;
  });

  $scope.qualityToBackground = function(item) {
    var bgColor = '#fff';

    switch(item.quality) {
        case 'poor':
            bgColor = '#7F7F7F';
            break;
        case 'common':
            bgColor = '#F0F0F0';
            break;
        case 'uncommon':
            bgColor = '#22B14C';
            break;
        case 'rare':
            bgColor = '#3F48CC';
            break;
    }

    return 'background:' + bgColor;
  };

}