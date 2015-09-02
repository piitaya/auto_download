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

var folder = config.get('Process.folder');

exports.process = function() {
    syno.dl.listTasks({}, function(listError, listResponse) {
        if (!listError) {
            console.log("List tasks: done!");
            var tasks = listResponse.tasks;
            File.find({completed: false}).then(function(files) {
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
                        console.log(promises.length + " files processed!");
                    }, function(err) {
                        console.log(err);
                    });
                } else {
                    console.log('No file to process');
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
            console.log("File renamed !")
            return createPath(element);
        },
        function(err) {
            console.log('Error while renaming file...');
            reject(err);
        })
        .then(function(path) {
            console.log("Path created !")
            return moveFile(element, path);
        },
        function(err) {
            console.log('Error while creating path...');
            reject(err);
        })
        .then(function() {
            console.log("File moved !")
            element.file.completed = true;
            return element.file.save()
        },
        function(err) {
            console.log('Error while moving file...');
            reject(err);
        })
        .then(function() {
            console.log("File saved !")
            resolve(element);
        },
        function(err) {
            console.log('Error while saving file...');
            reject(err);
        });
    });
}

function getValidElements(tasks, files) {
    var elements = [];
    for (var i in tasks) {
        console.log(tasks[i].status)
        for (var j in files) {
            if (tasks[i].id == files[j].taskId && tasks[i].status == "finished") {
                elements.push({
                    file: files[j],
                    task: tasks[i],
                    srcFileName: tasks[i].title,
                    destFileName: getFileName(files[j]) + "." + getExtension(tasks[i].title)
                });
            }
        }
    }
    return elements;
}

function moveFile(element, path) {
    return new Promise(function(resolve, reject) {
        syno.fs.startCopyMove({
            path: folder.downloads + "/" + element.destFileName,
            dest_folder_path: path,
            remove_src: true
        }, function(err, response) {
            if (err) {
                reject(err);
            }
            else {
                resolve(element);
            }
        });
    });
}

function renameFile(element) {
    return new Promise(function(resolve, reject) {
        syno.fs.rename({
            path: folder.downloads + "/" + element.srcFileName,
            name: element.destFileName,
        }, function(err, response) {
            if (err) {
                reject(err);
            }
            else {
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
                console.log(err);
                reject(err);
            }
            else {
                resolve(folder_path + "/" + name);
            }
        });
    });
}

function createPath(element) {
    return new Promise(function(resolve, reject) {
        if (element.file.getType() == "tv") {
            console.log(folder.tv + " - " + element.file.tv.name);
            createFolder(folder.tv, element.file.tv.name).then(function(tvPath) {
                console.log(tvPath);
                return createFolder(tvPath, "Saison " + element.file.tv.season);
            }, function(err) {
                console.log('Error while creating tv show name folder');
                reject(err);
            }).then(function(fullPath) {
                resolve(fullPath);
            }, function(err) {
                console.log('Error while creating season name folder');
                reject(err);
            });
        }
        else if (element.file.getType() == "movie") {
            resolve(folder.movie);
        }
        else {
            reject();
        }
    });
}

//Utils functions

function getFileName(file) {
    if (file.getType() == "tv") {
        var season = file.tv.season > 9 ? file.tv.season : "0" + file.tv.season;
        var episode = file.tv.episode > 9 ? file.tv.episode : "0" + file.tv.episode;
        return file.tv.name + " - " + season + "x" + episode + " - " + file.tv.title;
    }
    else if (file.getType() == "movie") {
        return file.movie.name + " (" + file.movie.year + ")";
    }
    else {
        return ""
    }
}

function getExtension(fileName) {
    return fileName.split(".")[fileName.split(".").length - 1];
}