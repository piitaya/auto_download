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
                var promises = [];
                for (var i in elements) {
                    promises.push(process(elements[i]));
                }
                if(promises.length>0){
                    Promise.all(promises).then(function(){
                        console.log(promises.length + " files processed");
                    }, function(err) {
                        console.log(err);
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

function process(element) {
    return new Promise(function(resolve, reject) {
        renameFile(element).then(function() {
            return createPath(element);
        },
        function(err) {
            console.log('Error while renaming file');
            reject(err);
        })
        .then(function(path) {
            return moveFile(element, path);
        },
        function(err) {
            reject(err);
        })
        .then(function() {
            resolve(element);
        },
        function(err) {
            console.log('Error while moving file');
            reject(err);
        });
    });
}

function getValidElements(tasks, files) {
    var response = [];
    for (var i in tasks) {
        console.log(tasks[i].status)
        for (var j in files) {
            if (tasks[i].id == files[j].taskId && tasks[i].status == "finished") {
                response.push({
                    name: files[j].name,
                    type: files[j].type,
                    tvshow: files[j].tvshow,
                    season: files[j].season,
                    episode: files[j].episode,
                    taskId: tasks[i].id,
                    fileId: files[j]._id,
                    srcFileName: tasks[i].title,
                    destFileName: getFileName(files[j]) + "." + getExtension(tasks[i].title)
                });
            }
        }
    }
    return response;
}

function moveFile(element, path) {
    return new Promise(function(resolve, reject) {
        syno.fs.startCopyMove({
            path: "/downloads/" + element.destFileName,
            dest_folder_path: path,
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
            path: "/downloads/" + element.srcFileName,
            name: element.destFileName,
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

function createPath(element) {
    return new Promise(function(resolve, reject) {
        if (element.type == "tv") {
            createFolder("/video/Serie", element.tvshow).then(function() {
                return createFolder("/video/Serie/" + element.tvshow, "Saison " + element.season);
            }, function(err) {
                console.log('Error while create tv show name folder');
                reject(err);
            }).then(function() {
                resolve("/video/Serie/" + element.tvshow + "/Saison " + element.season);
            }, function(err) {
                console.log('Error while create season name folder');
                reject(err);
            });
        }
        else if (element.type == "movie") {
            resolve("/video/Film");
        }
        else {
            reject();
        }
    });
}

//Utils functions

function getFileName(file) {
    if (file.type == "tv") {
        var season = file.season > 9 ? file.season : "0" + file.season;
        var episode = file.episode > 9 ? file.episode : "0" + file.episode;
        return file.tvshow + " - " + season + "x" + episode + " - " + file.name;
    }
    else {
        return file.name;
    }
}

function getExtension(fileName) {
    return fileName.split(".")[fileName.split(".").length - 1];
}