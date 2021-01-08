var express = require("express");
var https = require("https");
var fs = require("fs");
var cors = require("cors");

var app = express();
app.set('port', 3000);
app.use(express.json());
app.use(cors());

var array = Array.of(100);
array[0] = {name: 'Kim', score: 10};

app.get("/scores", (req, res) => {
  res.json(array);
});


app.post("/scores", (req, res) => {
  array.push({
    name: req.body.name,
    score: req.body.score
  });
  array.sort((o1, o2) => {
    return o1.score - o2.score;
  });
  res.send("OK");
});

https.createServer({
  key: fs.readFileSync('/etc/letsencrypt/live/taekwon.kim-0001/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/taekwon.kim-0001/cert.pem')
}, app).listen(3000);

