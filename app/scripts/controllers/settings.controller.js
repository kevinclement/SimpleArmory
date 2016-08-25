'use strict';

(function() {

    angular
        .module('simpleArmoryApp')
        .controller('SettingsCtrl' , SettingsCtrl);

    function SettingsCtrl($scope, $location, $window) {
      	
      	// Analytics for page
        $window.ga('send', 'pageview', 'Settings');

        //AchievementsService.getAchievements().then(function(achievements){
        //    $scope.achievements = achievements;
        //});
    }

})();
