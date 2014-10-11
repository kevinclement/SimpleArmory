'use strict';

/* App Module */
var simpleArmoryApp = angular.module('simpleArmoryApp', [
  'ngRoute',
  'simpleArmoryControllers',
  'simpleArmoryFilters',
  'simpleArmoryServices',
  'ui.bootstrap'
]);

simpleArmoryApp.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/:region/:realm/:character/achievements/:category', {
        templateUrl: 'partials/achievements.html',
        controller: 'AchievementsCtrl'
      }).  
      when('/:region/:realm/:character/collectable/battlepets', {
        templateUrl: 'partials/battlePets.html',
        controller: 'BattlePetsCtrl'
      }).  
      when('/:region/:realm/:character/calendar', {
        templateUrl: 'partials/calendar.html',
        controller: 'CalendarCtrl'
      }).  
      when('/:region/:realm/:character/collectable/companions', {
        templateUrl: 'partials/companions.html',
        controller: 'CompanionsCtrl'
      }). 
      when('/:region/:realm/:character/collectable/mounts', {
        templateUrl: 'partials/mounts.html',
        controller: 'MountsCtrl'
      }).        
      when('/:region/:realm/:character', {
        templateUrl: 'partials/overview.html',
        controller: 'OverviewCtrl'
      }).      
      when('/:region/:realm/:character/reputation', {
        templateUrl: 'partials/reputation.html',
        controller: 'ReputationCtrl'
      }).          
      when('/', {
        templateUrl: 'partials/login.html',
        controller: 'LoginCtrl'
      }).
      when('/error', {
        templateUrl: 'partials/error.html',
        controller: 'ErrorCtrl'
      }).      
      otherwise({
        redirectTo: '/'
      });
  }]);
