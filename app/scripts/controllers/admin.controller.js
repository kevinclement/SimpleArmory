'use strict';

(function() {

    angular
        .module('simpleArmoryApp')
        .controller('AdminCtrl', AdminCtrl);

    function AdminCtrl($scope, $window) {

        // Analytics for page
        $window.ga('send', 'pageview', 'Admin');

        $scope.sections = ['Mounts', 'Mounts Categories'];
        $scope.selectedAdminSection = $scope.sections[0];

        $scope.canSave = function(file, data) {
            $scope.data = data;
            $scope.file = file;
        }

        $scope.saveClicked = function() {
            // NOTE: There is probably an easier way todo this, but I'm using 2 anchors, one to trigger refresh of data
            // and a 2nd to actually download that data

            // trigger hidden link
            var anchor = document.getElementById('downloadLink');
            anchor.href = 'data:text/json;charset=utf-8,' + encodeURIComponent(angular.toJson($scope.data, 2));
            anchor.click()
        }
    }

})();