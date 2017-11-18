var express = require('express');
var app = express();
var util = require('util');
var path = require('path');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var http = require('http');
var https = require('https');
var fs = require('fs');
var io = require('./libs/io');
var dbConn = require('./libs/oraclePoolConnection.js');
var logger = require('./config/logger');

//config
var conf = JSON.parse(fs.readFileSync("./config/config.json"));
var webPort = conf.WebPort;
var httpsWebPort = conf.SecureWebPort;

var options = {
    //key: fs.readFileSync('./public/ssl/key.pem'),
    //cert: fs.readFileSync('./public/ssl/cert.pem'),
    requestCert: true,
    passphrase: '1234'
};

var server = "";

if (conf.SecureOnOff) {
    // https 용
    server = https.createServer(options, app).listen(httpsWebPort, function() {
        logger.info("Https server listening on port " + httpsWebPort);
    });
} else {
    // http 용
    server = http.createServer(app).listen(webPort, function() {
        logger.info("Http server listening on port " + webPort);
    });
}

dbConn.init();

app.use(function https(req, res, next) {
    if (!req.secure && conf.SecureOnOff) {
        return res.redirect('https://' + req.headers.host + req.url);
    }
    next();
});

//view engine
app.set("view engine", 'ejs');

app.use(express.static(path.join(__dirname, 'public')));

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(session({
    secret: 'secret key',
    key: 'ltelcs_LGD',
    proxy: true,
    resave: true,
    saveUninitialized: true,
    cookie: {
        //        secure: true,
        httpOnly: true
    }
}));

//---------------------------------------------------------------------------------------------
//router
//---------------------------------------------------------------------------------------------
//checkAuth
app.use("/", require('./routes/checkAuth'));
//login, logout, logout2
app.use("/", require('./routes/login'));
//status
app.use("/", require('./routes/status'));
//report
app.use("/", require('./routes/report'));
//setup
app.use("/", require('./routes/setup'));
//setup
app.use("/", require('./routes/pcViewer'));
//setup
app.use("/", require('./routes/channelNotice'));
//mobile
app.use("/", require('./routes/mobile'));
//channel
app.use("/", require('./routes/channel'));

//---------------------------------------------------------------------------------------------
// client socket.io
//---------------------------------------------------------------------------------------------
io.attach(server);

logger.info("WEB Server Start **");
console.log("WEB Server Start $$");
