const HTTP_PORT = process.env.PORT || 8080;
const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const app = express();
const collegeData = require('./modules/collegeData');
const { body, validationResult } = require('express-validator');

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'local')));
//app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));

// Configure Handlebars
const hbs = exphbs.create({
    extname: '.hbs',
    defaultLayout: 'main',
    helpers: {
        navLink: (url, options) => 
            `<li${(url === app.locals.activeRoute) ? ' class="nav-item active"' : ' class="nav-item"'}><a class="nav-link" href="${url}">${options.fn(this)}</a></li>`,
        equal: (lvalue, rvalue, options) => 
            (lvalue !== rvalue) ? options.inverse(this) : options.fn(this),
    }
});

app.engine('.hbs', hbs.engine);
app.set('view engine', '.hbs');

// Middleware for setting the active route
app.use((req, res, next) => {
    let route = req.path.substring(1);
    app.locals.activeRoute = `/${isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, "")}`;
    next();
});

// Routes
app.get('/students', async (req, res) => {
    try {
        const courseId = req.query.course;
        let students;

        if (courseId) {
            // Fetch students filtered by the course ID
            students = await collegeData.getStudentsByCourse(courseId);
            
        } else {
            // Fetch all students
            students = await collegeData.getAllStudents();
        }

        //Sort by Student Number
        students = students.sort((a, b) => a.studentNum - b.studentNum);
        // Render the students view with the fetched data
        res.render('students', { students: students.length > 0 ? students : [], message: students.length === 0 ? 'No results' : '' });
    } catch (error) {
        console.error('Error getting students:', error);
        res.render('students', { message: 'Error fetching students' });
    }
});





app.get('/courses', async (req, res) => {
    try {
        let data = await collegeData.getCourses();

        // Order courses by courseId if getCourses does not handle ordering
        data = data.sort((a, b) => a.courseId - b.courseId);

        if (data.length > 0) {
            res.render("courses", { courses: data });
        } else {
            res.render("courses", { message: "no results" });
        }
    } catch (err) {
        console.error('Error fetching courses:', err);
        res.render("courses", { message: "no results" });
    }
});

// Render the add course form
app.get('/courses/add', (req, res) => {
    res.render('addCourse');
});

// Handle adding a new course
app.post('/courses/add', (req, res) => {
    collegeData.addCourse(req.body)
        .then(() => res.redirect('/courses'))
        .catch(() => res.status(500).send("Unable to create course"));
});

// Handle updating a course
app.post('/course/update', (req, res) => {
    collegeData.updateCourse(req.body)
        .then(() => res.redirect('/courses'))
        .catch(() => res.status(500).send("Unable to update course"));
});

// Render the update course form or show a 404 error if course not found
app.get('/course/:id', (req, res) => {
    collegeData.getCourseById(req.params.id)
        .then(data => {
            if (!data) {
                res.status(404).send("Course Not Found");
            } else {
                res.render('course', { course: data });
            }
        })
        .catch(() => res.status(500).send("Unable to fetch course details"));
});

// Handle deleting a course
app.get('/course/delete/:id', async (req, res) => {
    try {
        await collegeData.deleteCourseById(req.params.id);
        res.redirect('/courses');
    } catch (err) {
        console.error('Error deleting course:', err);
        res.status(500).send(err); // Send the error message to the client
    }
});

app.get("/student/:studentNum", (req, res) => {
    // Initialize an empty object to store the values
    let viewData = {};

    // Fetch student data by student number
    collegeData.getStudentByNum(req.params.studentNum)
        .then((studentData) => {
            if (studentData) {
                viewData.student = studentData; // Store student data in the "viewData" object as "student"
            } else {
                viewData.student = null; // Set student to null if none were returned
            }
        })
        .catch((err) => {
            viewData.student = null; // Set student to null if there was an error
            console.error('Error fetching student data:', err);
        })
        .then(() => {
            // Fetch all courses
            return collegeData.getCourses(); // Ensure you're calling the correct function
        })
        .then((coursesData) => {
            viewData.courses = coursesData; // Store course data in the "viewData" object as "courses"

            // Loop through viewData.courses and add a "selected" property to the matching course
            if (viewData.student) {
                viewData.courses.forEach(course => {
                    if (course.courseId == viewData.student.course) {
                        course.selected = true;
                    }
                });
            }
        })
        .catch((err) => {
            viewData.courses = []; // Set courses to empty if there was an error
            console.error('Error fetching courses data:', err);
        })
        .finally(() => {
            // Render the student view if student data exists
            if (viewData.student === null) {
                res.status(404).send("Student Not Found"); // Return an error if no student is found
            } else {
                res.render("student", { viewData: viewData }); // Render the "student" view with viewData
            }
        });
});



app.post('/student/update', (req, res) => {
    console.log('Received data:', req.body);  // Debugging line

    // Ensure `course` is an integer
    const updatedStudentData = {
        ...req.body,
        course: parseInt(req.body.course, 10) // Convert course to integer
    };

    collegeData.updateStudent(updatedStudentData)
        .then(() => {
            res.redirect('/students');
        })
        .catch((error) => {
            console.error('Error updating student:', error);
            res.status(500).send('Error updating student');
        });
});

app.get('/', (req, res) => res.render('home'));
app.get('/about', (req, res) => res.render('about'));
app.get('/htmlDemo', (req, res) => res.render('htmlDemo'));
app.get('/students/add', (req, res) => {
    collegeData.getCourses()
        .then(courses => {
            res.render('addStudent', { courses: courses });
        })
        .catch(() => {
            res.render('addStudent', { courses: [], message: 'No courses available' });
        });
});

// Handle adding a student with validation
app.post('/students/add',
    [
        body('course').isInt({ min: 1 }).withMessage('Course must be a valid number'),
        // Add other validation rules as needed
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            // Fetch courses again to repopulate the dropdown
            try {
                const courses = await collegeData.getCourses();
                return res.render('addStudent', { 
                    courses: courses, 
                    errors: errors.array(), 
                    studentData: req.body 
                });
            } catch (err) {
                console.error('Error fetching courses:', err);
                return res.status(500).send('Error rendering form: ' + err);
            }
        }

        try {
            const studentData = {
                ...req.body,
                course: parseInt(req.body.course, 10)
            };

            await collegeData.addStudent(studentData);
            res.redirect('/students');
        } catch (err) {
            console.error('Error adding student:', err);
            res.status(500).send('Error adding student: ' + err);
        }
    }
);

// Route to delete a student
app.get('/student/delete/:studentNum', (req, res) => {
    const studentNum = req.params.studentNum;

    collegeData.deleteStudentByNum(studentNum)
        .then(() => {
            res.redirect('/students');
        })
        .catch((err) => {
            console.error('Error deleting student:', err);
            res.status(500).send('Unable to Remove Student / Student not found');
        });
});

// Handle 404
app.use((req, res) => res.status(404).send('Page Not Found'));

// Start server
collegeData.initialize().then(() => {
    app.listen(HTTP_PORT, () => console.log(`Server listening on port ${HTTP_PORT}`));
}).catch(err => console.error(`Failed to initialize data: ${err}`));

module.exports = app;
