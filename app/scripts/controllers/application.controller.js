'use strict';

(function() {

    angular
        .module('simpleArmoryApp')
        .controller('ApplicationCtrl' , ApplicationCtrl);

    function ApplicationCtrl($scope, LoginService, $location, $filter) {

        // default to not logged in
        $scope.isLoggedIn = false;

        // Listen for path changed and then parse and fetch the character
        $scope.$on('$locationChangeSuccess', function(){
            // If there was an error we need to reset everything
            if ($location.$$path === '/error') {
                $scope.character = null;
                $scope.isLoggedIn = false;
            } else if ($location.$$path !== '' && $location.$$path !== '/') {
                // "us/proudmoore/marko"
                // [0]: us/proudmoore/marko
                // [1]: spirestone
                // [2]: marko
                // [3]: location part
                var rgr = new RegExp('([^\/]+)/([^\/]+)/([^\/]+)/?([^\/]+)?').exec($location.$$path);
                rgr = rgr ? rgr : {};

                LoginService.getCharacter({'region': rgr[1], 'realm':rgr[2], 'character':rgr[3]})
                    .then(function(character) {
                        $scope.character = character[0];
                        $scope.isLoggedIn = true;
                });
            }
        });  

        // Helper function for percentage numbers.  Used in a lot of screens
        $scope.percent = function(n, d) {

            return $filter('number')(((n / d) * 100), 0);
        };

        $scope.achFormater = function(n, d) {
            if (!n || !d) {
                return "";
            }
            
            return '' + n + ' / ' + d + ' (' + $scope.percent(n, d) + '%)';
        };

        // Helper to get the image id off an item
        $scope.getImageSrc = function(item) {
            if (item.collected) {
                // wowhead img
                return 'http://wow.zamimg.com/images/wow/icons/medium/' + item.icon.toLowerCase() + '.jpg';
            } else {
                // 1x1 gif   
                return 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';
            }
        };
  }

})();