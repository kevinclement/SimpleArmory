'use strict';

(function() {

    angular
        .module('simpleArmoryApp')
        .controller('OverviewCtrl' , OverviewCtrl);

    function OverviewCtrl($scope, AchievementsService) {
      
        AchievementsService.getAchievements().then(function(achievements){
            $scope.achievements = achievements;
        });
    }

})();
