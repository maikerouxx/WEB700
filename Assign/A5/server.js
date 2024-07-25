/*********************************************************************************
*  WEB700 – Assignment 05
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part 
*  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Michael Jo Arron Encinares Student ID: 151100237 Date: 26-July-2024

*  Online (vercel) Link: https://vercel.com/new/michael-jo-arron-encinares-projects
*
********************************************************************************/ 





var HTTP_PORT = process.env.PORT || 8080;
var express = require ("express");
const exphbs = require('express-handlebars');
var app = express();
const path = require('path');
var collegeData = require('./modules/collegeData');
module.exports = app;
app.use(express.static('local'));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));


// Define the helpers
const hbs = exphbs.create({
    extname: '.hbs',
    defaultLayout: 'main',
    helpers: {
        navLink: function(url, options){
            return '<li' + 
                ((url == app.locals.activeRoute) ? ' class="nav-item active" ' : ' class="nav-item" ') + 
                '><a class="nav-link" href="' + url + '">' + options.fn(this) + '</a></li>';
        },
        equal: function (lvalue, rvalue, options) {
            if (arguments.length < 3)
                throw new Error("Handlebars Helper equal needs 2 parameters");
            if (lvalue != rvalue) {
                return options.inverse(this);
            } else {
                return options.fn(this);
            }
        }
    }
});

// Configure handlebars
app.engine('.hbs', hbs.engine);
app.set('view engine', '.hbs');

// Define the "views" folder structure
app.set('views', path.join(__dirname, 'views'));


// Middleware to set the active route
app.use((req, res, next) => {
    let route = req.path.substring(1);
    app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));    
    next();
});



//Setup a 'route' to listen on the url path

// Updated /students route
app.get('/students', (req, res) => {
    collegeData.getAllStudents()
        .then((data) => {
            if (data.length > 0) {
                res.render('students', { students: data });
            } else {
                res.render('students', { message: 'no results' });
            }
        })
        .catch((err) => {
            res.render('students', { message: 'no results' });
        });
});



// Updated /courses route
app.get('/courses', (req, res) => {
    collegeData.getCourses()
        .then((data) => {
            if (data.length > 0) {
                res.render('courses', { courses: data });
            } else {
                res.render('courses', { message: 'no results' });
            }
        })
        .catch((err) => {
            res.render('courses', { message: 'no results' });
        });
});


// Updated /course/:id route
app.get('/course/:id', (req, res) => {
    collegeData.getCourseById(req.params.id)
        .then(course => res.render('course', { course: course }))
        .catch(error => res.render('course', { message: error }));
});


// Updated /student/num
app.get("/student/:studentNum", (req, res) => {
    const studentNum = req.params.studentNum;

    collegeData.getStudentByNum(studentNum)
        .then(student => {
            // Fetch courses to populate the dropdown
            return collegeData.getCourses().then(courses => {
                res.render("student", { student, courses });
            });
        })
        .catch(err => {
            res.status(404).send("Student not found");
        });
});

// Update the POST route for updating student data
app.post('/student/update', (req, res) => {
    collegeData.updateStudent(req.body)
        .then(() => {
            res.redirect('/students');
        })
        .catch((error) => {
            console.error('Error updating student:', error);
            res.status(500).send('Error updating student');
        });
});




// GET /
app.get('/', (req, res) => {
    res.render('home');
});

// GET /about
app.get('/about', (req, res) => {
    res.render('about');
});

// GET /htmlDemo
app.get('/htmlDemo', (req, res) => {
    res.render('htmlDemo');
});

// GET /students/add
app.get('/students/add', (req, res) => {
    res.render('addStudent');
});

//GET /student/data
app.get('/students/data', async (req, res) => {
    try {
        const students = await collegeData.getAllStudents();
        res.json(students);
    } catch (error) {
        res.json({ message: "no results" });
    }
});


app.get("/student/:studentNum", (req, res) => {
    const studentNum = req.params.studentNum;

    getStudentByNum(studentNum)
        .then(student => {
            getCourses().then(courses => {
                res.render("student", { student: student, courses: courses });
            }).catch(err => {
                console.error('Error fetching courses:', err);
                res.status(500).send('Internal Server Error');
            });
        })
        .catch(err => {
            console.error('Error fetching student:', err);
            res.status(404).send('Student Not Found');
        });
});


//POST /student/update

app.post("/student/update", (req, res) => {
    console.log(req.body);
    res.redirect("/students");
});



// POST /students/add
app.post('/students/add', (req, res) => {
    console.log('Received student data:', req.body);
    collegeData.addStudent(req.body)
        .then(() => {
            console.log('Student added successfully');
            res.redirect('/students');
        })
        .catch((err) => {
            console.error('Error adding student:', err);
            res.status(500).send('Error adding student: ' + err);
        });
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

