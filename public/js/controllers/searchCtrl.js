angular.module('myApp.controllers').controller('SearchCtrl', ['$scope', '$rootScope', '$http', '$mdToast', '$mdDialog', 'searchService', 'taskService', function ($scope, $rootScope, $http, $mdToast, $mdDialog, searchService, taskService) {
	var self = this;
	$scope.mediaType = null;
	$scope.seasons = [];
	$scope.episodes = [];
	
	$scope.search = {
		searchTextItem: null,
		selectedItem: null,
		selectedSeason: null,
		selectedEpisodes: null
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
		$scope.search.selectedEpisodes = [];
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
			$scope.clearEpisodes();
			if ($scope.search.selectedItem && $scope.seasons != []) {
				return searchService.getSeasons($scope.search.selectedItem.id).then(function(response) {
					$scope.seasons = response.data.seasons;
				});
			}
		}	
	};

	$scope.getEpisodes = function() {
		$scope.search.selectedEpisode = null;
		$scope.resetEpisodes();
		if ($scope.search.selectedItem && $scope.search.selectedSeason && $scope.episodes != []) {
			return searchService.getEpisodes($scope.search.selectedItem.id, $scope.search.selectedSeason.season_number).then(function(response) {
				$scope.episodes = response.data.episodes;
			});
		}
	};

	// Gestion du tableau d'épisodes
	$scope.resetEpisodes = function() {
		for (var i in $scope.search.selectedEpisodes) {
			$scope.search.selectedEpisodes[i].episode = null;
		}
	};

	$scope.clearEpisodes = function() {
		$scope.search.selectedEpisodes = [{
			episode: null,
			link: null
		}];
	}

	$scope.addEpisode = function() {
		$scope.search.selectedEpisodes.push({
			episode: null,
			link: null
		});
	};

	$scope.deleteEpisode = function(index) {
		$scope.search.selectedEpisodes.splice(index, 1);
	}

	$scope.isDownloadButtonValid = function() {
		var valid = true;
		for (var i in $scope.search.selectedEpisodes) {
			if (!$scope.search.selectedEpisodes[i].episode || !$scope.search.selectedEpisodes[i].link) {
				valid = false
			}
		}
		return valid;
	};
	$scope.startDownload = function(type) {
		$rootScope.loader = true;
		var datas = [];
		if (type == "tv") {
			for (var  i in $scope.search.selectedEpisodes) {
				datas.push({
					url: $scope.search.selectedEpisodes[i].link,
					type: type,
					name: $scope.search.selectedItem.name,
					title: $scope.search.selectedEpisodes[i].episode.name,
					season: $scope.search.selectedSeason.season_number,
					episode: $scope.search.selectedEpisodes[i].episode.episode_number
				})
			}
		}
		else {
			datas = [{
				url: $scope.search.link,
				type: type
			}];
			if (type == "movie") {
				datas[0].title = $scope.search.selectedItem.name;
				datas[0].year = $scope.search.selectedItem.year;
			}	
		}
		var promises = [];
        for (var i in datas) {
            promises.push(taskService.create(datas[i]));
        }
        if(promises.length>0){
            Promise.all(promises).then(function(responses){
                console.log(responses);
                $rootScope.loader = false;
				$mdToast.show(
			      $mdToast.simple()
					.content('Téléchargements ajoutés !')
					.hideDelay(3000)
				);
			}, function(err) {
				console.log(err);
			});
        } else {
            console.log('Erreur, aucun fichier');
        }
	}

	$scope.showDialog = function($event) {
       	var parentEl = angular.element(document.body);
       	$mdDialog.show({
         	parent: parentEl,
        	targetEvent: $event,
         	template:
	           '<md-dialog flex="66">' +
	           '  <md-dialog-content>'+
	           '	<md-input-container>' +
	           '      <label>Liens (1 par ligne)</label>' +
	           '	  <textarea ng-model="links" columns="1"></textarea>' +
	           '    </md-input-container>' +
	           '  </md-dialog-content>' +
	           '  <div class="md-actions">' +
	           '    <md-button ng-click="addLinks()" class="md-primary">' +
	           '      Ajouter' +
	           '    </md-button>' +
	           '    <md-button ng-click="cancel()" class="md-primary">' +
	           '      Annuler' +
	           '    </md-button>' +
	           '  </div>' +
	           '</md-dialog>',
        	locals: {
           		episodes: $scope.search.selectedEpisodes
         	},
       		controller: DialogController
      	}).then(function(links) {
      		// Delete empty link
	      	var trueLinks = [];
	      	for (var i in links) {
	      		if (links[i]) {
	      			trueLinks.push(links[i]);
	      		}
	      	}
	      	// Push link in fields
	      	for (var i in trueLinks) {
	      		if (i < $scope.search.selectedEpisodes.length) {
	      			$scope.search.selectedEpisodes[i].link = trueLinks[i];
	      		}
	      		else {
	      			$scope.search.selectedEpisodes.push({
	      				episode: null,
	      				link: trueLinks[i]
	      			});
	      		}
	      	}
      		$scope.selectedEpisodes
	    }, function(err) {
	      	console.log(err);
	    });
      	function DialogController($scope, $mdDialog, episodes) {
      		$scope.links = "";
      		for (var i in episodes) {
      			if (episodes[i].link) {
      				$scope.links += episodes[i].link;
      				if (i < episodes.length - 1) {
      					$scope.links += '\n';
      				}
      			}
      		}
	        $scope.addLinks = function() {
	          	$mdDialog.hide($scope.links.split('\n'));
	        }
	        $scope.cancel = function() {
	          	$mdDialog.cancel("Nothing to add !");
	        }
      	}
    }
}]);