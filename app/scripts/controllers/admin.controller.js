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

            updateMoveButtons();
        });

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

        function updateMoveButtons() {
            $scope.upButtonDisabled = $scope.mountCategories.indexOf($scope.selectedMountCategory) == 0;
            $scope.downButtonDisabled = $scope.mountCategories.indexOf($scope.selectedMountCategory) == $scope.mountCategories.length - 1;
        }

        /* ## Category ############################################################################### */

        $scope.addCategory = function() {
            var newCategory = prompt('Category to add:');
            if (newCategory != '') {

                // TODO: probably should be in a service
                var catObj = { name: newCategory, subcats: [] }
                $scope.mountCategories.push(catObj);
            }
        }

        $scope.removeCategory = function() {
            $scope.mountCategories = $scope.mountCategories.filter(function(category){
                return category != $scope.selectedMountCategory;
            });

            $scope.selectedMountCategory = $scope.mountCategories[0];
        }

        $scope.moveCategoryUp = function() {
            moveCategory(true);
        }

        $scope.moveCategoryDown = function() {
            moveCategory(false);
        }
        
        function moveCategory(up) {
            var catToMove = $scope.selectedMountCategory;
            var src = $scope.mountCategories.indexOf(catToMove);
            var dest = up ? src - 1 : src + 1;

            $scope.mountCategories[src] = $scope.mountCategories[dest];
            $scope.mountCategories[dest] = catToMove;

            updateMoveButtons();
        }

        /* ## Sub Category ############################################################################### */

        $scope.removeSubCategory = function() {
            $scope.selectedMountCategory.subcats = $scope.selectedMountCategory.subcats.filter(function(sub){
                return sub != $scope.selectedMountSubCategory;
            });
        }

        $scope.addSubCategory = function() {
            // var newCat = prompt('Sub Category to add:');
            // if (newCat != '') {
            //     var catObj = { name: newCat, items: [] };
            //     $scope.mountSubCategories.push(catObj);
            // }
        }
    }

})();