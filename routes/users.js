var express = require('express')
var router = express.Router()
var mysql_conn = require('../sqlConnect')
var _ = require('lodash')
// var randomString = require('random-string')
var moment = require('moment')
var async = require('async')
//GET ALL USERS
router.get('/getAllUsers', function (req, res) {
    mysql_conn.query('SELECT * FROM users', function (err, rows) {
        if (err) {
            res.status(500).send(err);
        }

        var userObj = {}

        _.forEach(rows, user => {
            userObj[user.username] = {
                ...user,
                isAdmin: user.isAdmin === 1 ? true : false,
                isChecker: user.isChecker === 1 ? true : false
            }
        })

        res.status(200).json(userObj)
    });
    // res.send('hello world')
})

//CREATE USER
router.post('/createUser', function (req, res) {
    var data = req.body;
    
    async.waterfall([
        (cb) => { insertListPerson(data.userId, data, cb) },
        (cb) => { insertUser(data.userId, data, cb) },
        (cb) => { insertEthicCommittee(data.userId, data, cb) },

    ], (err, result) => {
        if (err) {
            return res.status(500).send(err);

        }
        return res.status(200).send(result)
    });
})

function insertUser(userId, data, cb) {

    var userInfo = data.userInfo
    if (userInfo.role === 'checker') {
        userInfo.isChecker = 1
    }
    var ethic = data.ethicCommitteeUser
    var selfAssess = data.selfAssessment
    mysql_conn.query(`INSERT INTO users (userId,firstName,lastName,registerDate,username,tel,isChecker,isAdmin,region,position,address,website,password,isActive,
        ecName,ecAddress,ecMainContract,ecIntro,ecYearEstablished,ecType,ecFrequencyMeet) VALUES
     ("${userId}","${ethic.firstName}","${ethic.lastName}","${moment().toISOString()}","${userInfo.region + "_" + userInfo.username}","${ethic.tel}",${userInfo.isChecker || 0},${userInfo.isAdmin || 0},"${userInfo.region}","${ethic.position}","${ethic.address}","${ethic.website}","${userInfo.password}",0,
     "${selfAssess.name}","${selfAssess.address}","${selfAssess.mainContractName}","${selfAssess.introduction}","${selfAssess.yearEstablished}","${selfAssess.type}","${selfAssess.frequencyMeeting}")`,
        function (err, rows) {
            if (err) {
                cb(err)
                return
            }
            cb()
        });
}
function insertEthicCommittee(userId, data, cb) {

    var ethic = data.ethicCommitteeUser
    mysql_conn.query(`INSERT INTO ethicCommittee (userId,firstName,lastName,address,tel,website,organize,position,des1,des2,des3,des4,des5,des6,des7) VALUES
     ("${userId}","${ethic.firstName}","${ethic.lastName}","${ethic.address}","${ethic.tel}","${ethic.website}","${ethic.organize}","${ethic.position}","${ethic.q1}","${ethic.q2}","${ethic.q3}","${ethic.q4}","${ethic.q5}","${ethic.q6}","${ethic.q7}")`,
        function (err, rows) {
            if (err) {
                cb(err)
                return
            }
            cb(null, rows)
        });
}
function insertListPerson(userId, data, cb) {
    var ethic = data.ethicCommitteeUser

    async.eachSeries(['contractPerson', 'listOfMember', 'listOfStaff', 'listOfSOP'],
        (tableName, cb2) => {
            insertListPersonLoop(ethic, userId, tableName, cb2)
        },
        (err, res) => {
            if (err) {
                cb(err)
                return
            }
            cb()
        })


}
function insertListPersonLoop(ethic, userId, tableName, cb2) {
    var table = ethic[tableName]
    async.eachSeries(table, (data, cb) => {
        mysql_conn.query(`INSERT INTO ${tableName} (userId,firstName,lastName,email,position) VALUES
        ("${userId}","${data.firstName}","${data.lastName}","${data.email}","${data.position}")`,
            function (err, rows) {
                if (err) {
                    cb(err)
                    return
                }
                cb(null, rows)
            });
    },
        (err, res) => {
            if (err) {
                cb2(err)
                return
            }
            cb2()
        })

}

