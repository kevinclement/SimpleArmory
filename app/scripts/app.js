'use strict';
  
(function() {
    angular
        .module('simpleArmoryApp', [
            'ngRoute',
            'ngSanitize',
            'ui.bootstrap',
            'ui.select'])
        .config(config);

    function config($routeProvider, $compileProvider) {

        // allow me to download json for admin site
        $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|data|chrome-extension):/);

        $routeProvider.
            when('/admin/:area/:section?/:subsection?', {
              templateUrl: 'views/admin.html',
              controller: 'AdminCtrl'
            }).
            when('/admin', {
              // so I dont have to type it all out, default admin route is here
              redirectTo: '/admin/categories/achievements/quests'
            }).
            when('/error/:realm/:character', {
              templateUrl: 'views/error.html',
              controller: 'ErrorCtrl'
            }).
            when('/:region/:realm/:character/settings', {
              templateUrl: 'views/settings.html',
              controller: 'SettingsCtrl'
            }).
            when('/:region/:realm/:character/achievements/:category', {
              templateUrl: 'views/achievements.html',
              controller: 'AchievementsCtrl'
            }).  
            when('/:region/:realm/:character/collectable/battlepets', {
              templateUrl: 'views/battlePets.html',
              controller: 'BattlePetsCtrl'
            }).  
            when('/:region/:realm/:character/calendar', {
              templateUrl: 'views/calendar.html',
              controller: 'CalendarCtrl'
            }).  
            when('/:region/:realm/:character/collectable/companions', {
              templateUrl: 'views/companions.html',
              controller: 'CompanionsCtrl'
            }). 
            when('/:region/:realm/:character/collectable/mounts', {
              templateUrl: 'views/mounts.html',
              controller: 'MountsCtrl'
            }).  
            when('/:region/:realm/:character/collectable/toys', {
              templateUrl: 'views/toys.html',
              controller: 'ToysCtrl'
            }).
            when('/:region/:realm/:character', {
              templateUrl: 'views/overview.html',
              controller: 'OverviewCtrl'
            }).      
            when('/:region/:realm/:character/reputation', {
              templateUrl: 'views/reputation.html',
              controller: 'ReputationCtrl'
            }).
            when('/', {
              templateUrl: 'views/login.html',
              controller: 'LoginCtrl'
            }).
            when('/login', {
              templateUrl: 'views/login.html',
              controller: 'LoginCtrl'
            }).
            otherwise({
              redirectTo: '/login'
            });
      }
})();

