const HTTP_PORT = process.env.PORT || 8080;
const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const app = express();
const collegeData = require('./modules/collegeData');
const { body, validationResult } = require('express-validator');

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'local')));
app.use(express.static(path.join(__dirname, 'public')));
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
        const course = req.query.course;
        let students;

        if (course) {
            students = await collegeData.getStudentsByCourse(course);
        } else {
            students = await collegeData.getAllStudents();
        }

        res.render('students', students.length > 0 ? { students } : { message: 'no results' });
    } catch (error) {
        console.error('Error getting students:', error);
        res.render('students', { message: 'no results' });
    }
});


app.get('/courses', async (req, res) => {
    try {
        const data = await collegeData.getCourses();
        res.render('courses', data.length > 0 ? { courses: data } : { message: 'no results' });
    } catch (error) {
        console.error('Error getting courses:', error);
        res.render('courses', { message: 'no results' });
    }
});

app.get('/course/:id', async (req, res) => {
    try {
        const course = await collegeData.getCourseById(req.params.id);
        res.render('course', { course });
    } catch (error) {
        console.error('Error getting course by ID:', error);
        res.render('course', { message: error });
    }
});

app.get("/student/:studentNum", async (req, res) => {
    try {
        const student = await collegeData.getStudentByNum(req.params.studentNum);
        const courses = await collegeData.getCourses();
        res.render("student", { student, courses });
    } catch (error) {
        console.error('Error getting student by number:', error);
        res.status(404).send("Student not found");
    }
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
app.get('/students/add', (req, res) => res.render('addStudent'));


app.post('/students/add',
    [
        body('course').isInt({ min: 1 }).withMessage('Course must be a valid number')
        // Add other validation rules as needed
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
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

// Handle 404
app.use((req, res) => res.status(404).send('Page Not Found'));

// Start server
collegeData.initialize().then(() => {
    app.listen(HTTP_PORT, () => console.log(`Server listening on port ${HTTP_PORT}`));
}).catch(err => console.error(`Failed to initialize data: ${err}`));

module.exports = app;
