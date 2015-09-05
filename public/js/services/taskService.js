

	'use strict';

angular.module('myApp.services')	
	.factory('taskService', function ($http) {
		return {
			create: function(data) {
				return $http({
					method: 'POST',
					url: '/api/tasks',
					headers: {'Content-Type': 'application/json'},
					data: data
				});
			}
		};
	});