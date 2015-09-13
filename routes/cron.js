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
            console.log("General process: listing tasks...");
            var tasks = listResponse.tasks;
            File.find({completed: false}).then(function(files) {
                console.log("General process: listing files...");
                var elements = getValidElements(tasks, files);
                //Rename Files
                var promises = [];
                for (var i in elements) {
                    promises.push(process(elements[i]));
                }
                if(promises.length>0){
                    Promise.all(promises).then(function(){
                        console.log("General process: " + promises.length + " file(s) processed!");
                    }, function(err) {
                        console.log(err);
                    });
                } else {
                    console.log('General process: no file to process.');
                }
            }, function(fileError) {
                console.log("General process: error while listing file tasks : " + fileError);
            });
        }
        else {
            console.log("General process: error while listing synology tasks");
        }
    });
}

function process(element) {
    return new Promise(function(resolve, reject) {
        var taskName = element.destFileName;
        renameFile(element).then(function() {
            console.log(taskName + ": file renamed!")
            return createPath(element);
        })
        .then(function(path) {
            console.log(taskName + ": path created!")
            return moveFile(element, path);
        })
        .then(function() {
            console.log(taskName + ": file moved!")
            element.file.completed = true;
            return element.file.save();
        })
        .then(function() {
            console.log(taskName + ": file saved!")
            resolve(element);
        })
        .catch(function(err) {
            reject(err);
        });
    });
}

function getValidElements(tasks, files) {
    var elements = [];
    for (var i in tasks) {
        for (var j in files) {
            if (tasks[i].id == files[j].taskId && tasks[i].status == "finished" && (files[j].getType() == "movie" || files[j].getType() == "tv")) {
                var file = sanitizeFile(files[j]);
                elements.push({
                    file: file,
                    task: tasks[i],
                    srcFileName: tasks[i].title,
                    destFileName: getFileName(file) + "." + getExtension(tasks[i].title)
                });
                break;
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
            createFolder(folder.tv, element.file.tv.name).then(function(tvPath) {
                return createFolder(tvPath, "Saison " + element.file.tv.season);
            })
            .then(function(fullPath) {
                resolve(fullPath);
            })
            .catch(function(err) {
                reject(err);
            });
        }
        else if (element.file.getType() == "movie") {
            resolve(folder.movie);
        }
        else {
            reject("It's not a movie or a tv! No need to move the file.");
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
        return file.movie.title + " (" + file.movie.year + ")";
    }
    else {
        return "";
    }
}

function getExtension(fileName) {
    return fileName.split(".")[fileName.split(".").length - 1];
}

function sanitizeFile(file) {
    var replaceChar = "";
    var regEx = new RegExp('[,/\:*?""<>|]', 'g');

    if (file.getType() == "tv") {
        file.tv.name = file.tv.name.replace(regEx, replaceChar);
        file.tv.title = file.tv.title.replace(regEx, replaceChar);
    }
    if (file.getType() == "movie") {
        file.movie.title = file.movie.title.replace(regEx, replaceChar);
    }
    return file;
}