'use strict';

(function() {

    angular
        .module('simpleArmoryApp')
        .controller('AdminCtrl', AdminCtrl);

    function AdminCtrl($scope, $window, $routeParams, SettingsService, $location) {

        // Analytics for page
        $window.ga('send', 'pageview', 'Admin');

        // Use the settings to materialize select drop down
        $scope.sections = SettingsService.adminSections;

        // find the matching drop down so we can select it when loading from url
        angular.forEach(SettingsService.adminSections, function(section) {
            if (section.route === $location.path()) {
                $scope.selectedAdminSection = section;
            }
        });

        $scope.canSave = function(file, data) {
            $scope.data = data;
            $scope.file = file;
        };

        $scope.$watch('selectedAdminSection', function(newValue, oldValue) {
            // selection changes url
            $location.url(newValue.route);
        });

        // Store url parts into scope
        $scope.area = $routeParams.area;            // e.g. categories
        $scope.section = $routeParams.section       // e.g. achievement
        $scope.subsection = $routeParams.subsection // e.g. quests

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