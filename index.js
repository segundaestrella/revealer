var express = require("express");
const cors = require('cors');
var bodyParser = require('body-parser');

var app = express();

var allowCrossDomain = function(req, res, next) {

    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');

    next();
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(allowCrossDomain);
app.use(cors());
app.use(express.static('public'));


var routes = require("./routes.js")(app);



var server = app.listen(9999, function () {
    console.log("Listening on port %s...", server.address().port);
});
