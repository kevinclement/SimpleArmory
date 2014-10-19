'use strict';

(function() {

    angular
        .module('simpleArmoryApp')
        .controller('OverviewCtrl' , OverviewCtrl);

    function OverviewCtrl($scope, AchievementsService, $location) {
      
        AchievementsService.getAchievements().then(function(achievements){
            $scope.achievements = achievements;
        });

        $scope.baseUrl = "#" + $location.$$path;
    }

})();
