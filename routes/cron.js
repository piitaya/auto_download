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

exports.process = function() {
    syno.dl.listTasks({}, function(listError, listResponse) {
        if (!listError) {
            console.log("List tasks: done!");
            var tasks = listResponse.tasks;
            File.find().then(function(files) {
                console.log("List files: done!");
                var elements = getValidElements(tasks, files);
                console.log(elements);

                //Rename Files
                var renamePromises = [];
                for (var i in elements) {
                    renamePromises.push(renameFile(elements[i]));
                }
                if(renamePromises.length>0){
                    Promise.all(renamePromises).then(function(){
                        console.log(renamePromises.length + " files renamed");
                        //Move files
                        var movePromises = [];
                        for (var i in elements) {
                            movePromises.push(moveFile(elements[i]));
                        }
                        if(movePromises.length>0){
                            Promise.all(movePromises).then(function(){
                                console.log(movePromises.length + " files moved");
                            }, function(error) {
                                console.log(error);
                            });
                        } else {
                            console.log('No file to move');
                        }
                    }, function(error) {
                        console.log(error);
                    });
                } else {
                    console.log('No file to rename');
                }
            }, function(fileError) {
                console.log("error while listing file tasks : " + fileError);
            });
        }
        else {
            console.log("error while listing synology tasks");
        }
    });
}

function getValidElements(tasks, files) {
    var response = [];
    for (var i in tasks) {
        for (var j in files) {
            if (tasks[i].id == files[j].taskId && tasks[i].status == "finished") {
                response.push({
                    srcName: tasks[i].title,
                    destName: getFileName(files[j]) + "." + getExtension(tasks[i].title),
                    taskId: tasks[i].id,
                    fileId: files[j]._id
                })
            }
        }
    }
    return response;
}

function getFileName(file) {
    var filename = "";
    if (file.type == "tv") {
        var season = file.season > 9 ? file.season : "0" + file.season;
        var episode = file.episode > 9 ? file.episode : "0" + file.episode;
        filename = file.tvshow + " - " + season + "x" + episode + " - " + filename;
    }
    else {
        filename = file.name;
    }
    return filename;
}

function getExtension(fileName) {
    return fileName.split(".")[fileName.split(".").length - 1];
}

function createFolder(folder_path, name) {
    return new Promise(function(resolve, reject) {
        syno.fs.createFolder({
            folder_path: folder_path,
            name: name
        }, function(err, response) {
            if (err) {
                reject(err);
            }
            else {
                resolve(response);
            }
        });
    });
}

exports.createFolder = function(req, res) {
    createFolder(req.body.folder_path, req.body.name).then(function(response) {
        res.send({
            success: true,
            response: response
        });
    }, function(err) {
        res.send({
            success: false,
            error: err
        });
    });
};

function moveFile(element) {
    return new Promise(function(resolve, reject) {
        syno.fs.startCopyMove({
            path: "/downloads/" + element.destName,
            dest_folder_path: "/video/test",
            remove_src: true
        }, function(err, response) {
            if (err) {
                reject(err);
            }
            else {
                console.log("file moved !")
                resolve(element);
            }
        });
    });
}

function renameFile(element) {
    return new Promise(function(resolve, reject) {
        syno.fs.rename({
            path: "/downloads/" + element.srcName,
            name: element.destName,
        }, function(err, response) {
            if (err) {
                reject(err);
            }
            else {
                console.log("file renamed !")
                resolve(element);
            }
        });
    });
}