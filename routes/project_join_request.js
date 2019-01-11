var express = require('express')
var router = express.Router()
var mysql_conn = require('../sqlConnect')
var _ = require('lodash')
// var moment = require('moment')
// var async = require('async')

//INSERT REQUEST
router.post('/insertRequest', function (req, res) {
    var data = req.body;

    mysql_conn.query(`INSERT INTO project_join_request (projectId,userId,status) VALUES (${data.projectId},"${data.userId}","pending")`,
        function (err, rows) {
            if (err) {
                return res.status(500).send(err);
            }
            return res.status(200).send(rows);
        });
})

//FETCH USER REQUESTS
router.post('/fetchUserRequests', function (req, res) {
    var data = req.body;

    mysql_conn.query(`SELECT * FROM project_join_request WHERE userId = "${data.userId}"`,
        function (err, rows) {
            if (err) {
                return res.status(500).send(err);
            }
            return res.status(200).send(rows);
        });
})

//FETCH ALL USER IN PROJECT REQUESTS
router.post('/fetchAllUserInProjectRequests', function (req, res) {
    var data = req.body;

    mysql_conn.query(`
    SELECT users.*, project_join_request.projectId,project_join_request.status as joinRequestStatus FROM users
    LEFT JOIN project_join_request ON users.userId = project_join_request.userId 
    WHERE project_join_request.projectId = "${data.projectId}"
    `,
        function (err, rows) {
            if (err) {
                return res.status(500).send(err);
            }
            return res.status(200).send(rows);
        });
})

//APPROVE JOIN STATUS
router.post('/approveJoinRequest', function (req, res) {
    var data = req.body;

    mysql_conn.query(`
    UPDATE project_join_request
    SET status = "approved"
    WHERE userId = "${data.userId}" and projectId = ${data.projectId};
    `,
        function (err, rows) {
            if (err) {
                return res.status(500).send(err);
            }
            insertUser_Project(data, res)
        });
})

function insertUser_Project(data, res) {

    mysql_conn.query(`INSERT INTO user_project (projectId,userId) VALUES (${data.projectId},"${data.userId}")`,
        function (err, rows) {
            if (err) {
                return res.status(500).send(err);
            }
            return res.status(200).send(rows);
        });
}


module.exports = router