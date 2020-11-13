/*jslint bitwise: true */
'use strict';

(function() {

    angular
        .module('simpleArmoryApp')
        .controller('ApplicationCtrl' , ApplicationCtrl);

    function ApplicationCtrl($scope, $window, LoginService, $location, $filter, KeyboardService, KonamiService) {

        // default to not logged in
        $scope.isLoggedIn = false;

        var darkTheme = localStorage.getItem('darkTheme');
        if (darkTheme) {
            $scope.isUsingDarkTheme = darkTheme === 'true';
        } else {
            $scope.isUsingDarkTheme = $window.matchMedia ?
                $window.matchMedia('(prefers-color-scheme: dark)').matches : false;
        }

        // Listen for path changed and then parse and fetch the character
        $scope.$on('$locationChangeSuccess', function(){
            // If there was an error we need to reset everything
            if ($location.$$path.lastIndexOf('/error', 0) === 0 ) {
                $scope.character = null;
                $scope.isLoggedIn = false;
            } else if ($location.$$path === '/login') {
                // Leave current character logged in, just force the login controller execute
                $location.url('/');
            } else if ($location.$$path !== '' && $location.$$path !== '/' && !$location.$$path.startsWith('/admin')) {
                // "us/proudmoore/marko"
                // [0]: us/proudmoore/marko
                // [1]: proudmoore
                // [2]: marko
                // [3]: location part
                var rgr = new RegExp('([^\/]+)/([^\/]+)/([^\/]+)/?([^\/]+)?').exec($location.$$path);
                rgr = rgr ? rgr : {};

                LoginService.getProfile({'region': rgr[1], 'realm':rgr[2], 'character':rgr[3]})
                    .then(function(character) {
                        $scope.character = character;
                        $scope.region = rgr[1];
                        $scope.realm = rgr[2];
                        $scope.isLoggedIn = true;

                    // fetch the profile image for the header as a seperate call as to not block initial render
                    LoginService.getProfileMedia({'region': rgr[1], 'realm':rgr[2], 'character':rgr[3]}).then(function(pMedia) {
                        var avatarFallback = '?alt=/shadow/avatar/1-1.jpg';
                        if(pMedia.data.avatar_url) {
                            $scope.characterMedia = pMedia.data.avatar_url + avatarFallback;
                        } else {
                            $scope.characterMedia = pMedia.data.assets[0].value + avatarFallback;
                        }
                    });
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

        $scope.updateTheme = function() {
            $scope.isUsingDarkTheme = localStorage.getItem('darkTheme') === 'true';
        };

        // Helper to get the image id off an item
        $scope.getImageSrc = function(item, renderIcon) {

            renderIcon = renderIcon || item.collected;
            if (renderIcon) {
                // wowhead img
                return '//wow.zamimg.com/images/wow/icons/medium/' + item.icon.toLowerCase() + '.jpg';
            } else {
                // 1x1 gif
                return 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';
            }
        };

        $scope.createSimpleGuid = function() {
            return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1) +
                   (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
        };

        $scope.qualityToBackground = function(item) {
            var bgColor = '#fff';

            switch(item.quality) {
                case 'poor':
                    bgColor = '#7F7F7F';
                    break;
                case 'common':
                    bgColor = '#F0F0F0';
                    break;
                case 'uncommon':
                    bgColor = '#22B14C';
                    break;
                case 'rare':
                    bgColor = '#3F48CC';
                    break;
            }

            return 'background:' + bgColor;
        };
  }

})();
