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
    res.contentType('json');
	syno.dl.listTasks({additional: "detail,transfer"}, function(listError, listResponse) {
        if (!listError) {
            var tasks = listResponse.tasks;
            File.find({}).then(function(files) {
                var items = [];
                for (var i in tasks) {
                    for (var j in files) {
                        items.push({
                            file: files[j],
                            task: tasks[i],
                            type: files[j].getType()
                        })
                        break;
                    }
                }
                res.send(
                    items
                );
            },
            function(err) {
                res.send({
                    err: err
                });
            });
        }
        else {
            res.send({
                err: listError
            });
        }
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
                    if (req.body.url) {
                        var taskId = null;
                        for(var i in listResponse.tasks) {
                            if (listResponse.tasks[i].additional.detail.uri == req.body.url) {
                                taskId = listResponse.tasks[i].id;
                                break;
                            }
                        }
                        var newFile = new File({
                            taskId: taskId,
                            completed: false
                        });
                        // Add data
                        if (req.body.type == "tv") {
                            newFile.tv = {
                                name: req.body.name,
                                season: req.body.season,
                                episode: req.body.episode,
                                title: req.body.title
                            }
                        }
                        else if (req.body.type == "movie") {
                            newFile.movie = {
                                title: req.body.title,
                                year: req.body.year
                            }
                        }
                        // Save file
                        if (req.body.type == "tv" || req.body.type == "movie") {
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
                        else {
                            res.send({
                                success: true,
                            });
                        }
                    }
                    else {
                        res.send({
                            success: false,
                            file: "Missing url parameter"
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