//CHECK ALREADY USED USER
router.post('/checkExistUser', function (req, res) {
    var data = req.body;
    // res.status(200).send(data);

    mysql_conn.query(`SELECT username FROM users WHERE username="${data.username}"`, function (err, rows) {
        if (err) {
            res.status(500).send(err);
        }
        res.status(200).send(rows);
    });
})

//LOGIN
router.post('/logIn', function (req, res) {
    var data = req.body;
    mysql_conn.query(`SELECT * FROM users WHERE username="${data.username}" AND password="${data.password}"`, function (err, rows) {
        if (err) {
            return res.status(500).send(err);
        }
        return res.status(200).send(rows);
    });
})

//LOGIN
router.post('/getSingleUser', function (req, res) {
    var data = req.body;
    mysql_conn.query(`SELECT * FROM users WHERE userId="${data.userId}"`, function (err, rows) {
        if (err) {
            return res.status(500).send(err);
        }
        return res.status(200).send(rows);
    });
})

//FETCH ALL USER (LIMIT 50)
router.post('/fetchAllUsersLimit', function (req, res) {
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

    var sqlCommand = 'SELECT * FROM users WHERE isAdmin != 1'

    if (data.viewMode === 'User') {
        sqlCommand = sqlCommand + " and isChecker = 0"
    }

    if (data.viewMode === 'Surveyor') {
        sqlCommand = sqlCommand + " and isChecker = 1"
    }

    sqlCommand = sqlCommand + ` ORDER BY registerDate DESC ${limitString}`

    // viewMode

    // mysql_conn.query(`SELECT * FROM users WHERE isAdmin != 1 ORDER BY registerDate DESC ${limitString}`,
    mysql_conn.query(sqlCommand,

        function (err, rows) {
            if (err) {
                return res.status(500).send(err);
            }
            return res.status(200).send(rows);
        });
})

//GET PROJECT ROW COUNT
router.post('/getUsersRowCount', function (req, res) {
    var data = req.body;

    var sqlCommand = `SELECT COUNT(*) FROM users WHERE isAdmin = 0`
    if (data.viewMode === 'User') {
        sqlCommand = sqlCommand + ' and isChecker = 0'
    }
    if (data.viewMode === 'Surveyor') {
        sqlCommand = sqlCommand + ' and isChecker = 1'
    }

    mysql_conn.query(sqlCommand,
        function (err, rows) {
            if (err) {
                return res.status(500).send(err);
            }
            return res.status(200).send(rows);
        });
})

//FIND PROJECT BY FILTER INPUT
router.post('/filterUsers', function (req, res) {
    var data = req.body;

    var sqlCommand = 'SELECT * FROM users WHERE  isAdmin = 0'

    if (data.viewMode === 'User') {
        sqlCommand = sqlCommand + ' and isChecker = 0'
    }
    if (data.viewMode === 'Surveyor') {
        sqlCommand = sqlCommand + ' and isChecker = 1'
    }

    sqlCommand = sqlCommand + ` AND (firstName LIKE '%${data.filterInput}%' or lastName LIKE '%${data.filterInput}%')`

    mysql_conn.query(sqlCommand,
        function (err, rows) {
            if (err) {
                return res.status(500).send(err);
            }
            return res.status(200).send(rows);
        });
})

//FETCH USER PROJECT
router.post('/getUserInProject', function (req, res) {
    var data = req.body;

    mysql_conn.query(`
    SELECT users.*,user_project.userId FROM users
    LEFT JOIN user_project ON users.userId=user_project.userId
    WHERE user_project.projectId="${data.projectId}"
    ORDER BY firstName DESC
    `,
        function (err, rows) {
            if (err) {
                return res.status(500).send(err);
            }
            return res.status(200).send(rows);
        });
})

//SET ACTIVE USER
router.post('/setActiveUser', function (req, res) {
    var data = req.body;

    mysql_conn.query(`
    UPDATE users
    SET isActive = 1
    WHERE userId = "${data.userId}"
    `,
        function (err, rows) {
            if (err) {
                return res.status(500).send(err);
            }
            return res.status(200).send(rows);
        });
})

module.exports = router