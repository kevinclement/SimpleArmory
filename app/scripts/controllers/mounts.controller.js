/*globals $WowheadPower */
'use strict';

(function() {
    
    angular
        .module('simpleArmoryApp')
        .controller('MountsCtrl' , MountsCtrl);

    function MountsCtrl($scope, MountsAndPetsService, $window) {

    	// Analytics for page
        $window.ga('send', 'pageview', 'Mounts');

        MountsAndPetsService.getItems('mounts', 'mounts', 'spellId').then(function(items){
            $scope.items = items;

            $scope.isCollected = function (id) {
                return items.lookup[id] !== undefined;
            };

            $scope.planner = 
            [
                {step:'Start off in Stormwind/Orgrimmar'},
                {step:'Portal to Uldum'},
                {step:'Run Vortex Pinnacle', boss:'Altarius', spellId:88472, itemId:63040, notes:'You can run heroic once and 9 normal'},
                {step:'Run Throne of the Four Winds', boss:'Al\'akir', spellId:88744, itemId:63041},
            ];

            // TODO: what is the best way to do this??

            // refresh the wow links so they are stylized and iconized
            //if ($WowheadPower && $scope.showPlanner) {
                //window.setTimeout(function() {
                //    wowhead_tooltips = { "colorlinks": true, "iconizelinks": true, "renamelinks": true };
                //    $WowheadPower.refreshLinks();
                //}, 0);
            //}
        });       
    }

})();