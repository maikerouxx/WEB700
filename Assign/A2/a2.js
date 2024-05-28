/*********************************************************************************
*  WEB700 – Assignment 2
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  
*  No part of this assignment has been copied manually or electronically from any other source
*  (including web sites) or distributed to other students.
* 
*  Name: Michael Jo Arron Encinares Student ID: 151100237 Date: 28-May-2024
*
********************************************************************************/ 





const collegeData = require('./modules/collegeData');

// Initialize the data
collegeData.initialize()
    .then(() => {
        

        // Get all students
        return collegeData.getAllStudents();
    })
    .then(students => {
        console.log(`Successfully retrieved ${students.length} students`);

        // Get all courses
        return collegeData.getCourses();
    })
    .then(courses => {
        console.log(`Successfully retrieved ${courses.length} courses`);

        // Get all TAs
        return collegeData.getTAs();
    })
    .then(TAs => {
        console.log(`Successfully retrieved ${TAs.length} TAs`);
    })
    .catch(err => {
        console.error(err);
    });
