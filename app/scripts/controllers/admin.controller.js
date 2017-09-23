'use strict';

(function() {

    angular
        .module('simpleArmoryApp')
        .controller('AdminCtrl', AdminCtrl);

    function AdminCtrl($scope, AdminService, $routeParams, $window) {

        // Analytics for page
        $window.ga('send', 'pageview', 'Admin');

        // TODO: change download url to be based on file we're working on
        $scope.downloadFile = 'mounts.json';

        // TODO: don't show save button unless we've made a change
        // TODO: service and stuff should be based on changes I made

        AdminService.getMountData().then(function(data){
            // store the data in the scope so that we can build out forms from it
            var categories = [];
            for(var i=0; i<data.length; i++) {
                var cat = data[i];
                var name = cat.name;
                categories.push(cat);
            }

            $scope.mountCategories = categories;
            $scope.selectedMountCategory = $scope.mountCategories[0];
            $scope.mountCategorySelected();
        });

        $scope.mountCategorySelected = function() {

            var subCategories = [];
            for(var j=0; j<$scope.selectedMountCategory.subcats.length; j++) {
                var subCat = $scope.selectedMountCategory.subcats[j];
                subCategories.push(subCat);
            }

            $scope.mountSubCategories = subCategories;
            $scope.selectedMountSubCategory = $scope.mountSubCategories[0];
        }

        $scope.saveClicked = function() {
            // NOTE: There is probably an easier way todo this, but I'm using 2 anchors, one to trigger refresh of data
            // and a 2nd to actually download that data

            // update scope data to download based on changes we made
            var jsonData = 'data:text/json;charset=utf-8,' + encodeURIComponent(angular.toJson($scope.mountCategories, 2));

            // trigger hidden link
            var anchor = document.getElementById('downloadLink');
            anchor.href = jsonData;
            anchor.click()
        }
    }

})();