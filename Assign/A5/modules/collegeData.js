const fs = require('fs');
const path = require('path');

class Data {
    constructor(students, courses) {
        this.students = students;
        this.courses = courses;
    }

    getStudentsByCourse(course) {
        return new Promise((resolve, reject) => {
            let studentsByCourse = this.students.filter(student => student.course === parseInt(course));
            if (studentsByCourse.length > 0) {
                resolve(studentsByCourse);
            } else {
                reject('no results returned');
            }
        });
    }

    getStudentByNum(num) {
        return new Promise((resolve, reject) => {
            let student = this.students.find(student => student.studentNum === parseInt(num));
            if (student) {
                resolve(student);
            } else {
                reject('no results returned');
            }
        });
    }

    addStudent(studentData) {
        return new Promise((resolve, reject) => {
            studentData.TA = studentData.TA ? true : false;
            studentData.studentNum = this.students.length + 1;
            this.students.push(studentData);
            fs.writeFile(path.join(__dirname, '../data', 'students.json'), JSON.stringify(this.students, null, 2), (err) => {
                if (err) {
                    reject('unable to write to students.json');
                } else {
                    resolve();
                }
            });
        });
    }

    getCourseById(id) {
        return new Promise((resolve, reject) => {
            let course = this.courses.find(course => course.courseId === parseInt(id));
            if (course) {
                resolve(course);
            } else {
                reject('query returned 0 results');
            }
        });
    }

    updateStudent(studentData) {
        return new Promise((resolve, reject) => {
            let studentIndex = this.students.findIndex(student => student.studentNum === parseInt(studentData.studentNum));
            if (studentIndex === -1) {
                return reject('Student not found');
            }
            this.students[studentIndex] = {
                ...this.students[studentIndex],
                ...studentData,
                studentNum: parseInt(studentData.studentNum),
                TA: studentData.TA === "on" ? true : false
            };
            fs.writeFile(path.join(__dirname, '../data', 'students.json'), JSON.stringify(this.students, null, 2), (err) => {
                if (err) {
                    reject('Unable to write to students.json');
                } else {
                    resolve();
                }
            });
        });
    }
}

let dataCollection = null;

function initialize() {
    return new Promise((resolve, reject) => {
        const studentFilePath = path.join(__dirname, '../data', 'students.json');
        const courseFilePath = path.join(__dirname, '../data', 'courses.json');
        console.log(`Reading students from ${studentFilePath}`);
        console.log(`Reading courses from ${courseFilePath}`);
        fs.readFile(studentFilePath, 'utf8', (err, studentData) => {
            if (err) {
                console.error('Error reading students.json:', err);
                return reject('unable to read students.json');
            }
            let students;
            try {
                students = JSON.parse(studentData);
            } catch (e) {
                console.error('Error parsing students.json:', e);
                return reject('error parsing students.json');
            }
            fs.readFile(courseFilePath, 'utf8', (err, courseData) => {
                if (err) {
                    console.error('Error reading courses.json:', err);
                    return reject('unable to read courses.json');
                }
                let courses;
                try {
                    courses = JSON.parse(courseData);
                } catch (e) {
                    console.error('Error parsing courses.json:', e);
                    return reject('error parsing courses.json');
                }
                dataCollection = new Data(students, courses);
                resolve();
            });
        });
    });
}

function getAllStudents() {
    return new Promise((resolve, reject) => {
        if (dataCollection && dataCollection.students && dataCollection.students.length > 0) {
            resolve(dataCollection.students);
        } else {
            reject('no results returned');
        }
    });
}

function getCourses() {
    return new Promise((resolve, reject) => {
        if (dataCollection && dataCollection.courses && dataCollection.courses.length > 0) {
            resolve(dataCollection.courses);
        } else {
            reject('no results returned');
        }
    });
}

function getStudentsByCourse(course) {
    return dataCollection.getStudentsByCourse(course);
}

function getStudentByNum(num) {
    return dataCollection.getStudentByNum(num);
}

function addStudent(studentData) {
    return dataCollection.addStudent(studentData);
}

function getCourseById(id) {
    return dataCollection.getCourseById(id);
}

function updateStudent(updatedStudent) {
    return dataCollection.updateStudent(updatedStudent);
}

module.exports = { initialize, getAllStudents, getCourses, getStudentsByCourse, getStudentByNum, addStudent, getCourseById, updateStudent };
