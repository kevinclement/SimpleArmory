/*globals prompt */
'use strict';

(function() {

    angular
        .module('simpleArmoryApp')
        .controller('AdminCategories', AdminCategories);

    function AdminCategories($scope, AdminService, SettingsService) {

        // TODO: using the same one now.  if when done with all this, its the only one left, can remove code to enable thi
        $scope.col1Title = 'Category';
        $scope.col1child = 'subcats';
        $scope.col2Title = 'Sub Category';
        $scope.col1Factory = function(newCol1) {
            return { name: newCol1, subcats: [], id: $scope.createSimpleGuid().toString() };
        };
        $scope.col2Factory = function(newCol2) {
            return { name: newCol2, items: [], id: $scope.createSimpleGuid().toString() };
        };
        $scope.col3child = 'items';

        $scope.settings = SettingsService;
        if ($scope.section === 'mounts') {
            AdminService.getMountData().then(function(data){

                $scope.saveFile = 'mounts';
                $scope.col1items = data;
                $scope.saveData = data;

                $scope.col3Title = 'Mount';
                $scope.col3Label = function(col3item) {
                    if (col3item.itemId !== null) {
                        return col3item.itemId;
                    }
                    else {
                        return col3item.spellid;
                    }
                };
                $scope.col3Link = function(col3item) {
                    if (col3item.itemId !== null) {
                        return 'item=' + col3item.itemId;
                    }
                    else {
                        return 'spell=' + col3item.spellid;
                    }
                };

                $scope.selectionChanged(true);
            });
        } else if ($scope.section === 'achievements') {
            AdminService.getAchievementData().then(function(data){
                var categories = [];
                for(var i=0; i < data.supercats.length; i++) {
                    if (data.supercats[i].name.toLowerCase() === $scope.subsection) {
                        for(var j=0; j < data.supercats[i].cats.length; j++) {  
                            categories.push(data.supercats[i].cats[j]);
                        }
                    }
                }

                $scope.saveFile = 'achievements';
                $scope.saveData = data;
                $scope.col1items = categories;

                $scope.col3Title = 'Achievement';
                $scope.col3Label = function(col3item) {
                    return col3item.id;
                };
                $scope.col3Link = function(col3item) {
                    return 'achievement=' + col3item.id;
                };

                $scope.selectionChanged(true);
            });
        }

        $scope.selectionChanged = function(indexChanged) {

            if ($scope.col1selected === undefined) {
                $scope.col1selected = $scope.col1items[0];
            }

            $scope.col2items = $scope.col1selected[$scope.col1child];
            if ($scope.col2selected === undefined || 
                $scope.col2items.indexOf($scope.col2selected) === -1) {
                $scope.col2selected = $scope.col2items[0];
            }

            $scope.col3items = $scope.col2selected[$scope.col3child];
            if ($scope.col3selected === undefined || 
                $scope.col3items.indexOf($scope.col3selected) === -1) {
                $scope.col3selected = $scope.col3items[0];
            }

            // enable and disable up/down arrows if we're at the boundaries
            $scope.col1UpDisabled = $scope.col1items.indexOf($scope.col1selected) === 0;
            $scope.col1DownDisabled = $scope.col1items.indexOf($scope.col1selected) === $scope.col1items.length - 1;

            $scope.col2UpDisabled = $scope.col2items.indexOf($scope.col2selected) === 0;
            $scope.col2DownDisabled =  $scope.col2items.indexOf($scope.col2selected) === $scope.col2items.length - 1;

            $scope.col3UpDisabled = $scope.col3items.indexOf($scope.col3selected) === 0;
            $scope.col3DownDisabled = $scope.col3items.indexOf($scope.col3selected) === $scope.col3items.length - 1;

            // if called from an index change, then don't mark it dirty
            if (!indexChanged) {
                $scope.$parent.canSave($scope.saveFile, $scope.saveData);
            }
        };

        $scope.move = function(up, item, parent) {
            var array = parent[$scope.col1child] ? parent[$scope.col1child] : parent[$scope.col3child];

            var src = array.indexOf(item);
            var dest = up ? src - 1 : src + 1;

            array[src] = array[dest];
            array[dest] = item;

            $scope.selectionChanged();
        };

        $scope.add = function(colArray, label, factory) {
            var newItem = prompt(label + ' to add:');
            if (newItem !== null && newItem !== '') {
                var newObj = factory(newItem);
                colArray.push(newObj);

                $scope.selectionChanged();
            }
        };

        $scope.removeCol1 = function() {
            $scope.col1items = $scope.col1items.filter(function(item){
                return item !== $scope.col1selected;
            });
            $scope.col1selected = $scope.col1items[0];
            
            $scope.selectionChanged();
        };

        $scope.removeCol2 = function() {
            $scope.col1selected[$scope.col1child] = $scope.col1selected[$scope.col1child].filter(function(item){
                return item !== $scope.col2selected;
            });

            $scope.selectionChanged();
        };

        // used to fix mount categories with ids 
        // var tmpCats = $scope.categories;
        // for (var i=0; i<tmpCats.length; i++) {
        //     var cat = tmpCats[i];
        //     cat.id = '' + createSimpleGuid() + '';
        //     for (var k2 in cat.subcats) {
        //         var subcat = cat.subcats[k2];
        //         subcat.id = '' + createSimpleGuid() + '';
        //         console.log(subcat.name);
        //     }
        // }
    }

})();