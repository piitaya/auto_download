var request = require('request-promise');
var Syno = require('syno');
var config = require('config');

var syno = new Syno({
    // Requests protocol : 'http' or 'https' (default: http)
    protocol: config.get('Synology.host.protocol'),
    // DSM host : ip, domain name (default: localhost)
    host: config.get('Synology.host.url'),
    // DSM port : port number (default: 5000)
    port: config.get('Synology.host.port'),
    // DSM User account (required)
    account: config.get('Synology.account.user'),
    // DSM User password (required)
    passwd: config.get('Synology.account.password'),
});
/*
 * Serve JSON to our AngularJS client
 */

exports.name = function (req, res) {
	res.json({
		name: 'Bob'
	});
};

exports.login = function (req, res) {

};

exports.listTasks = function (req, res) {
	syno.dl.listTasks({additional: "detail,transfer"}, function(error, response) {
        res.contentType('json');
		res.send(
			response
		);
	});
};

exports.pauseTasks = function (req, res) {
    syno.dl.pauseTasks({id: req.body.id}, function(error, response) {
        res.contentType('json');
        res.send(
            response
        );
    });
};

exports.resumeTasks = function (req, res) {
    console.log(req.body)
    syno.dl.resumeTasks({id: req.body.id}, function(error, response) {
        res.contentType('json');
        console.log(error);
        console.log(response);
        res.send(
            response
        );
    });
};