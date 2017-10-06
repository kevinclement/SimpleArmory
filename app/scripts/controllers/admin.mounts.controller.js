'use strict';

(function() {

    angular
        .module('simpleArmoryApp')
        .controller('AdminMounts', AdminMounts);

    function AdminMounts($scope, AdminService, SettingsService) {
        $scope.settings = SettingsService;

        AdminService.getMountData().then(function(data){
            var categories = [];

            for(var i=0; i<data.length; i++) {
                var cat = data[i];

                categories.push(cat);
            }

            $scope.categories = categories;
        });

        AdminService.getMissingMounts().then(function(data){
            $scope.missing = data;
        });

        var draggedItem;
        $scope.dragStart = function(dragItem) {
            // hide any wowhead tooltips since they get in the way when dragging
            $WowheadPower.hideTooltip();

            draggedItem = dragItem;
        }

        $scope.dragDone = function(subcatId) {

            // find drop target obj
            var subCatObj;
            for (var i=0; i<$scope.categories.length; i++) {
                var cat = $scope.categories[i];
                for (var k2 in cat.subcats) {
                    var subcat = cat.subcats[k2];
                    if (subcat.id === subcatId) {
                        subCatObj = subcat;
                    }
                }
            }

            // show the info alert, and hide after 2s
            $scope.notifyIn = true;
            $scope.notifyOut = false;
            $scope.notify = {
                'name': draggedItem.name,
                'subcat': subCatObj.name
            };
            window.setTimeout(function() {
                $scope.$apply(function () {
                    $scope.notifyIn = false;
                    $scope.notifyOut = true;
                });
            }, 2100);

            // save to category (minus the name)
            delete draggedItem['name'];
            subCatObj.items.push(draggedItem);

            // remove from scope
            $scope.missing = $scope.missing.filter(function(item) {
                if (draggedItem.itemId) {
                    return item.itemId != draggedItem.itemId
                }
                else {
                    return item.spellid != draggedItem.spellid;
                }
            });

            // enable the save button
            $scope.$parent.canSave('mounts.json', $scope.categories);
        }

        $scope.getLink  = function(item) {
            var link = 'spell='+item.spellId;
            if (item.itemId) {
                link = 'item='+item.itemId;
            }

            return link;
        }

        // used to fix mounts with ids 
        // function createSimpleGuid() {
        //     return (((1+Math.random())*0x10000)|0).toString(16).substring(1) + (((1+Math.random())*0x10000)|0).toString(16).substring(1); 
        // }
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