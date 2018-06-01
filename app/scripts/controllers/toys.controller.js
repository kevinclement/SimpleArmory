'use strict';

(function() {

    angular
        .module('simpleArmoryApp')
        .controller('ToysCtrl' , ToysCtrl);

    function ToysCtrl($scope, MountsAndPetsService, PlannerService, $window, SettingsService) {

        $scope.settings = SettingsService;
        $scope.toyString = "";

        // only show export if they don't have a local storage settings, or when they click update
        $scope.showExport = localStorage.getItem('toys') === null;

        // Analytics for page
        $window.ga('send', 'pageview', 'Toys');

        MountsAndPetsService.getItems('toys', 'toys', 'itemId').then(function(items){
            $scope.items = items;
        });

        $scope.save = function() {
          try {
            JSON.parse($scope.toyString);
          } catch (e) {
            // TODO: display json error, do more consistency checks
            return;
          }
          localStorage.setItem('toys', $scope.toyString);
          window.location.reload(true);
        };

        $scope.cancel = function() {
          $scope.showExport = false;
        };
    }
})();
