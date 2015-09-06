'use strict';

angular.module('myApp.controllers', []);

angular.module('myApp.controllers')
.controller('AppCtrl', ['$scope', '$http', '$timeout', '$mdSidenav', '$mdUtil', function ($scope, $http, $timeout, $mdSidenav, $mdUtil) {
	$scope.toggleSideNav = buildToggler();
  function buildToggler() {
    var debounceFn =  $mdUtil.debounce(function(){
          $mdSidenav('navbar')
            .toggle();
        },100);
    return debounceFn;
  }
}])
.controller('SideNavCtrl', ['$scope', '$mdSidenav', '$location', function ($scope, $mdSidenav, $location) {
  $scope.links = [
    { name: 'Search', icon: 'mdi-magnify', href: '/search' },
    { name: 'Downloads', icon: 'mdi-download', href: '/downloads' },
  ];

  $scope.navigateTo = function(to, event) {
    $location.path(to);
    $scope.close();
  };

  $scope.close = function () {
    $mdSidenav('navbar').close();
  };
}]);