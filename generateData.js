var token = 'civwen9gt67yr7jyq7f6d4a4i';
var https = require("https");

var options = {
    hostname: 'bvdemo.pryv.me',
    path: '/events?auth=' + token,
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    }
};

var generate = function() {
    var req = https.request(options, function(res) {
        res.setEncoding('utf8');
        res.on('data', function (body) {
            console.log('Body: ' + body);
        });
    });
    req.on('error', function(e) {
        console.log('problem with request: ' + e.message);
    });

    var content = '{"streamId":"biovotion-bpm","type":"frequency/bpm","content":' + Math.floor(Math.random()*100) + '}';
    req.write(content);
    req.end();

    setTimeout(generate, 1000);
};

generate();