var winston = require('winston');
require('winston-daily-rotate-file');
var moment = require('moment');
var path = require('path');
var fs = require('fs');
var conf = JSON.parse(fs.readFileSync("./config/config.json"));
if (conf.Mode == "dev") var LOGGER_FOLDER_PATH = path.join(__dirname, '../log', 'daily-');
else var LOGGER_FOLDER_PATH = '/LCS_B2B_NEW/log/daily-';


var transport = new(winston.transports.DailyRotateFile)({
    filename: LOGGER_FOLDER_PATH,
    timestamp: function() {
        return moment().format("YYYY-MM-DD HH:mm:ss.SSS");
    },
    datePattern: 'yyyyMMdd.log',
    level: process.env.ENV === 'development' ? 'debug' : 'info'
});

var logger = new(winston.Logger)({
    transports: [
        transport
    ]
});

logger.info('logger init!!');

winston.setLevels(winston.config.syslog.levels);
logger.setLevels(winston.config.syslog.levels);

module.exports = logger;
