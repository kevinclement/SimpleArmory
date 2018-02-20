/* jshint esnext:true */
/*globals $WowheadPower */
'use strict';

(function() {

    angular
        .module('simpleArmoryApp')
        .controller('AdminMissing', AdminMissing);

    function AdminMissing($scope, AdminService, SettingsService) {
        $scope.settings = SettingsService;

        // TODO: might not need customization here
        $scope.col1Title = 'Missing';
        $scope.col2Title = 'Categories';
        $scope.moveDisabled = true;

        // TODO: take mount specific shit out of it
        // TODO: will need to add ids to achievement categories

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

                            $scope.categories.push({ label: supercat.name + '\\' + cat.name + '\\' + subcat.name, subcat:subcat });
                         }
                     }
                }

                $scope.categorySelected = $scope.categories[0];
                $scope.data = data;

                $scope.createItem = function(ach) {

                    var myItem = {
                        'id': ach.id,
                        'icon': ach.icon,
                        'points': ach.points
                    };

                    var side = getFactionSymbol(ach.id, ach.factionId);
                    if (side !== '') {
                        myItem.side = side;
                    }

                    // only add criteria if we translated from wowhead
                    if (ach.criteria) {
                        myItem.criteria = ach.criteria;
                    }

                    return myItem;
                };
            });

            AdminService.getMissingAchievements().then(function(data){
                $scope.missing = data;
            });
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

            $scope.moveDisabled = $scope.missing.filter(item => item.selected === true).length === 0;
        };

        $scope.move = function() {

            $scope.missing.filter(item => item.selected === true).forEach(function(item) {
                console.log('adding ' + item.id + ' to ' + $scope.categorySelected.subcat.name);

                var itemToSave = $scope.createItem(item);
                $scope.categorySelected.subcat.items.push(itemToSave);
    
                // remove from scope
                $scope.missing = $scope.missing.filter(function(missing) {
                    if (item.id) {
                        return item.id !== missing.id;
                    }
                    else {
                        return item.spellid !== missing.spellid;
                    }
                });

                //         // TODO: turn back on when I have time, hurt my brain
                //         // notify(item.id, $scope.categorySelected.subcat.name);
            });

            $scope.$parent.canSave($scope.section, $scope.data);
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

        function notify(name, category) {

            // show the info alert, and hide after 2s
            $scope.notifyIn = true;
            $scope.notifyOut = false;
            $scope.notify = {
                'name': name,
                'subcat': category
            };
            window.setTimeout(function() {
                $scope.$apply(function () {
                    $scope.notifyIn = false;
                    $scope.notifyOut = true;
                });
            }, 2100);
        }

        function getFactionSymbol(id, factionId) {
            // 0 is alliance
            // 1 is horde
            // 2 is anyone
            if (factionId === 0) {
                return 'A';
            }
            else if (factionId === 1) { 
                return 'H';
            }
            else if (factionId === 2) {
                return '';
            }
            else {
                console.log('UNKNOWN FACTION: ' + factionId + ' for ' + id);
            }
        }
    }
})();