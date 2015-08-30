'use strict';

angular.module('myApp.controllers', []);

angular.module('myApp.controllers')
.controller('AppCtrl', ['$scope', '$http','$timeout', '$mdSidenav', '$mdUtil', function ($scope, $http, $timeout, $mdSidenav, $mdUtil) {
	$scope.toggleSideNav = buildToggler('left');

    function buildToggler(navID) {
      var debounceFn =  $mdUtil.debounce(function(){
            $mdSidenav(navID)
              .toggle()
              .then(function () {
                console.log("toggle " + navID + " is done");
              });
          },200);
      return debounceFn;
    }
}])
.controller('SideNavCtrl', ['$scope', '$mdSidenav', function ($scope, $mdSidenav) {
    $scope.close = function () {
      $mdSidenav('left').close()
        .then(function () {
          console.log("close RIGHT is done");
        });
    };
}]);