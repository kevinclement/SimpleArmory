'use strict';

(function() {

    angular
        .module('simpleArmoryApp')
        .controller('AdminCtrl', AdminCtrl);

    function AdminCtrl($scope, $window, SettingsService) {

        // Analytics for page
        $window.ga('send', 'pageview', 'Admin');

        // Use the settings to materialize select drop down
        $scope.sections = [];
        for (var secKey in SettingsService.adminSections) {
            $scope.sections.push(SettingsService.adminSections[secKey]);
        }
        $scope.selectedAdminSection = $scope.sections[2];
        $scope.settingsSections = SettingsService.adminSections;

        $scope.canSave = function(file, data) {
            $scope.data = data;
            $scope.file = file;
        };

        $scope.saveClicked = function() {
            // NOTE: There is probably an easier way todo this, but I'm using 2 anchors, one to trigger refresh of data
            // and a 2nd to actually download that data

            // trigger hidden link
            var anchor = document.getElementById('downloadLink');
            anchor.href = 'data:text/json;charset=utf-8,' + encodeURIComponent(angular.toJson($scope.data, 2));
            anchor.click();
        };
    }

})();