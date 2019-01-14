var cors = require('cors')
var express = require('express')
var projects = require('./routes/projects')
var issues = require('./routes/issues')
var users = require('./routes/users')
var user_project = require('./routes/user_project')
var project_join_request = require('./routes/project_join_request')
var user_files = require('./routes/user_files')
var project_files = require('./routes/project_files')

var bodyParser = require('body-parser')

var fs = require('fs');

var app = express()

app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/users', users)
app.use('/user_files', user_files)
app.use('/project_files', project_files)
app.use('/projects', projects)
app.use('/issues', issues)
app.use('/user_project', user_project)
app.use('/project_join_request', project_join_request)

// respond with "hello world" when a GET request is made to the homepage
app.get('/', function (req, res) {
    res.send('hello Fercap')
})

app.get('/download', function (req, res) {
    // res.send(`${__dirname}/download/lake.jpg`)
    var file = `${__dirname}/download/lake.jpg`
    // let fileName = path.basename(req.url);
    // let file = path.join(__dirname, 'download', fileName)
    req.pipe(fs.createWriteStream(file));
    req.on('end', () => {
        res.writeHead(200, { 'Content-Type': 'text' });
        res.write('uploaded succesfully');
        res.end();
    })
    // res.download(`${__dirname}/lake.jpg`)

    // let file = path.join(__dirname, 'lake.jpg');
    // fs.readFile(file, (err, content) => {
    //     if (err) {
    //         res.writeHead(404, { 'Content-Type': 'text' });
    //         res.write('File Not Found!');
    //         res.end();
    //     } else {
    //         res.writeHead(200, { 'Content-Type': 'application/octet-stream' });
    //         res.write(content);
    //         res.end();
    //     }
    // })
})

app.listen(5000, function () {
    console.log('Dev app listening on port 5000!');
});