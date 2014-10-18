'use strict';

(function() {
    
    angular
        .module('simpleArmoryApp')
        .controller('ReputationCtrl' , ReputationCtrl);

    function ReputationCtrl($scope, FactionsService) {

    	FactionsService.getFactions().then(function(items){
            $scope.items = items;
        });
    }
})();