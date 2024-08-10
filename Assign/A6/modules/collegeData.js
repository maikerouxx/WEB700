const Sequelize = require('sequelize');


var sequelize = new Sequelize('web700A6', 'web700A6_owner', 'dKEkY6wpN7WB', {     
    host: 'ep-frosty-heart-a5saryhq.us-east-2.aws.neon.tech',     
    dialect: 'postgres',     
    port: 5432,     
    dialectOptions: { 
        ssl: { rejectUnauthorized: false } 
    }, 
    query: { raw: true } 
});


/*
const sequelize = new Sequelize(
    process.env.DB_NAME,        // Database name
    process.env.DB_USER,        // Database user
    process.env.DB_PASSWORD,    // Database password
    {
      host: process.env.DB_HOST,     // Database host
      port: process.env.DB_PORT || 5432, // Database port (default 5432)
      dialect: 'postgres',
      dialectOptions: {
        ssl: { rejectUnauthorized: false } // SSL option for secure connection
      },
      query: { raw: true }
    }
  );

*/

const Student = sequelize.define('student', {
    studentNum: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    firstName: {
        type: Sequelize.STRING
    },
    lastName: {
        type: Sequelize.STRING
    },
    email: {
        type: Sequelize.STRING
    },
    addressStreet: {
        type: Sequelize.STRING
    },
    addressCity: {
        type: Sequelize.STRING
    },
    addressProvince: {
        type: Sequelize.STRING
    },
    TA: {
        type: Sequelize.BOOLEAN
    },
    status: {
        type: Sequelize.STRING
    },
    course: {
        type: Sequelize.INTEGER
    }
});

const Course = sequelize.define('course', {
    courseId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    courseCode: {
        type: Sequelize.STRING
    },
    courseDescription: {
        type: Sequelize.STRING
    }
});

Course.hasMany(Student, { foreignKey: 'course' });


function initialize() {
    return new Promise((resolve, reject) => {
        sequelize.sync()
            .then(() => resolve())
            .catch(() => reject("unable to sync the database"));
    });
}

function getAllStudents() {
    return new Promise((resolve, reject) => {
        Student.findAll()
            .then(data => resolve(data))
            .catch(() => reject("no results returned"));
    });
}

function getStudentsByCourse(course) {
    return new Promise((resolve, reject) => {
        Student.findAll({
            where: { course: course }
        })
        .then(data => resolve(data))
        .catch(() => reject("no results returned"));
    });
}

function getStudentByNum(num) {
    return new Promise((resolve, reject) => {
        Student.findAll({
            where: { studentNum: num }
        })
        .then(data => resolve(data[0]))
        .catch(() => reject("no results returned"));
    });
}

function getCourses() {
    return new Promise((resolve, reject) => {
        Course.findAll()
            .then(data => resolve(data))
            .catch(() => reject("no results returned"));
    });
}

function getCourseById(id) {
    return new Promise((resolve, reject) => {
        Course.findAll({
            where: { courseId: id }
        })
        .then(data => resolve(data[0]))
        .catch(() => reject("no results returned"));
    });
}

async function addStudent(studentData) {
    try {
        // Find the highest existing student number
        const highestStudentNum = await Student.max('studentNum');

        // Increment the highest student number by 1 for the new student
        const newStudentNum = highestStudentNum ? highestStudentNum + 1 : 1;

        // Set the new student number
        studentData.studentNum = newStudentNum;

        // Ensure TA is a boolean
        studentData.TA = !!studentData.TA;

        // Set any empty string values to null
        for (let prop in studentData) {
            if (studentData[prop] === "") {
                studentData[prop] = null;
            }
        }

        // Create the new student with the incremented student number
        await Student.create(studentData);

        // Return a resolved promise if creation is successful
        return Promise.resolve();
    } catch (err) {
        // Log and reject the promise if an error occurs
        console.error("Error creating student:", err);
        return Promise.reject("Unable to create student: " + err.message);
    }
}

function updateStudent(studentData) {
    return new Promise((resolve, reject) => {
        studentData.TA = (studentData.TA) ? true : false;

        for (let prop in studentData) {
            if (studentData[prop] === "") {
                studentData[prop] = null;
            }
        }

        Student.update(studentData, {
            where: { studentNum: studentData.studentNum }
        })
        .then(() => resolve())
        .catch(() => reject("unable to update student"));
    });
}

async function addCourse(courseData) {
    try {
        // Find the highest existing course ID
        const highestCourse = await Course.max('courseId');

        // Increment the highest course ID by 1 for the new course
        const newCourseId = highestCourse ? highestCourse + 1 : 1;

        // Set the new course ID
        courseData.courseId = newCourseId;

        // Set any empty string values to null
        for (let prop in courseData) {
            if (courseData[prop] === "") {
                courseData[prop] = null;
            }
        }

        // Create the new course with the incremented ID
        await Course.create(courseData);

        // Return a resolved promise if creation is successful
        return Promise.resolve();
    } catch (err) {
        // Log and reject the promise if an error occurs
        console.error("Error creating course:", err);
        return Promise.reject("Unable to create course: " + err.message);
    }
}

function updateCourse(courseData) {
    return new Promise((resolve, reject) => {
        // Set any empty string values to null
        for (let prop in courseData) {
            if (courseData[prop] === "") {
                courseData[prop] = null;
            }
        }

        Course.update(courseData, {
            where: { courseId: courseData.courseId }
        })
        .then(() => resolve())
        .catch(() => reject("unable to update course"));
    });
}

async function deleteCourseById(id) {
    try {
        // Check if any students are enrolled in the course
        const studentsEnrolled = await Student.count({
            where: { course: id }
        });

        if (studentsEnrolled > 0) {
            // If students are enrolled, reject the promise with a message
            return Promise.reject("Cannot delete course because students are still enrolled.");
        }

        // If no students are enrolled, proceed with deletion
        await Course.destroy({
            where: { courseId: id }
        });

        // Resolve the promise if deletion is successful
        return Promise.resolve();
    } catch (err) {
        // Log and reject the promise if an error occurs
        console.error("Error deleting course:", err);
        return Promise.reject("Unable to delete course: " + err.message);
    }
}

// Function to delete a student by their student number
function deleteStudentByNum(studentNum) {
    return new Promise((resolve, reject) => {
        Student.destroy({
            where: { studentNum: studentNum }
        })
        .then((result) => {
            if (result === 1) { // 1 row affected means student deleted
                resolve();
            } else {
                reject("Student not found");
            }
        })
        .catch((err) => {
            reject(err);
        });
    });
}



module.exports = { initialize, getAllStudents, getCourses, getStudentsByCourse, getStudentByNum, addStudent, getCourseById, updateStudent, addCourse, updateCourse, deleteCourseById, deleteStudentByNum };

