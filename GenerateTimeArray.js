// Generate an array of timestamps in seconds from NOW, every 0.1 seconds
// use as following: `node GenerateTimeArray.js > t1.json`

var initialTime = new Date()

var voltam1 = require('./voltamData1.js'),
    voltam2 = require('./voltamData2.js');

/*
console.log('v1, x: ', voltam1.x.length, ', and y: ', voltam1.y.length);
console.log('v2, x: ', voltam2.x.length, ', and y: ', voltam2.y.length);
*/

var t1 = [],
    t2 = [],
    initTime = new Date().getTime() / 1000;

for(var i=0; i<5070; i++) {
  t1.push(initTime + 0.1)
}

for(var i=0; i<5086; i++) {
  t2.push(initTime + 0.1)
}

console.log(JSON.stringify(t2));

