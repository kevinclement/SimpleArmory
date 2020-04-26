'use strict';

(function() {
    
    angular
        .module('simpleArmoryApp')
        .controller('LoginCtrl' , LoginCtrl)
        .controller('ModalInstanceCtrl' , ModalInstanceCtrl);

    function LoginCtrl($scope, $rootScope, $modal, $location, $timeout) {
        var modalInstance = $modal.open({
            templateUrl: 'ModelLogin.html',
            controller: 'ModalInstanceCtrl',
            backdrop: 'static',
        });
         
        modalInstance.result.then(function (loginObj) {

            $location.url(loginObj.region + '/' + loginObj.realm + '/' + loginObj.character);
        });

       $rootScope.$on('$routeChangeSuccess', function() {

            modalInstance.dismiss();
       });
    }

    function ModalInstanceCtrl($scope, $modalInstance, BlizzardRealmService, $timeout) {

        // initialize with select disabled and a loading text
        $scope.realms = [];
        $scope.selectedRealm = {};
        $scope.selectPlaceholder = 'Loading realm list...';

        // turn drop down off until servers come back
        $scope.isDisabled = true;

        // grouping for drop down
        $scope.regionGroupFn = function (realm){
            if (realm.region.toLowerCase() === 'us') {
                return 'US';
            }
            else {
                return 'EU';
            }
        };

        BlizzardRealmService.getAllRealms().then(function(realms) {

            $scope.selectPlaceholder = 'Enter an realm...';    
            $scope.isDisabled = false;
            if ($scope.realms.length === 1) {
                $scope.realms = [];
            }
            $scope.realms = realms;
            $scope.$broadcast('SetFocus');
        });

        $scope.ok = function () {
            $modalInstance.close({
                'region': $scope.selectedRealm.selected.region,
                'realm': $scope.selectedRealm.selected.slug,
                'character': $scope.characterName.toLowerCase() // Blizzard API doesn't place nice with chars like Ä at start of names
            });
        };
    }

})();