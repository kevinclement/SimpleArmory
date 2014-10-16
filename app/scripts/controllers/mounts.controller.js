'use strict';

(function() {
    
    angular
        .module('simpleArmoryApp')
        .controller('MountsCtrl' , MountsCtrl);

    function MountsCtrl($scope, MountsAndPetsService) {
        MountsAndPetsService.getItems('mounts', 'mounts', 'spellId').then(function(items){
            $scope.items = items;
        });
    }

})();