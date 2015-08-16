angular.module('myApp.controllers').controller('SearchCtrl', ['$scope', '$http', 'searchService', function ($scope, $http, searchService) {
	
	$scope.mediaType = "tv";
	$scope.seasons = [];
	$scope.episodes = [];

	// Text changed event
	$scope.searchTextChange = function(text) {
		console.log('Text changed to ' + text);
	};

	// Query search
	$scope.querySearch = function(term) {
		return searchService.searchByTerm(term, $scope.mediaType).then(function (response) {
			return response.data.results;
		});
	};

	$scope.getSeasons = function() {
		$scope.selectedSeason = undefined;
		$scope.selectedEpisode = undefined;
		if ($scope.selectedItem) {
			return searchService.getSeasons($scope.selectedItem.id).then(
				function(response) {
					$scope.seasons = response.data.seasons;
				});
		}
		else {
			$scope.seasons = [];
		}
	};

	$scope.getEpisodes = function() {
		$scope.selectedEpisode = undefined;
		if ($scope.selectedItem && $scope.selectedSeason) {
			return searchService.getEpisodes($scope.selectedItem.id, $scope.selectedSeason.season_number).then(
				function(response) {
					$scope.episodes = response.data.episodes;
				});
		}
		else {
			$scope.episodes = [];
		}
	};

	$scope.formattedName = function() {
		if ($scope.selectedItem && $scope.selectedSeason && $scope.selectedEpisode) {
			var season_number = $scope.selectedSeason.season_number > 9 ? $scope.selectedSeason.season_number : "0" + $scope.selectedSeason.season_number;
			var episode_number = $scope.selectedEpisode.episode_number > 9 ? $scope.selectedEpisode.episode_number : "0" + $scope.selectedEpisode.episode_number;
			return $scope.selectedItem.name + " - " + season_number + "x" + episode_number + " - " + $scope.selectedEpisode.name;
		}
	};
}]);