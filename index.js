var cors = require('cors')
var express = require('express')
var projects = require('./routes/projects')
var issues = require('./routes/issues')
var users = require('./routes/users')
var user_project = require('./routes/user_project')
var project_join_request = require('./routes/project_join_request')
var user_files = require('./routes/user_files')



var bodyParser = require('body-parser')


var app = express()

app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/users', users)
app.use('/user_files', user_files)
app.use('/projects', projects)
app.use('/issues', issues)
app.use('/user_project', user_project)
app.use('/project_join_request', project_join_request)

// respond with "hello world" when a GET request is made to the homepage
app.get('/', function (req, res) {
    res.send('hello Fercap')
})

app.listen(5000, function () {
    console.log('Dev app listening on port 5000!');
});