'use strict';

(function() {

    angular
        .module('simpleArmoryApp')
        .controller('AdminCtrl', AdminCtrl);

    function AdminCtrl($scope, $window, $routeParams, SettingsService, $location, AdminService, $http) {

        // Analytics for page
        $window.ga('send', 'pageview', 'Admin');

        // Store url parts into scope
        $scope.area = $routeParams.area;             // e.g. categories
        $scope.section = $routeParams.section;       // e.g. achievement
        $scope.subsection = $routeParams.subsection; // e.g. quests

        // Use the settings to materialize select drop down
        $scope.sections = [
            { 'label': 'Missing Achievements', 'route': '/admin/missing/achievements' },
            { 'label': 'Missing Mounts', 'route': '/admin/missing/mounts' },
            { 'label': 'Mount Categories', 'route': '/admin/categories/mounts' },
        ];

        // Pull all the achievement super categories out and add them to sections
        AdminService.getAchievementData().then(function(data){
            for(var i=0; i < data.supercats.length; i++) {
                var supercat = data.supercats[i];
                var label = 'Achievement - ' + supercat.name;
                var route = '/admin/categories/achievements/' + supercat.name.toLowerCase();

                $scope.sections.push({ 'label': label, 'route': route });
            }

            // find the matching drop down so we can select it when loading from url
            angular.forEach($scope.sections, function(section) {
                if (section.route === $location.path()) {
                    $scope.selectedAdminSection = section;
                }
            });
        });

        $scope.canSave = function(file, data) {
            $scope.data = data;
            $scope.file = file;
        };

        $scope.$watch('selectedAdminSection', function(newValue, oldValue) {
            // selection changes url
            if (newValue !== undefined) {
                $location.url(newValue.route);
            }
        });

        $scope.saveClicked = function() {

            // NOTE: This is leveraging connect middleware that is hooked up during
            // dev debugging to save to file.  This does a post of the data and 
            // that decodes the body, and saves into the file on disk
            $http.post('/save/' + $scope.file, angular.toJson($scope.data, 2));
        };
    }

})();