/*********************************************************************************
*  WEB700 – Assignment 1
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  
*  No part of this assignment has been copied manually or electronically from any other source
*  (including web sites) or distributed to other students.
* 
*  Name: Michael Jo Arron Encinares Student ID: 151100237 Date: 17 May 2024
*
********************************************************************************/ 


const serverVerbs = ["GET", "GET", "GET", "POST", "GET", "POST"];
const serverPaths = ["/", "/about", "/contact", "/login", "/panel", "/logout"];
const serverResponse = ["Welcome to WEB700 Assignment 1", "This assignment was prepared by Michael", "Michael Encinares: mjaencinares@myseneca.ca", "User Logged In", "Main Panel", "Logout Complete"];



function httpRequest(httpVerbs, httpPaths) {
   
    for(let i = 0; i < serverVerbs.length; i++){
        if (httpVerbs === serverVerbs[i] && httpPaths === serverPaths[i])
        {
            console.log(`200:${serverResponse[i]}`);
            return;
            
        }
    }
       
    console.log(`404:Unable to process ${httpVerbs} request for ${httpPaths}`);

}



    
function automateTest() {
    const testVerbs = ["GET", "POST"];
    const testPaths = ["/", "/about", "/contact", "/login", "/panel", "/logout", "randomPath1", "randomPath2"];

    function randomRequest() {
        const randomVerb = testVerbs[Math.floor(Math.random() * testVerbs.length)];
        const randomPath = testPaths[Math.floor(Math.random() * testPaths.length)];
        const result = httpRequest(randomVerb, randomPath, serverVerbs, serverPaths, serverResponse);
    }

    setInterval(randomRequest, 1000);
}

    
automateTest();

