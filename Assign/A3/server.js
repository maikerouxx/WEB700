/*********************************************************************************
*  WEB700 – Assignment 03
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part 
*  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Michael Jo Arron Encinares Student ID: 151100237 Date: 22-June-2024
********************************************************************************/ 





var HTTP_PORT = process.env.PORT || 8080;
var express = require ("express");
var app = express();
const path = require('path');
var collegeData = require('./modules/collegeData');
module.exports = app;
app.use(express.static('views'))


//Setup a 'route' to listen on the url path

// GET /students
app.get('/students', async (req, res) => {
    try {
        const course = req.query.course;
        let students;

        if (course) {
            students = await collegeData.getStudentsByCourse(course);
        } else {
            students = await collegeData.getAllStudents();
        }

        if (students && students.length > 0) {
            res.json(students);
        } else {
            res.json({ message: "no results" });
        }
    } catch (error) {
        res.json({ message: "no results" });
    }
});

// GET /tas
app.get('/tas', async (req, res) => {
    try {
        const tas = await collegeData.getTAs();

        if (tas && tas.length > 0) {
            res.json(tas);
        } else {
            res.json({ message: "no results" });
        }
    } catch (error) {
        res.json({ message: "no results" });
    }
});

// GET /courses
app.get('/courses', async (req, res) => {
    try {
        const courses = await collegeData.getCourses();

        if (courses && courses.length > 0) {
            res.json(courses);
        } else {
            res.json({ message: "no results" });
        }
    } catch (error) {
        res.json({ message: "no results" });
    }
});

// GET /student/num
app.get('/student/:num', async (req, res) => {
    try {
        const studentNum = req.params.num;
        const student = await collegeData.getStudentByNum(studentNum);

        if (student) {
            res.json(student);
        } else {
            res.json({ message: "no results" });
        }
    } catch (error) {
        res.json({ message: "no results" });
    }
});

// GET /
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'home.html'));
});

// GET /about
app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'about.html'));
});

// GET /htmlDemo
app.get('/htmlDemo', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'htmlDemo.html'));
});

// Handle 404
app.use((req, res) => {
    res.status(404).send('Page Not Found');
});



//Setup http server to listen to HTTP_PORT

collegeData.initialize().then(() => {
    
    app.listen(HTTP_PORT, ()=>{console.log("server listening on port" + HTTP_PORT)});

}).catch((err) => {
    console.error(`Failed to initialize data: ${err}`);
});

