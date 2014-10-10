'use strict';

/* App Module */
var simpleArmoryApp = angular.module('simpleArmoryApp', [
  'ngRoute',
  'simpleArmoryControllers',
  'simpleArmoryFilters',
  'simpleArmoryServices',
  'ui.bootstrap'
]);


/*

simpleArmoryApp.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/phones', {
        templateUrl: 'partials/phone-list.html',
        controller: 'PhoneListCtrl'
      }).
      when('/phones/:phoneId', {
        templateUrl: 'partials/phone-detail.html',
        controller: 'PhoneDetailCtrl'
      }).
      otherwise({
        redirectTo: '/phones'
      });
  }]);
*/