/*globals prompt */
'use strict';

(function() {

    angular
        .module('simpleArmoryApp')
        .controller('AdminMountsCategories', AdminMountsCategories);

    function AdminMountsCategories($scope, AdminService) {

        AdminService.getMountData().then(function(data){
            // store the data in the scope so that we can build out forms from it
            var categories = [];
            for(var i=0; i<data.length; i++) {
                categories.push(data[i]);
            }

            $scope.categories = categories;
            $scope.selectedCat = $scope.categories[0];

            $scope.selectionChanged(true);
        });

        $scope.selectionChanged = function(indexChanged) {
            var cat =  $scope.selectedCat;
            var subcat = $scope.selectedSubCat;
            var item = $scope.selectedItem;

            // reset any selected indexes if we've done modifications
            if (cat === null) {
                $scope.selectedCat = cat = $scope.categories[0];
            }

            if (subcat === undefined || 
                cat.subcats.indexOf(subcat) === -1) {
                $scope.selectedSubCat = subcat = cat.subcats[0];
            }

            if (item === undefined || 
                subcat.items.indexOf(item) === -1) {
                $scope.selectedItem = item = subcat.items[0];
            }

            // enable and disable up/down arrows it we're at the boundaries
            $scope.catUpDisabled = $scope.categories.indexOf(cat) === 0;
            $scope.catDownDisabled = $scope.categories.indexOf(cat) === $scope.categories.length - 1;

            $scope.subCatUpDisabled = cat.subcats.indexOf(subcat) === 0;
            $scope.subCatDownDisabled = cat.subcats.indexOf(subcat) === cat.subcats.length - 1;

            $scope.itemUpDisabled = subcat.items.indexOf(item) === 0;
            $scope.itemDownDisabled = subcat.items.indexOf(item) === subcat.items.length - 1;

            // if called from an index change, then don't mark it dirty
            if (!indexChanged) {
                $scope.$parent.canSave('mounts.json', $scope.categories);
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