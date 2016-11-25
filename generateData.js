var token = 'civwen9gt67yr7jyq7f6d4a4i';
var https = require("https");

var options = {
    hostname: 'bvdemo.pryv.me',
    path: '/?auth=' + token,
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

    var content = [
        {
            "method": "events.create",
            "params": {
                "streamId": "biovotion-bpm",
                "type": "frequency/bpm",
                "content": Math.floor(70 + Math.random()*10)
            }
        },
        {
            "method": "events.create",
            "params": {
                "streamId": "biovotion-bpm",
                "type": "pressure/mmhg",
                "content": Math.floor(70 + Math.random()*10)
            }
        }
    ];

    req.write(JSON.stringify(content));
    req.end();

    setTimeout(generate, 1000);
};

generate();