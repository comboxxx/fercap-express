var express = require('express')
var router = express.Router()
var mysql_conn = require('../sqlConnect')
var _ = require('lodash')
var async = require('async')
var multer = require('multer');
var rootFilePath = require('./rootFilePath')
// const _ = require('lodash')

// var fs = require('fs');
// var pathModule = require('path');
// const path = require("path");

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

router.post('/uploadUserFiles', function (request, response) {
    //originalname - ชื่อปกติ
    //filename - ชื่อที่มีวันที่ด้วย
    //filePath

    upload(request, response, (err) => {
        // console.log("Request ---", request.body.userId); //data here

        console.log(request.files);

        // _.forEach(request.files, file => {
        //     console.log(file.filename)
        // })

        /*Now do where ever you want to do*/
        if (err) {
            return response.status(500).send(err);
        }
        else {
            //SAVE DETAIL TO DATABASE
            async.eachSeries(files,
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
    ("${userId}","${file.originalname}",${rootFilePath}/${file.filename}")`,
        function (err, rows) {
            if (err) {
                cb(err)
                return
            }
            cb(null, rows)
        });

}



module.exports = router