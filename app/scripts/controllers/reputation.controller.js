'use strict';

(function() {
    
    angular
        .module('simpleArmoryApp')
        .controller('ReputationCtrl' , ReputationCtrl);

    function ReputationCtrl($scope, FactionsService, $window) {

        // Analytics for page
        $window.ga('send', 'pageview', 'Reputation');

        FactionsService.getFactions().then(function(items){
            $scope.items = items;
        });
    }
})();