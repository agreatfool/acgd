"use strict";

var libHttp = require('http');
var libHttps = require('https');
var libFs = require('fs');
var libPath = require('path');
var libUrl = require('url');

var downloadHr = '-------------------------------------';
var downloadTypeAll = {
    "FLV": "FLV",
    "IMAGE": "IMAGE"
};
var downloadType = downloadTypeAll.FLV;
var downloadTargetDirName = 'download';
var isForceMode = true; // true will delete previous output dir, false will not
var isToKeepFileName = false; // true will rename files with download index, false will keep file name in url

var downloadBase = '/Users/jonathan/Downloads/';
var downloadListFile = libPath.join(downloadBase, 'list.m3u');
var downloadList = [];
var downloadTargetDir = libPath.join(downloadBase, downloadTargetDirName);
var downloadIndex = 0;
var downloadTotalCount = 0;

var funcStart = function() {
    // check output dir
    var targetDirExists = libFs.existsSync(downloadTargetDir);
    if (targetDirExists && !isForceMode) {
        console.log('Target output dir alreay exists!');
        process.exit(1);
    } else if (targetDirExists && isForceMode) {
        funcDeleteFolderRecursive(downloadTargetDir);
    }
    libFs.mkdirSync(downloadTargetDir);

    // handle download list
    console.log('Check download list file: ' + downloadListFile);
    if (!libFs.existsSync(downloadListFile)) {
        console.log('Download list file not exist!');
        process.exit(1);
    }
    var fileContent = libFs.readFileSync(downloadListFile).toString();
    if (fileContent === '' || fileContent === null || typeof fileContent === 'undefined') {
        console.log('Empty download list file!');
        process.exit(1);
    }
    var spliter = "\n"; // default "/n"
    if (fileContent.indexOf("\r\n") !== -1) {
        spliter = "\r\n";
    }
    fileContent.split(spliter).forEach(function(url) {
        if (url !== '') {
            downloadList.push(url);
        }
    });
    if (downloadList.length === 0) {
        console.log('Empty download list!');
        process.exit(1);
    }
    downloadTotalCount = downloadList.length;
    console.log('Download list:');
    console.log(downloadList);

    // start download
    var timer = setInterval(function() {
        if (downloadList.length === 0) {
            clearInterval(timer); // all requests done
            console.log('Download all done!');
        }
    }, 500); // 500ms

    funcDownload();
};

var funcDownload = function() {
    if (downloadList.length === 0) {
        return;
    }

    downloadIndex++;

    var url = downloadList.shift();

    console.log(downloadHr);
    console.log('Start to download: ' + url);
    console.log('Queue: ' + downloadIndex + ' / ' + downloadTotalCount);

    var options = libUrl.parse(url);
    var exec = options['protocol'] === 'https:' ? libHttps : libHttp;

    var subFuncGet = function(url) {
        exec.get(url, function(response) {
            if (response.statusCode === 200) {
                var totalToDownload = response.headers['content-length'];
                var totalDownloaded = 0;
                response.on('data', function(chunk) {
                    totalDownloaded += chunk.length;
                    console.log('Progress: ' + totalDownloaded + ' / ' + totalToDownload);
                    if (totalDownloaded >= totalToDownload) {
                        funcDownload();
                    }
                });
                funcHandleResponse(url, response);
            } else if (response.statusCode === 302) {
                console.log('Url redirected, retry with new url: ' + response.headers.location);
                subFuncGet(response.headers.location);
            } else {
                console.log('Download failed, status: ' + response.statusCode + ' , url: ' + url);
                funcDownload();
            }
        }).on('error', function(e) {
            console.error(e);
        });
    };

    subFuncGet(url);
};

var funcHandleResponse = function(url, response) {
    var fileName = '';

    if (isToKeepFileName) {
        fileName = url.substr(url.lastIndexOf('/'));
    } else {
        var indexStr = downloadIndex.toString();
        if (indexStr.length === 1) {
            indexStr = '00' + indexStr;
        } else if (indexStr.length === 2) {
            indexStr = '0' + indexStr;
        }
        fileName =
            indexStr +
            (downloadType === downloadTypeAll.FLV ? '.flv' : url.substr(url.lastIndexOf('.')));
    }

    var file = libFs.createWriteStream(libPath.join(downloadTargetDir, fileName));
    response.pipe(file);
};

var funcDeleteFolderRecursive = function(path) {
    var files = [];
    if( libFs.existsSync(path) ) {
        files = libFs.readdirSync(path);
        files.forEach(function(file, index){
            var curPath = path + '/' + file;
            if(libFs.lstatSync(curPath).isDirectory()) { // recurse
                funcDeleteFolderRecursive(curPath);
            } else { // delete file
                libFs.unlinkSync(curPath);
            }
        });
        libFs.rmdirSync(path);
    }
};

console.log(downloadHr);
funcStart();