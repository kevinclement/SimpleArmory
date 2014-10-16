'use strict';

/**
 * @ngdoc overview
 * @name simpleArmoryApp
 * @description
 * # simpleArmoryApp
 *
 * Main module of the application.
 */
angular
  .module('simpleArmoryApp', [
    'ngRoute'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .when('/about', {
        templateUrl: 'views/about.html',
        controller: 'AboutCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
