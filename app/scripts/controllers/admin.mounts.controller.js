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

        $scope.dragDone = function(dropItem) {

            // save to category
            
            // TODO: im tired, fix this
            //$scope.categories[dropItem].items.push(draggedItem);

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

        // TODO: tag cats and subcats with guids
        function createSimpleGuid() {
            return (((1+Math.random())*0x10000)|0).toString(16).substring(1) + (((1+Math.random())*0x10000)|0).toString(16).substring(1); 
        }

        console.log(createSimpleGuid());
    }
})();