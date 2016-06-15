'use strict';

(function() {

    angular
        .module('simpleArmoryApp')
        .controller('ApplicationCtrl' , ApplicationCtrl);

    function ApplicationCtrl($scope, LoginService, $location, $filter, KeyboardService, KonamiService) {

        // default to not logged in
        $scope.isLoggedIn = false;

        // Listen for path changed and then parse and fetch the character
        $scope.$on('$locationChangeSuccess', function(){
            // If there was an error we need to reset everything
            if ($location.$$path.lastIndexOf('/error', 0) === 0 ) {
                $scope.character = null;
                $scope.isLoggedIn = false;
            } else if ($location.$$path === '/login') {
                // Leave current character logged in, just force the login controller execute
                $location.url('/');
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
                        $scope.character = character;
                        $scope.isLoggedIn = true;
                });
            }
        });

        // hookup global hotkeys
        KeyboardService.init(KonamiService.trigger);

        // Helper function for percentage numbers.  Used in a lot of screens
        $scope.percent = function(n, d) {

            return $filter('number')(((n / d) * 100), 0);
        };

        $scope.achFormater = function(n, d) {
            if (!n || !d) {
                return '';
            }

            var perc = $scope.percent(n, d);

            // if the percentage is low enough, don't print the numbers, just use the percentage
            if (perc < 18) {
                return perc + '%';
            }

            return '' + n + ' / ' + d + ' (' + perc + '%)';
        };

        // Helper to get the image id off an item
        $scope.getImageSrc = function(item) {
            if (item.collected) {
                // wowhead img
                return '//wow.zamimg.com/images/wow/icons/medium/' + item.icon.toLowerCase() + '.jpg';
            } else {
                // 1x1 gif   
                return 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';
            }
        };
  }

})();