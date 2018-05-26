/*globals $WowheadPower */
'use strict';

(function() {

    angular
        .module('simpleArmoryApp')
        .controller('ToysCtrl' , ToysCtrl);

    function ToysCtrl($scope, MountsAndPetsService, PlannerService, $window, SettingsService) {

        $scope.settings = SettingsService;

        // Analytics for page
        $window.ga('send', 'pageview', 'Toys');

        MountsAndPetsService.getItems('toys', 'toys', 'itemId').then(function(items){
            $scope.items = items;
        });
    }

  angular
    .module('simpleArmoryApp')
    .controller('ToysFormCtrl' , ToysFormCtrl);

  function ToysFormCtrl($scope) {
    $scope.formInfo = {};
    $scope.saveData = function() {
      try {
        JSON.parse($scope.formInfo.toys);
      } catch (e) {
        // TODO: display json error, do more consistency checks
        return;
      }
      localStorage.setItem('toys', $scope.formInfo.toys);
      window.location.reload(true);
    };
  }

})();
