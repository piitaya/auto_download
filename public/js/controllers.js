'use strict';

/* Controllers */

angular.module('myApp.controllers', []).
  controller('AppCtrl', ['$scope', '$http', '$mdSidenav', function ($scope, $http, $mdSidenav) {

    $scope.toggleSidenav = function(menuId) {
      $mdSidenav(menuId).toggle();
    };

    $scope.closeSidenav = function(menuId) {
      $mdSidenav(menuId).close();
    }

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

  }]).
  controller('MyCtrl1', function ($scope) {
    // write Ctrl here

  }).
  controller('DownloadsCtrl', ['$scope', '$http', '$interval', function ($scope, $http, $interval) {

    $scope.listTaks = function() {
      $http({
        method: 'GET',
        url: '/api/tasks'
      }).
      success(function (data, status, headers, config) {
        $scope.data = data;
      });
      console.log("coucou");
    }

    $scope.resumeTask = function(id) {
      $http({
        method: 'POST',
        url: '/api/tasks/resume',
        headers: {'Content-Type': 'application/json'},
        data: {id: id}
      }).
      success(function (data, status, headers, config) {
        $scope.listTaks();
      });;
    }

    $scope.pauseTask = function(id) {
      $http({
        method: 'POST',
        url: '/api/tasks/pause',
        headers: {'Content-Type': 'application/json'},
        data: {id: id}
      }).
      success(function (data, status, headers, config) {
        $scope.listTaks();
      });;
    }

    $scope.getStatus = function(task) {
      switch(task.status) {
        case "downloading":
          return "Téléchargement"
          break;
        case "finished":
          return "Terminé"
          break;
        case "paused":
          return "En pause"
          break;
        default:
          return "En attente"
      }
    }

    $scope.getProgressMode = function(task) {
      switch(task.status) {
        case "downloading":
          return "determinate"
          break;
        case "finished":
          return "determinate"
          break;
        case "paused":
          return "determinate"
          break;
        default:
          return "indeterminate"
      }
    }

    $scope.getProgressColor = function(task) {
      switch(task.status) {
        case "downloading":
          return ""
          break;
        case "finished":
          return "md-success"
          break;
        case "paused":
          return "md-warn"
          break;
        default:
          return ""
      }
    }

    $scope.getActionIcon = function(task) {
      switch(task.status) {
        case "downloading":
          return "mdi mdi-pause-circle"
          break;
        case "finished":
          return "mdi mdi-checkbox-marked-circle"
          break;
        case "paused":
          return "mdi mdi-play-circle"
          break;
        default:
          return "mdi mdi-dots-horizontal"
      }
    }

    $scope.getActionColor = function(task) {
      switch(task.status) {
        case "downloading":
          return "red"
          break;
        case "finished":
          return "green"
          break;
        case "paused":
          return "blue"
          break;
        default:
          return "blue"
      }
    }

    $scope.$on('$viewContentLoaded', function(){
      $scope.listTaks();
    });

    $interval(function() {
      $scope.listTaks();
    }, 1000);
  }]);
