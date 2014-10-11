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
      when('/', {
        templateUrl: 'partials/login.html',
        controller: 'LoginCtrl'
      }).
      when('/:region/:realm/:character', {
        templateUrl: 'partials/overview.html',
        controller: 'OverviewCtrl'
      }).
      when('/error', {
        templateUrl: 'partials/error.html',
        controller: 'ErrorCtrl'
      }).      
      otherwise({
        redirectTo: '/'
      });
  }]);
