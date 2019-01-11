var express = require('express')
var router = express.Router()
var mysql_conn = require('../sqlConnect')
var _ = require('lodash')
var moment = require('moment')
var async = require('async')

//ASSIGN USER TO PROJECT
router.post('/assignUserToProject', function (req, res) {
    var data = req.body;
    // res.status(200).send(data);

    async.eachSeries(data.users,
        (user, cb) => {
            insertUser_Project(data.projectId, user.userId, cb)
        },
        (err, res2) => {
            if (err) {
                cb(err)
                res.status(500).send(err);
                return
            }
            res.status(200).send(res2);

        })
})

function insertUser_Project(projectId, userId, cb) {

    mysql_conn.query(`INSERT INTO user_project (projectId,userId) VALUES (${projectId},"${userId}")`,
        function (err, rows) {
            if (err) {
                cb(err)
                return
            }
            cb(null, rows)
        });
}

//UNASSIGN USER FROM PROJECT
router.post('/unAssignUserFromProject', function (req, res) {
    var data = req.body;
    // res.status(200).send(data);

    async.eachSeries(data.users,
        (user, cb) => {
            deleteUser_Project(data.projectId, user.userId, cb)
        },
        (err, res2) => {
            if (err) {
                cb(err)
                res.status(500).send(err);
                return
            }
            res.status(200).send(res2);

        })
})

function deleteUser_Project(projectId, userId, cb) {

    mysql_conn.query(` DELETE FROM user_project WHERE userId = "${userId}" AND projectId = ${projectId}`,
        function (err, rows) {
            if (err) {
                cb(err)
                return
            }
            cb(null, rows)
        });
}
module.exports = router
