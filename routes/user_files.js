var express = require('express')
var router = express.Router()
var mysql_conn = require('../sqlConnect')
// var _ = require('lodash')
var async = require('async')
var multer = require('multer');
var rootFilePath = require('./rootFilePath')
// const _ = require('lodash')

// var http = require('http');
var fs = require('fs');
// var fs = require('fs-extra');
// var pathModule = require('path');
const path = require("path");

const storage = multer.diskStorage({
    destination: rootFilePath,
    filename: function (req, file, cb) {
        cb(null, Date.now() + "_" + file.originalname
            // + path.extname(file.originalname)
        );
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 1000000 },
}).array("userFiles");


//UPLOAD USER FILES
router.post('/uploadUserFiles', function (request, response) {//TODO:
    //originalname - ชื่อปกติ
    //filename - ชื่อที่มีวันที่ด้วย
    //filePath

    upload(request, response, (err) => {

        // console.log(request.files);
        // console.log(request.body.userId);

        /*Now do where ever you want to do*/
        if (err) {
            return response.status(500).send(err);
        }
        else {
            //SAVE DETAIL TO DATABASE
            async.eachSeries(request.files,
                (file, cb) => {
                    insertUserFilesDetail(file, request.body.userId, cb)
                },
                (err2, res2) => {
                    if (err2) {
                        return response.status(500).send(err2);
                    } else {
                        return response.status(200).send(res2);
                    }
                })

        }
    });
});

function insertUserFilesDetail(file, userId, cb) {
    mysql_conn.query(`INSERT INTO user_files (userId,name,filePath) VALUES
    ("${userId}","${file.originalname}","${file.filename}")`,
        function (err, rows) {
            if (err) {
                cb(err)
                return
            }
            cb(null, rows)
        });

}

// FETCH USER FILES
router.post('/fetchUserFiles', function (req, res) {
    var data = req.body;
    mysql_conn.query(`SELECT * FROM user_files WHERE userId="${data.userId}"`, function (err, rows) {
        if (err) {
            return res.status(500).send(err);
        }
        return res.status(200).send(rows);
    });
})

// DOWNLOAD USER FILES
router.post('/downloadUserFile', function (req, res) { //TODO:
    var data = req.body;

    //     return res.status(200).send(`..${rootFilePath}`);
    return res.status(200).send(rootFilePath + data.filePath);


    // console.log('test:  ' + rootFilePath + data.filePath)
    // res.download(rootFilePath + data.filePath)

    // res.download(path.join(data.filePath));


    // var file = fs.createWriteStream("data.name");
    // var request = http.get("localhost" + rootFilePath, function (response) {
    //     response.pipe(file);
    // });


    // import fs-extra package
    // var buffer = fs.readFileSync(data.filePath);
    // var bufferBase64 = new Buffer(buffer);
    // res.status(200).send(bufferBase64);
})

router.post('/deleteUserFile', function (req, res) {
    var data = req.body;
    fs.unlink(rootFilePath + data.filePath, function (error) {
        if (error) {
            return res.status(500).send(error);
        }
        mysql_conn.query(`DELETE FROM user_files WHERE fileId = ${data.fileId} AND userId = '${data.userId}';
        `, function (err, rows) {
                if (err) {
                    return res.status(500).send(err);
                }
                return res.status(200).send(`Deleted filename: ${data.name}`);
            });
    })
})






module.exports = router