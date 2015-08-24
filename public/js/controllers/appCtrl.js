'use strict';

angular.module('myApp.controllers', []);

angular.module('myApp.controllers').controller('AppCtrl', ['$scope', '$http', '$mdSidenav', function ($scope, $http, $mdSidenav) {

	$scope.toggleSidenav = function(menuId) {
		$mdSidenav(menuId).toggle();
	};

	$scope.closeSidenav = function(menuId) {
		$mdSidenav(menuId).close();
	};
}]);