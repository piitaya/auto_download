angular.module('myApp.controllers').controller('SearchCtrl', ['$scope', '$http', 'searchService', function ($scope, $http, searchService) {
	var self = this;
	$scope.mediaType = "tv";
	$scope.seasons = [];
	$scope.episodes = [];
	
	$scope.search = {
		searchTextItem: null,
		selectedItem: null,
		selectedSeason: null,
		selectedEpisode: null,
		link: null
	}
	$scope.autoCompleteLabel = null;

	$scope.selectType = function(type) {
		if ($.inArray(type, ["tv", "movie", "other"]) > -1) {
			$scope.mediaType = type;
		}
		if (type == "tv") {
			$scope.autoCompleteLabel = "Nom de la série";
		}
		else if (type == "movie") {
			$scope.autoCompleteLabel = "Nom du film";
		}
		$scope.search = {};
	};

	// Text changed event
	$scope.searchTextChange = function(text) {
		console.log('Text changed to ' + text);
	};

	$scope.selectedItemChange = function() {
		$scope.search.selectedSeason = null;
		$scope.search.selectedEpisode = null;
	};

	// Query search
	$scope.querySearch = function(term) {
		return searchService.searchByTerm(term, $scope.mediaType).then(function (response) {
			return response.data.results;
		});
	};

	$scope.getSeasons = function() {
		if ($scope.mediaType == 'tv') {
			$scope.search.selectedSeason = null;
			$scope.search.selectedEpisode = null;
			if ($scope.search.selectedItem && $scope.seasons != []) {
				return searchService.getSeasons($scope.search.selectedItem.id).then(function(response) {
					$scope.seasons = response.data.seasons;
				});
			}
		}	
	};

	$scope.getEpisodes = function() {
		$scope.search.selectedEpisode = null;
		if ($scope.search.selectedItem && $scope.search.selectedSeason && $scope.episodes != []) {
			return searchService.getEpisodes($scope.search.selectedItem.id, $scope.search.selectedSeason.season_number).then(function(response) {
				$scope.episodes = response.data.episodes;
			});
		}
	};

	$scope.formattedName = function() {
		if ($scope.search.selectedItem && $scope.search.selectedSeason && $scope.search.selectedEpisode) {
			var season_number = $scope.search.selectedSeason.season_number > 9 ? $scope.search.selectedSeason.season_number : "0" + $scope.search.selectedSeason.season_number;
			var episode_number = $scope.search.selectedEpisode.episode_number > 9 ? $scope.search.selectedEpisode.episode_number : "0" + $scope.search.selectedEpisode.episode_number;
			return $scope.search.selectedItem.name + " - " + season_number + "x" + episode_number + " - " + $scope.search.selectedEpisode.name;
		}
	};

	$scope.selectType('tv');

}]);