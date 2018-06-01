'use strict';

(function() {

    angular
        .module('simpleArmoryApp')
        .controller('ToysCtrl' , ToysCtrl);

    function ToysCtrl($scope, ToysService, $window, SettingsService) {

        $scope.settings = SettingsService;
        $scope.toyString = '';

        // only show export if they don't have a local storage settings, or when they click update
        $scope.showExport = localStorage.getItem('toys') === null;

        // Analytics for page
        $window.ga('send', 'pageview', 'Toys');

        ToysService.getItems().then(function(items){
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
          ToysService.getItems(true).then(function(items){
            $scope.items = items;
          });
        };

        $scope.cancel = function() {
          $scope.showExport = false;
        };
    }
})();
