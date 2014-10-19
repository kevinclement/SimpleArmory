'use strict';

(function() {
    
    angular
        .module('simpleArmoryApp')
        .controller('LoginCtrl' , LoginCtrl)
        .controller('ModalInstanceCtrl' , ModalInstanceCtrl);

    function LoginCtrl($scope, $modal, $location, $timeout) {
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
    }

    function ModalInstanceCtrl($scope, $modalInstance, BlizzardRealmService) {

        // initialize with just a loading realms message
        $scope.realms = [
            {name:'Loading realms...'},
        ];

        // wait for promises to finish and then populate with servers
        BlizzardRealmService.getRealms().then(function(data) {
            $scope.realms = [];

            // First add the us servers
            angular.forEach(data[0].data.realms, function(value) {   
                this.push({value:{realm:value.slug, region:'us'}, text:value.name + ' US'});
            }, $scope.realms);

            // Then the eu servers
            angular.forEach(data[1].data.realms, function(value) {
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

        // TMP just to make it easier for me to test, to remove before we go live
        $scope.marko = function () {
            $modalInstance.close({
                'region': 'us',
                'realm': 'proudmoore',
                'character': 'marko'
            });
        };
    }

})();