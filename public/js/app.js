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
      controller: 'DownloadsCtrl as ctrl'
    }).
    when('/search', {
      templateUrl: 'partials/search',
      controller: 'SearchCtrl as ctrl'
    }).
    otherwise({
      redirectTo: '/downloads'
    });

  $locationProvider.html5Mode(true);
});
