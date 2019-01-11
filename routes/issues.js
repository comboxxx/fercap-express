var express = require('express')
var router = express.Router()
var mysql_conn = require('../sqlConnect')
var _ = require('lodash')
var moment = require('moment')
var async = require('async')


router.post('/createIssue', function (req, res) {
    var data = req.body;

    async.waterfall([
        (cb) => { insertIssue(data, cb) },

    ], (err, result) => {

        if (err) {
            return res.status(500).send(err);
        }
        return res.status(200).send(result)

    });
})

function insertIssue(data, cb) {

    mysql_conn.query(`INSERT INTO issues (projectId,byId,byName,name,status,timestamp,type) 
    VALUES ("${data.projectId}","${data.byId}","${data.byName}","${data.name}","${data.status}","${moment().toISOString()}","${data.type}")`,
        function (err, rows) {
            if (err) {
                cb(err)
                return
            }
            cb(null, rows)
        });
}

router.post('/fetchIssues', function (req, res) {
    var data = req.body;

    mysql_conn.query(`SELECT * FROM issues WHERE projectId = ${data.projectId}`,
        function (err, rows) {
            if (err) {
                return res.status(500).send(err);
            }
            return res.status(200).send(rows);
        });
})

router.post('/fetchSingleIssue', function (req, res) {
    var data = req.body;

    mysql_conn.query(`SELECT * FROM issues WHERE projectId = ${data.projectId} and issueId = ${data.issueId}`,
        function (err, rows) {
            if (err) {
                return res.status(500).send(err);
            }
            return res.status(200).send(rows);
        });
})

router.post('/addComment', function (req, res) {
    var data = req.body;

    mysql_conn.query(`INSERT INTO issue_comments (issueId,byId,byName,content,timestamp)
    VALUES ("${data.issueId}","${data.byId}","${data.byName}","${data.content}","${moment().toISOString()}")`,
        function (err, result) {
            if (err) {
                return res.status(500).send(err);
            }
            return res.status(200).send(result);
        });
})

router.post('/fetchComments', function (req, res) {
    var data = req.body;

    mysql_conn.query(`SELECT * FROM issue_comments WHERE issueId = ${data.issueId}`,
        function (err, rows) {
            if (err) {
                return res.status(500).send(err);
            }
            return res.status(200).send(rows);
        });
})
module.exports = router