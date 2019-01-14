var express = require('express')
var router = express.Router()
var mysql_conn = require('../sqlConnect')
var async = require('async')
var multer = require('multer');

var rootFilePath = '/workspace2/test-project-file/'
var fs = require('fs');


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
}).array("projectFiles");


//UPLOAD PROJECT FILES
router.post('/uploadProjectFiles', function (request, response) {
    //originalname - ชื่อปกติ
    //filename - ชื่อที่มีวันที่ด้วย
    //filePath

    upload(request, response, (err) => {

        /*Now do where ever you want to do*/
        if (err) {
            return response.status(500).send(err);
        }
        else {
            //SAVE DETAIL TO DATABASE
            async.eachSeries(request.files,
                (file, cb) => {
                    insertProjectFilesDetail(file, request.body.projectId, request.body.forChecker, cb)
                },
                (err2, res2) => {
                    if (err2) {
                        return response.status(200).send(err2);
                    } else {
                        return response.status(200).send(res2);
                    }
                })

        }
    });
});

function insertProjectFilesDetail(file, projectId, forChecker, cb) {

    mysql_conn.query(`INSERT INTO project_files (projectId,name,filePath,forChecker) VALUES
    (${projectId},"${file.originalname}","${file.filename}",${forChecker})`,
        function (err, rows) {
            if (err) {
                cb(err)
                return
            }
            cb(null, rows)
        });

}

// FETCH PROJECT FILES
router.post('/fetchProjectFiles', function (req, res) {
    var data = req.body;
    mysql_conn.query(`SELECT * FROM project_files WHERE projectId="${data.projectId}"`, function (err, rows) {
        if (err) {
            return res.status(500).send(err);
        }
        return res.status(200).send(rows);
    });
})

router.post('/deleteProjectFile', function (req, res) {
    var data = req.body;
    fs.unlink(rootFilePath + data.filePath, function (error) {
        if (error) {
            return res.status(500).send(error);
        }
        mysql_conn.query(`DELETE FROM project_files WHERE fileId = ${data.fileId} AND projectId = '${data.projectId}';
        `, function (err, rows) {
                if (err) {
                    return res.status(500).send(err);
                }
                return res.status(200).send(`Deleted filename: ${data.name}`);
            });
    })
})






module.exports = router