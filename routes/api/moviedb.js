var config = require('config');
var MovieDB = require('moviedb');

var mdb = MovieDB(config.get('MovieDB.api.key'));


exports.searchMovie = function (req, res) {
    mdb.searchMovie({query: req.query.term, language: "en"}, function(error, response){
        res.contentType('json');
        var movies = [];
        for (var i in response.results) {
            var result = response.results[i];
            year =  result.release_date ? result.release_date.split("-")[0] : undefined;
            var movie = {
                id: result.id,
                name: result.original_title,
                image: result.poster_path,
                year: year
            };
            movies.push(movie);
        }
        res.send(
            {results: movies}
        );
    });
};

exports.searchTv = function (req, res) {
    console.log(req.query);
    mdb.searchTv({query: req.query.term, language: "en"}, function(error, response){
        res.contentType('json');
        var tvs = [];
        for (var i in response.results) {
            var result = response.results[i];
            var tv = {
                id: result.id,
                name: result.original_name,
                image: result.poster_path
            };
            tvs.push(tv);
        }
        res.send(
            {results: tvs}
        );
    });
};

exports.getMovieInfo = function (req, res) {
    mdb.movieInfo({id: req.query.id, language: "en"}, function(error, response){
        res.contentType('json');
        res.send(
            response
        );
    });
};

exports.getTvInfo = function (req, res) {
    mdb.tvInfo({id: req.query.id, language: "en"}, function(error, response){
        res.contentType('json');
        res.send(
            response
        );
    });
};

exports.getTvSeasonInfo = function (req, res) {
    mdb.tvSeasonInfo({id: req.query.id, season_number: req.query.season_number, language: "en"}, function(error, response){
        res.contentType('json');
        res.send(
            response
        );
    });
};

exports.getSeasons = function (req, res) {
    mdb.tvInfo({id: req.query.id, language: "en"}, function(error, response) {
        res.contentType('json');
        var seasons = [];
        for (var i in response.seasons) {
            var result = response.seasons[i];
            var season = {
                season_number: result.season_number,
                episode_count: result.episode_count,
                air_date: result.air_date
            };
            seasons.push(season);
        }
        res.send(
            {seasons: seasons}
        );
    });
};

exports.getEpisodes = function (req, res) {
    mdb.tvSeasonInfo({id: req.query.id, season_number: req.query.season_number, language: "en"}, function(error, response) {
    res.contentType('json');
        var episodes = [];
        for (var i in response.episodes) {
            var result = response.episodes[i];
            var episode = {
                episode_number: result.episode_number,
                air_date: result.air_date,
                name: result.name
            };
            episodes.push(episode);
        }
        res.send(
            {episodes: episodes}
        );
    });
};