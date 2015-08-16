'use strict';

angular.module('myApp.controllers', []);

angular.module('myApp.controllers').controller('AppCtrl', ['$scope', '$http', '$mdSidenav', function ($scope, $http, $mdSidenav) {

	$scope.toggleSidenav = function(menuId) {
		$mdSidenav(menuId).toggle();
	};

	$scope.closeSidenav = function(menuId) {
		$mdSidenav(menuId).close();
	};

	$http({
		method: 'GET',
		url: '/api/name'
	}).
	success(function (data, status, headers, config) {
		$scope.name = data.name;
	}).
	error(function (data, status, headers, config) {
		$scope.name = 'Error!';
	});
}]);