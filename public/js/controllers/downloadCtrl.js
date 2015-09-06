'use strict';

angular.module('myApp.controllers').controller('DownloadsCtrl', ['$scope', '$http', '$interval', function ($scope, $http, $interval) {

	$scope.isOpen = false;
	
	$scope.listTaks = function() {
		$http({
			method: 'GET',
			url: '/api/tasks'
		}).
		then(function (response) {
			$scope.items = response.data;
		});
	};

	$scope.resumeTask = function(id) {
		$http({
			method: 'POST',
			url: '/api/tasks/resume',
			headers: {'Content-Type': 'application/json'},
			data: {id: id}
		}).
		success(function (data, status, headers, config) {
			$scope.listTaks();
		});
	};

	$scope.pauseTask = function(id) {
		$http({
			method: 'POST',
			url: '/api/tasks/pause',
			headers: {'Content-Type': 'application/json'},
			data: {id: id}
		}).
		success(function (data, status, headers, config) {
			$scope.listTaks();
		});
	};

	$scope.statusConfig = {
		downloading: {
			label: "Téléchargement",
			progressColor: "",
			progressMode: "determinate",
			actionIcon: "mdi mdi-pause-circle",
			actionColor: "red",
			actionFunction: $scope.pauseTask
		},
		finished: {
			label: "Terminé",
			progressColor: "md-success",
			progressMode: "determinate",
			actionIcon: "mdi mdi-checkbox-marked-circle",
			actionColor: "green",
			actionFunction: undefined
		},
		paused: {
			label: "En pause",
			progressColor: "md-warn",
			progressMode: "determinate",
			actionIcon: "mdi mdi-play-circle",
			actionColor: "blue",
			actionFunction: $scope.resumeTask
		},
		default: {
			label: "En attente",
			progressColor: "",
			progressMode: "indeterminate",
			actionIcon: "mdi mdi-dots-horizontal",
			actionColor: "blue",
			actionFunction: undefined
		}
	}
	$scope.getElement = function(task, element) {
		return $scope.statusConfig[task.status] ? $scope.statusConfig[task.status][element] : $scope.statusConfig.default[element]
	};

	$scope.$on('$viewContentLoaded', function(){
		$scope.listTaks();
	});

	$interval(function() {
		$scope.listTaks();
	}, 5000);
	
}]);

