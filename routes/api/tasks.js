var config = require('config');
var Syno = require('syno');
var File = require(__base + '/model/files');

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


exports.getAll = function (req, res) {
	syno.dl.listTasks({additional: "detail,transfer"}, function(error, response) {
        res.contentType('json');
		res.send(
			response
		);
	});
};

exports.pause = function (req, res) {
    syno.dl.pauseTasks({id: req.body.id}, function(error, response) {
        res.contentType('json');
        res.send(
            response
        );
    });
};

exports.resume = function (req, res) {
    console.log(req.body);
    syno.dl.resumeTasks({id: req.body.id}, function(error, response) {
        res.contentType('json');
        res.send(
            response
        );
    });
};

exports.create = function(req, res) {
    console.log(req.body);
    syno.dl.createTask({'uri': req.body.url}, function(createError, createResponse) {
        if (!createError) {
            syno.dl.listTasks({additional: "detail"}, function(listError, listResponse) {
                if (!listError) {
                    if (!req.body.name) {
                        res.send({
                            success: true,
                            file: "Task launched but no auto rename"
                        });
                    }
                    else {
                        var taskId = null;
                        for(var i in listResponse.tasks) {
                            if (listResponse.tasks[i].additional.detail.uri == req.body.url) {
                                taskId = listResponse.tasks[i].id;
                                break;
                            }
                        }
                        var newFile = File({
                            name: req.body.name,
                            type: req.body.type,
                            tvshow: req.body.tvshow,
                            season: req.body.season,
                            episode: req.body.episode,
                            taskId: taskId
                        });
                        newFile.save().then(function(file) {
                            res.send({
                                success: true,
                                file: file
                            });
                        },
                        function(fileError) {
                            res.send({
                                success: false,
                                error: fileError
                            });
                        });
                    }
                }
                else {
                    res.send({
                        success: false,
                        error: listError
                    });
                }
            });
        }
        else {
            res.send({
                success: false,
                error: createError
            });
        }
    });
}