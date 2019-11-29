'use strict';

(function() {

    angular
        .module('simpleArmoryApp')
        .controller('HeaderCtrl' , HeaderCtrl);

    function HeaderCtrl($scope, $location) {

        $scope.isCollapsed = true;

        $scope.getUrl = function(subSite) {
            var url = '#' + getBaseUrl($scope.character);
            if (subSite !== '') {
                url += '/' + subSite;
            }

            return url;
        };

        $scope.toggleDarkTheme = function() {
            var isUsingDarkTheme = localStorage.getItem('darkTheme') == 'true';
            if(isUsingDarkTheme) {
                localStorage.setItem('darkTheme', 'false');
            } else {
                localStorage.setItem('darkTheme', 'true');
            }
            $scope.$parent.updateTheme();
        };

        $scope.isActive = function (viewLocation, subMenu) {

            // if its a submenu search, then just look for the location in the url
            // and call it good
            if (subMenu) {
                return $location.path().indexOf(viewLocation) > 0;
            }

            // otherwise, lets try to match it directly
            var combinedUrl = getBaseUrl($scope.character);
            if (viewLocation !== '') {
                combinedUrl += '/' + viewLocation;
            }

            return $location.path() === combinedUrl;
        };

        $scope.guildName = function() {
            if ($scope.character && $scope.character.guild) {
                return '<' + $scope.character.guild.name + '>';
            }

            return '';
        };

        $scope.imgUrl = function() {
            if ($scope.character) {
                var c = $scope.character;
                return window.location.protocol + '//render-' + c.region + '.worldofwarcraft.com/character/' + c.thumbnail;
            }

            return '';
        };

        $scope.armoryUrl = function() {
            if ($scope.character) {
                var c = $scope.character;
                return window.location.protocol + '//' +
                    'worldofwarcraft.com/character/' + c.region + '/' + $scope.$parent.realm + '/' + c.name.toLowerCase();
            }

            return '#';
        };

        function getBaseUrl(character) {
            if (!character) {
                return '';
            }

            return '/' + character.region.toLowerCase() + '/' +
                   character.realm.toLowerCase()  + '/' +
                   character.name.toLowerCase();
        }
    }

})();
