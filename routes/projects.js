var express = require('express')
var router = express.Router()
var mysql_conn = require('../sqlConnect')
var _ = require('lodash')
var moment = require('moment')
var async = require('async')

//CREATE PROJECT
router.post('/createProject', function (req, res) {
    var data = req.body;

    async.waterfall([
        (cb) => { insertProject(data, cb) },
        // (cb) => { saveProjectFiles(randomUserId, data, cb) }, //TODO: save files

    ], (err, result) => {
        if (err) {
            return res.status(500).send(err);
        }
        return res.status(200).send(result)

    });
})

function insertProject(data, cb) {

    mysql_conn.query(`INSERT INTO projects (rowNumber,userId,title,description,createTime,status,approveStatus) VALUES ("${data.row}","${data.userId}","${data.title}","${data.description}","${moment().toISOString()}","${data.status}","${data.approveStatus}")`,
        function (err, res) {
            if (err) {
                cb(err)
                return
            }
            insertUser_Project(data, res, cb)
        });
}

function insertUser_Project(data, res, cb) {

    mysql_conn.query(`INSERT INTO user_project (projectId,userId) VALUES (${res.insertId},"${data.userId}")`,
        function (err, rows) {
            if (err) {
                cb(err)
                return
            }
            cb(null, rows)
        });
}

//FETCH USER PROJECT
router.post('/fetchUserProject', function (req, res) {
    var data = req.body;

    mysql_conn.query(`
    SELECT projects.*, user_project.projectId FROM projects
    LEFT JOIN user_project ON projects.projectId = user_project.projectId 
    WHERE user_project.userId = "${data.userId}"
    `,
        function (err, rows) {
            if (err) {
                return res.status(200).send(err);
            }
            return res.status(200).send(rows);
        });
})

//FETCH SINGLE PROJECT
router.post('/fetchSingleProject', function (req, res) {
    var data = req.body;

    mysql_conn.query(`SELECT * FROM projects WHERE projectId="${data.projectId}"`,
        function (err, rows) {
            if (err) {
                return res.status(500).send(err);
            }
            return res.status(200).send(rows);
        });
})

//FETCH ALL PROJECT (LIMIT 50)
router.post('/fetchAllProjectsLimit', function (req, res) {
    var data = req.body;

    //COMPUTE ROW---------
    var index = data.index
    var limit = 50

    var limitString = ''
    if (index === 0) {
        limitString = `LIMIT 0,${limit}`
    }
    if (index === 1) {
        limitString = `LIMIT ${limit},${limit}`
    }
    if (index > 1) {
        limitString = `LIMIT ${index * limit},${limit}`
    }

    var sqlCommand = 'SELECT * FROM projects'

    if (data.isJoinProj) {
        sqlCommand = sqlCommand + ' WHERE status = "recruiting"'
    }

    sqlCommand = sqlCommand + ` ORDER BY createTime DESC ${limitString}`

    mysql_conn.query(sqlCommand,
        function (err, rows) {
            if (err) {
                return res.status(500).send(err);
            }
            return res.status(200).send(rows);
        });
})

//GET PROJECT ROW COUNT
router.post('/getProjectsRowCount', function (req, res) {
    var data = req.body;

    mysql_conn.query(`SELECT COUNT(*) FROM projects ${data.isJoinProj ? 'WHERE status = "recruiting"' : ''}`,
        function (err, rows) {
            if (err) {
                return res.status(500).send(err);
            }
            return res.status(200).send(rows);
        });
})

//FIND PROJECT BY FILTER INPUT
router.post('/filterProjects', function (req, res) {
    var data = req.body;

    mysql_conn.query(`SELECT * FROM projects WHERE title LIKE '%${data.filterInput}%' ${data.isJoinProj ? 'and status = "recruiting"' : ''}`,
        function (err, rows) {
            if (err) {
                return res.status(500).send(err);
            }
            return res.status(200).send(rows);
        });
})

//SET PROJECT STATUS
router.post('/setProjectStatus', function (req, res) {
    var data = req.body;

    mysql_conn.query(`
    UPDATE projects
    SET status = "${data.status}"
    WHERE userId = "${data.userId}" and projectId = ${data.projectId};
    `,
        function (err, rows) {
            if (err) {
                return res.status(500).send(err);
            }
            return res.status(200).send(rows);
        });
})

router.post('/setProjectApproveStatus', function (req, res) {
    var data = req.body;

    mysql_conn.query(`
    UPDATE projects
    SET approveStatus = "${data.approveStatus}"
    WHERE userId = "${data.userId}" and projectId = ${data.projectId};
    `,
        function (err, rows) {
            if (err) {
                return res.status(500).send(err);
            }
            return res.status(200).send(rows);
        });
})

//SET LEAD CHECKER
router.post('/setLeadChecker', function (req, res) {
    var data = req.body;

    mysql_conn.query(`
    UPDATE projects
    SET leadCheckerNo = "${data.userId}"
    WHERE projectId = ${data.projectId}
    `,
        function (err, rows) {
            if (err) {
                return res.status(500).send(err);
            }
            return res.status(200).send(rows);
        });
})
module.exports = router