/*globals prompt */
'use strict';

(function() {

    angular
        .module('simpleArmoryApp')
        .controller('AdminAchievementCategories', AdminAchievementCategories);

    function AdminAchievementCategories($scope, AdminService, SettingsService) {

        $scope.settings = SettingsService;
        
        // get data based on which section is selected
        var categories = [];
        AdminService.getAchievementData().then(function(data){
            for(var i=0; i < data.supercats.length; i++) {
                if (data.supercats[i].name === "Quests") {
                    for(var j=0; j < data.supercats[i].cats.length; j++) {
                        // data.supercats is array with super cats
                        // data[0].cats are the categories
                        // data[0].cats[0].zones are the subcats
                        // data[0].cats[0].zones[0].achs are the items

                        categories.push(data.supercats[i].cats[j]);
                    }
                }
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
                cat.zones.indexOf(subcat) === -1) {
                $scope.selectedSubCat = subcat = cat.zones[0];
            }

            if (item === undefined || 
                subcat.achs.indexOf(item) === -1) {
                $scope.selectedItem = item = subcat.achs[0];
            }

            // enable and disable up/down arrows it we're at the boundaries
            $scope.catUpDisabled = $scope.categories.indexOf(cat) === 0;
            $scope.catDownDisabled = $scope.categories.indexOf(cat) === $scope.categories.length - 1;

            $scope.subCatUpDisabled = cat.zones.indexOf(subcat) === 0;
            $scope.subCatDownDisabled = cat.zones.indexOf(subcat) === cat.zones.length - 1;

            $scope.itemUpDisabled = subcat.achs.indexOf(item) === 0;
            $scope.itemDownDisabled = subcat.achs.indexOf(item) === subcat.achs.length - 1;

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
                var catObj = { name: newCategory, zones: [] };
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
            $scope.selectedCat.zones = $scope.selectedCat.zones.filter(function(sub){
                return sub !== $scope.selectedSubCat;
            });

            $scope.selectionChanged();
        };

        $scope.addSubCategory = function() {
             var newCat = prompt('Sub Category to add:');
             if (newCat !== null && newCat !== '') {
                 var catObj = { name: newCat, achs: [] };
                 $scope.selectedCat.zones.push(catObj);

                 $scope.selectionChanged();
             }
        };
    }

})();