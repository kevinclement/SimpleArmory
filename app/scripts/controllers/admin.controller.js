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

            $scope.categories = categories;
            $scope.selectedCat = $scope.categories[0];

            $scope.selectionChanged();
        });

        $scope.saveClicked = function() {
            // NOTE: There is probably an easier way todo this, but I'm using 2 anchors, one to trigger refresh of data
            // and a 2nd to actually download that data

            // trigger hidden link
            var anchor = document.getElementById('downloadLink');
            anchor.href = 'data:text/json;charset=utf-8,' + encodeURIComponent(angular.toJson($scope.categories, 2));
            anchor.click()
        }

        $scope.selectionChanged = function() {
            $scope.catUpDisabled = $scope.categories.indexOf($scope.selectedCat) == 0;
            $scope.catDownDisabled = $scope.categories.indexOf($scope.selectedCat) == $scope.categories.length - 1;

            if ($scope.selectedSubCat === undefined || 
                $scope.selectedCat.subcats.indexOf($scope.selectedSubCat) === -1) {
                $scope.selectedSubCat = $scope.selectedCat.subcats[0];
            }

            $scope.subCatUpDisabled = $scope.selectedCat.subcats.indexOf($scope.selectedSubCat) === 0;
            $scope.subCatDownDisabled = $scope.selectedCat.subcats.indexOf($scope.selectedSubCat) === $scope.selectedCat.subcats.length - 1;
        }

        /* ## Category ############################################################################### */

        $scope.addCategory = function() {
            var newCategory = prompt('Category to add:');
            if (newCategory != '') {
                var catObj = { name: newCategory, subcats: [] }
                $scope.categories.push(catObj);
            }

            $scope.selectionChanged();
        }

        $scope.removeCategory = function() {
            $scope.categories = $scope.categories.filter(function(category){
                return category != $scope.selectedCat;
            });

            $scope.selectedCat = $scope.categories[0];

            $scope.selectionChanged();
        }

        $scope.moveCategory = function(up) {
            var catToMove = $scope.selectedCat;
            var src = $scope.categories.indexOf(catToMove);
            var dest = up ? src - 1 : src + 1;

            $scope.categories[src] = $scope.categories[dest];
            $scope.categories[dest] = catToMove;

            selectionChanged();
        }

        /* ## Sub Category ############################################################################### */

        $scope.removeSubCategory = function() {
            $scope.selectedCat.subcats = $scope.selectedCat.subcats.filter(function(sub){
                return sub != $scope.selectedSubCat;
            });

            $scope.selectionChanged();
        }

        $scope.addSubCategory = function() {
             var newCat = prompt('Sub Category to add:');
             if (newCat != '') {
                 var catObj = { name: newCat, items: [] };
                 $scope.selectedCat.subcats.push(catObj);
             }

             $scope.selectionChanged();
        }

        $scope.moveSubCategory = function(up) {
            var catToMove = $scope.selectedSubCat;
            var src = $scope.selectedCat.subcats.indexOf(catToMove);
            var dest = up ? src - 1 : src + 1;

            $scope.selectedCat.subcats[src] = $scope.selectedCat.subcats[dest];
            $scope.selectedCat.subcats[dest] = catToMove;

            $scope.selectionChanged();
        }
    }

})();