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

        modalInstance.opened.then(function () {
            // Focus on the selection box when the dialog comes up
            window.setTimeout(function() {
                $('#realmSelection').focus();
            },50);
        });     
         
        modalInstance.result.then(function (loginObj) {

            $location.url(loginObj.region + '/' + loginObj.realm + '/' + loginObj.character);
        });

       $rootScope.$on('$routeChangeSuccess', function() {

            modalInstance.dismiss();
       });
    }

    function ModalInstanceCtrl($scope, $modalInstance, BlizzardRealmService) {

        // initialize with select disabled and a loading text
        $scope.realms = [
            {
                value:{realm:'', region:''}, text:'Loading realms...'
            }
        ];
        $scope.selectedRealm = $scope.realms[0].value;

        // turn drop down off until servers come back
        $scope.isDisabled = true;

        // wait for promises to finish and then populate with servers
        BlizzardRealmService.getUSRealms().then(function(data) {
            console.log('Got realms for US');
            $scope.isDisabled = false;
            if ($scope.realms.length === 1) {
                $scope.realms = [];
            }

            angular.forEach(data.data.realms, function(value) {   
               this.push({value:{realm:value.slug, region:'us'}, text:value.name + ' US'});
            }, $scope.realms);
        });

        BlizzardRealmService.getEURealms().then(function(data) {
            console.log('Got realms for EU');
            $scope.isDisabled = false;
            if ($scope.realms.length === 1) {
                $scope.realms = [];
            }

            angular.forEach(data.data.realms, function(value) {
               this.push({value:{realm:value.slug, region:'eu'}, text:value.name + ' EU'});
            }, $scope.realms);    
        });

        $scope.ok = function () {
            $modalInstance.close({
                'region': $scope.selectedRealm.region,
                'realm': $scope.selectedRealm.realm,
                'character': $scope.characterName
            });
        };
    }

})();