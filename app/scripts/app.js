'use strict';

/**
 * @ngdoc overview
 * @name simpleArmoryApp
 * @description
 * # simpleArmoryApp
 *
 * Main module of the application.
 */
var simpleArmoryApp = angular.module('simpleArmoryApp', [
  'ngRoute',
  'simpleArmoryServices',
  'ui.bootstrap'
]);

simpleArmoryApp.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
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
      when('/error', {
        templateUrl: 'views/error.html',
        controller: 'ErrorCtrl'
      }).      
      otherwise({
        redirectTo: '/'
      });
  }]);
