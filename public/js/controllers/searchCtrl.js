'use strict';

angular.module('myApp.controllers').controller('SearchCtrl', ['$scope', '$http', function ($scope, $http) {
	
	$scope.mediaType = "tv";

	$scope.selectedItemInfo = null;
	// Text changed event
	$scope.searchTextChange = function(text) {
		console.log('Text changed to ' + text);
	};

	// Select item event
	$scope.selectedItemChange = function(item) {
		console.log('Item changed to ' + JSON.stringify(item));
		$http({
			method: 'GET',
			url: '/api/' + $scope.mediaType + '/info',
			params: {id: item.id}
		}).
		then(function (response) {
			$scope.selectedItemInfo = response.data;
		});
	};

	// Query search
	$scope.querySearch = function(term) {
		return $http({
			method: 'GET',
			url: '/api/' + $scope.mediaType + '/search',
			params: {term: term}
		}).
		then(function (response) {
			return response.data.results;
		});
	};
}]);