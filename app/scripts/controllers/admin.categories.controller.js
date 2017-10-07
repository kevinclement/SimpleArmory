/*globals prompt */
'use strict';

(function() {

    angular
        .module('simpleArmoryApp')
        .controller('AdminCategories', AdminCategories);

    function AdminCategories($scope, AdminService) {

        AdminService.getMountData().then(function(data){
            var col1 = [];
            for(var i=0; i < data.length; i++) {
                col1.push(data[i]);
            }

            // Generic interface to allow different types of column objects
            $scope.col1 = col1;
            $scope.selectedCol1 = $scope.col1[0];
            $scope.col1Children = function(col1item) {
                return col1item.subcats;
            }
            $scope.col2Children = function(col2item) {
                return col2item.items;
            }
            $scope.col3Label = function(col3item) {
                return col3item.icon;
            }

            // TODO: need add/delete as well
            // TODO: rename addCategory/removeCategory
            // TODO: fix move pointers to use something defined in scope here
            // TODO: rename buttons
            // TODO: either switch out here, or move out one layer and do this in admin controller

            $scope.selectionChanged(true);
        });

        $scope.selectionChanged = function(indexChanged) {
            var col1 = $scope.selectedCol1;
            var col2 = $scope.selectedCol2;
            var col3 = $scope.selectedCol3;

            if (col1 === null) {
                $scope.selectedCol1 = col1 = $scope.col1[0];
            }

            if (col2 === undefined || 
                $scope.col1Children(col1).indexOf(col2) === -1) {
                $scope.selectedCol2 = col2 =  $scope.col1Children(col1)[0];
            }

            if (col3 === undefined || 
                $scope.col2Children(col2).indexOf(col3) === -1) {
                $scope.selectedCol3 = col3 = $scope.col2Children(col2)[0];
            }

            // enable and disable up/down arrows if we're at the boundaries
            $scope.catUpDisabled = $scope.col1.indexOf(col1) === 0;
            $scope.catDownDisabled = $scope.col1.indexOf(col1) === $scope.col1.length - 1;

            $scope.subCatUpDisabled = $scope.col1Children(col1).indexOf(col2) === 0;
            $scope.subCatDownDisabled =  $scope.col1Children(col1).indexOf(col2) ===  $scope.col1Children(col1).length - 1;

            $scope.itemUpDisabled = $scope.col2Children(col2).indexOf(col3) === 0;
            $scope.itemDownDisabled = $scope.col2Children(col2).indexOf(col3) === $scope.col2Children(col2).length - 1;

            // if called from an index change, then don't mark it dirty
            if (!indexChanged) {
                $scope.$parent.canSave('mounts.json', $scope.col1);
            }
        };

        $scope.move = function(up, item, array) {
            var src = array.indexOf(item);
            var dest = up ? src - 1 : src + 1;

            array[src] = array[dest];
            array[dest] = item;

            $scope.selectionChanged();
        };

        /* ## Category ############################################################################### */

        $scope.addCategory = function() {
            var newCategory = prompt('Category to add:');
            if (newCategory !== '') {
                var catObj = { name: newCategory, subcats: [] };
                $scope.categories.push(catObj);
            }

            $scope.selectionChanged();
        };

        $scope.removeCategory = function() {
            $scope.categories = $scope.categories.filter(function(category){
                return category !== $scope.selectedCat;
            });

            $scope.selectionChanged();
        };

        /* ## Sub Category ############################################################################### */

        $scope.removeSubCategory = function() {
            $scope.selectedCat.subcats = $scope.selectedCat.subcats.filter(function(sub){
                return sub !== $scope.selectedSubCat;
            });

            $scope.selectionChanged();
        };

        $scope.addSubCategory = function() {
             var newCat = prompt('Sub Category to add:');
             if (newCat !== null && newCat !== '') {
                 var catObj = { name: newCat, items: [] };
                 $scope.selectedCat.subcats.push(catObj);

                 $scope.selectionChanged();
             }
        };
    }

})();