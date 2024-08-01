const pool = require('../db'); // Import the PostgreSQL pool connection

class Data {
    async getStudentsByCourse(course) {
        try {
            const result = await pool.query('SELECT * FROM students WHERE course = $1', [course]);
            return result.rows;
        } catch (error) {
            throw new Error('No results returned');
        }
    }

    async getStudentByNum(num) {
        try {
            const result = await pool.query('SELECT * FROM students WHERE "studentNum" = $1', [num]);
            return result.rows[0];
        } catch (error) {
            throw new Error('No results returned');
        }
    }

    async addStudent(studentData) {
        try {
            const result = await pool.query(
                `INSERT INTO students ("firstName", "lastName", email, "addressStreet", "addressCity", "addressProvince", TA, status, course)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING "studentNum"`,
                [studentData.firstName, studentData.lastName, studentData.email, studentData.addressStreet,
                 studentData.addressCity, studentData.addressProvince, studentData.TA, studentData.status, studentData.course]
            );
            studentData.studentNum = result.rows[0].studentNum;
            return studentData;
        } catch (error) {
            console.error('Error adding student:', error.message); // Log the error message
            throw new Error('Unable to add student: ' + error.message);
        }
    }

    async getCourseById(id) {
        try {
            const result = await pool.query('SELECT * FROM courses WHERE "courseId" = $1', [id]);
            if (result.rows.length === 0) {
                throw new Error('Course not found');
            }
            return result.rows[0];
        } catch (error) {
            // Log the error or handle it as needed
            console.error('Error retrieving course:', error.message);
            throw new Error('Error retrieving course');
        }
    }

    async updateStudent(studentData) {
        try {
            const result = await pool.query(
                `UPDATE students
                 SET "firstName" = $1, "lastName" = $2, "email" = $3, "addressStreet" = $4, "addressCity" = $5, 
                     "addressProvince" = $6, TA = $7, status = $8, course = $9
                 WHERE "studentNum" = $10`,
                [studentData.firstName, studentData.lastName, studentData.email, studentData.addressStreet,
                 studentData.addressCity, studentData.addressProvince, studentData.TA, studentData.status, studentData.course, studentData.studentNum]
            );
            if (result.rowCount === 0) {
                throw new Error('Student not found');
            }
            return;
        } catch (error) {
            throw new Error('Unable to update student');
        }
    }
}

let dataCollection = new Data();

async function initialize() {
    try {
        // This function might be used for any initial setup if needed
        return;
    } catch (error) {
        throw new Error('Unable to initialize data');
    }
}

async function getAllStudents() {
    try {
        const result = await pool.query('SELECT * FROM students order by "studentNum"');
        return result.rows;
    } catch (error) {
        throw new Error('No results returned');
    }
}

async function getCourses() {
    try {
        const result = await pool.query('SELECT * FROM courses');
        return result.rows;
    } catch (error) {
        throw new Error('No results returned');
    }
}

module.exports = {
    initialize,
    getAllStudents,
    getCourses,
    getStudentsByCourse: (course) => dataCollection.getStudentsByCourse(course),
    getStudentByNum: (num) => dataCollection.getStudentByNum(num),
    addStudent: (studentData) => dataCollection.addStudent(studentData),
    getCourseById: (id) => dataCollection.getCourseById(id),
    updateStudent: (studentData) => dataCollection.updateStudent(studentData),
};
