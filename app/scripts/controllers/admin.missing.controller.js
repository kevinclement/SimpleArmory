/*globals $WowheadPower */
'use strict';

(function() {

    angular
        .module('simpleArmoryApp')
        .controller('AdminMissing', AdminMissing);

    function AdminMissing($scope, AdminService, SettingsService) {
        $scope.settings = SettingsService;

        // TODO: might not need customization here
        $scope.col1Title = "Missing";
        $scope.col2Title = "Categories";

        // TODO: take mount specific shit out of it
        // TODO: rename to missing in controller and html
        // TODO: will need to add ids to achievement categories
        // TODO: fix route to including missing

        // TODO: have support for both mount and achievements
        if ($scope.section === 'mounts') {
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
        } else if ($scope.section === 'achievements') {
            AdminService.getAchievementData().then(function(data){

                $scope.categories = [];
                for (var i=0; i < data.supercats.length; i++) {
                    var supercat = data.supercats[i];
                    for (var j in supercat.cats) {
                         var cat = supercat.cats[j];
                         for (var k in cat.subcats) {
                            var subcat = cat.subcats[k];

                            $scope.categories.push({ label: supercat.name + '\\' + cat.name + '\\' + subcat.name });
                         }
                     }
                }

                $scope.categorySelected = $scope.categories[0];
                $scope.supercats = data.supercats;
            });

            // TMP
            $scope.missing = [
                { 'id': '4476', 'icon': 'Achievement_Arena_2v2_3' },
                { 'id': '4477', 'icon': 'Achievement_Arena_3v3_4' },
                { 'id': '4476', 'icon': 'Achievement_Arena_2v2_3' },
                { 'id': '4477', 'icon': 'Achievement_Arena_3v3_4' },{ 'id': '4476', 'icon': 'Achievement_Arena_2v2_3' },
                { 'id': '4477', 'icon': 'Achievement_Arena_3v3_4' },{ 'id': '4476', 'icon': 'Achievement_Arena_2v2_3' },
                { 'id': '4477', 'icon': 'Achievement_Arena_3v3_4' },{ 'id': '4476', 'icon': 'Achievement_Arena_2v2_3' },
                { 'id': '4477', 'icon': 'Achievement_Arena_3v3_4' },{ 'id': '4476', 'icon': 'Achievement_Arena_2v2_3' },
                { 'id': '4477', 'icon': 'Achievement_Arena_3v3_4' },{ 'id': '4476', 'icon': 'Achievement_Arena_2v2_3' },
                { 'id': '4477', 'icon': 'Achievement_Arena_3v3_4' },{ 'id': '4476', 'icon': 'Achievement_Arena_2v2_3' },
                { 'id': '4477', 'icon': 'Achievement_Arena_3v3_4' },{ 'id': '4476', 'icon': 'Achievement_Arena_2v2_3' },
                { 'id': '4477', 'icon': 'Achievement_Arena_3v3_4' },{ 'id': '4476', 'icon': 'Achievement_Arena_2v2_3' },
                { 'id': '4477', 'icon': 'Achievement_Arena_3v3_4' },{ 'id': '4476', 'icon': 'Achievement_Arena_2v2_3' },
                { 'id': '4477', 'icon': 'Achievement_Arena_3v3_4' },
                { 'id': '4478', 'icon': 'Achievement_Arena_5v5_3' }
            ]

        }

        $scope.getImageSrc = function(item) {
            return '//wow.zamimg.com/images/wow/icons/medium/' + item.icon.toLowerCase() + '.jpg';
        };

        $scope.clicked = function(event, item) {
            event.preventDefault();
            $WowheadPower.hideTooltip();

            if (item.selected !== true) {
                $(event.currentTarget).addClass('missingItemSelected');
                item.selected = true;
            } else {
                $(event.currentTarget).removeClass('missingItemSelected');
                item.selected = false;
            }
        };

        // TODO: cleanup
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
                    return item.itemId !== draggedItem.itemId;
                }
                else {
                    return item.spellid !== draggedItem.spellid;
                }
            });

            // enable the save button
            $scope.$parent.canSave('mounts', $scope.categories);
        };

        $scope.getLink  = function(item) {
            var link = 'spell='+item.spellId;

            if (item.id) {
                link = 'achievement='+item.id;
            } else if (item.itemId) {
                link = 'item='+item.itemId;
            }

            return link;
        };
    }
})();