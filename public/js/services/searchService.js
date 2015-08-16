'use strict';

angular.module('myApp.services')	
	.factory('searchService', function ($http) {
		return {
			searchByTerm: function(term, media_type) {
				return $http({
					method: 'GET',
					url: '/api/' + media_type + '/search',
					params: {term: term}
				});
			},
			getSeasons: function(tv_id) {
				return $http({
					method: 'GET',
					url: '/api/tv/seasons',
					params: {
						id: tv_id
					}
				});
			},
			getEpisodes: function(tv_id, season_number){
				return $http({
					method: 'GET',
					url: '/api/tv/episodes',
					params: {
						id: tv_id,
						season_number: season_number
					}
				});
			}
		};
	});