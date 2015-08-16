'use strict';

angular.module('myApp.controllers').controller('DownloadsCtrl', ['$scope', '$http', '$interval', function ($scope, $http, $interval) {

	$scope.isOpen = false;
	
	$scope.listTaks = function() {
		$http({
			method: 'GET',
			url: '/api/tasks'
		}).
		then(function (response) {
			$scope.data = response.data;
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

	$scope.getStatus = function(task) {
		switch(task.status) {
			case "downloading":
				return "Téléchargement";
			case "finished":
				return "Terminé";
			case "paused":
				return "En pause";
			default:
				return "En attente";
		}
	};

	$scope.getProgressMode = function(task) {
		switch(task.status) {
			case "downloading":
				return "determinate";
			case "finished":
				return "determinate";
			case "paused":
				return "determinate";
			default:
				return "indeterminate";
		}
	};

	$scope.getProgressColor = function(task) {
		switch(task.status) {
			case "downloading":
				return "";
			case "finished":
				return "md-success";
			case "paused":
				return "md-warn";
			default:
				return "";
		}
	};

	$scope.getActionIcon = function(task) {
		switch(task.status) {
			case "downloading":
				return "mdi mdi-pause-circle";
			case "finished":
				return "mdi mdi-checkbox-marked-circle";
			case "paused":
				return "mdi mdi-play-circle";
			default:
				return "mdi mdi-dots-horizontal";
		}
	};

	$scope.getActionColor = function(task) {
		switch(task.status) {
			case "downloading":
				return "red";
			case "finished":
				return "green";
			case "paused":
				return "blue";
			default:
				return "blue";
		}
	};

	$scope.$on('$viewContentLoaded', function(){
		$scope.listTaks();
	});

	$interval(function() {
		$scope.listTaks();
	}, 1000);
	
}]);

