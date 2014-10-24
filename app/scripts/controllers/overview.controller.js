'use strict';

(function() {

    angular
        .module('simpleArmoryApp')
        .controller('OverviewCtrl' , OverviewCtrl);

    function OverviewCtrl($scope, AchievementsService, $location, $window) {
      	
      	// Analytics for page
        $window.ga('send', 'pageview', 'Overview');

        AchievementsService.getAchievements().then(function(achievements){
            $scope.achievements = achievements;
        });

        $scope.baseUrl = '#' + $location.$$path;
    }

})();
