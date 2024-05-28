const fs = require('fs');

class Data {
    constructor(students, courses) {
        this.students = students;
        this.courses = courses;
    }
}

let dataCollection = null;

function initialize() {
    return new Promise((resolve, reject) => {
        fs.readFile('./data/students.json', 'utf8', (err, studentData) => {
            if (err) {
                return reject('unable to read students.json');
            }

            let students;
            try {
                students = JSON.parse(studentData);
            } catch (e) {
                return reject('error parsing students.json');
            }

            fs.readFile('./data/courses.json', 'utf8', (err, courseData) => {
                if (err) {
                    return reject('unable to read courses.json');
                }

                let courses;
                try {
                    courses = JSON.parse(courseData);
                } catch (e) {
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

function getTAs() {
    return new Promise((resolve, reject) => {
        if (dataCollection && dataCollection.students) {
            const TAs = dataCollection.students.filter(student => student.TA === true);
            if (TAs.length > 0) {
                resolve(TAs);
            } else {
                reject('no results returned');
            }
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

module.exports = { initialize, getAllStudents, getTAs, getCourses };
