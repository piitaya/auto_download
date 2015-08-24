'use strict';

angular.module('myApp', [
  'ngRoute',
  'ngMaterial',
  'myApp.controllers',
  'myApp.filters',
  'myApp.services',
  'myApp.directives'
])
.config(function ($routeProvider, $locationProvider) {
  $routeProvider.
    when('/downloads', {
      templateUrl: 'partials/downloads',
      controller: 'DownloadsCtrl'
    }).
    when('/search', {
      templateUrl: 'partials/search',
      controller: 'SearchCtrl'
    }).
    otherwise({
      redirectTo: '/downloads'
    });

  $locationProvider.html5Mode(true);
});
