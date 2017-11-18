var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var logger = require('../config/logger');
var oracledb = require('oracledb');
var dbConfig = require('../config/dbconfig.js');
//var dbConn = require('../libs/oracleConnection.js');
var dbConn = require('../libs/oraclePoolConnection.js');
var util = require('util');
var utilLib = require('../libs/utilLib');
var io = require('../libs/io');

router.get('/', function(req, res) {
    res.redirect('/status');
});
router.get('/login', function(req, res) {
    logger.info('Path change : /login');
    if (!req.session.userid) {
        res.render('login', {
            data: {
                error: '0'
            }
        });
    } else {
        res.redirect('/status');
    }
});

router.post('/login', function(req, res) {
    logger.info('Path change : /login');

    var user_id = req.body.inputEmail;
    var user_pw = req.body.inputPassword;
    var query = util.format("SELECT ADMIN_ID,ADMIN_PW,ADMIN_LV,UPDATE_DATE,LOGIN_TRYCNT,STATUS FROM TB_ADMIN WHERE ADMIN_ID =  \'%s\'", user_id);
    dbConn.query(query, function(error, value) {
        logger.info('query :', query);
        if (error) {
            logger.info('error : ', error);
        } else {
            if (value.length == 0) {
                logger.info('login fail, reason not exist id : ', user_id);
                res.render('login', {
                    data: {
                        error: '2'
                    }
                });
            } else if (value[0].LOGIN_TRYCNT >= 5) {
                logger.info('Login Count 5 Exceeds / ID :', user_id);

                res.render('login', {
                    data: {
                        error: '4'
                    }
                });
            } else if (value[0].ADMIN_PW != user_pw) {
                logger.info('Password mismatch / ID ', user_id);
                var query = util.format('UPDATE TB_ADMIN SET LOGIN_TRYCNT = nvl(LOGIN_TRYCNT, 0) + 1 WHERE ADMIN_ID = \'%s\'', user_id);
                dbConn.query(query, function(error, value) {
                    logger.info(query);
                    if (error) {
                        logger.info('error : ', error);
                    } else {
                        res.render('login', {
                            data: {
                                error: '3'
                            }
                        });
                    }
                });
            } else {
                if (utilLib.term(value[0].UPDATE_DATE, utilLib.today()) >= 90) {
                    logger.info('login fail, user id  : ', user_id);
                    res.render('login', {
                        data: {
                            error: '5'
                        }
                    });
                } else {
                    if(value[0].STATUS ==1){
                        io.sockets.emit('logout', user_id);
                    }
                    logger.info('speed');
                    req.session.userid = user_id;
                    req.session.userpw = user_pw;
                    req.session.userlv = value[0].ADMIN_LV;


                    var status = '1';

                    var ip = req.headers['x-forwarded-for'] ||
                        req.socket.remoteAddress ||
                        req.connection.socket.remoteAddress;

                    if (ip == '::1') {
                        ip = '127.0.0.1';
                    }

                    var pattern = /((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){3}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})/g;
                    var ipList = ip.match(pattern);

                    var agent = req.headers['user-agent'];

                    req.session.ip = ipList[0];

                    var date = "to_char(sysdate,'YYYYMMDDHH24MISS')";
                    var query = "INSERT INTO TB_LOGIN_HISTORY (AGENT, IP_ADDR, ADMIN_ID, STATUS, INSERT_DATE, UPDATE_DATE)"
                    query += "VALUES('" + agent + "','" + ipList[0] + "','" + user_id + "','" + status + "'," + date + ",'00000000000000')";
                    console.log(agent, ipList[0], user_id, status, date);
                    dbConn.query(query, function(error, value) {
                        logger.info(query);
                        if (error) {
                            logger.info('error : ', error);
                        } else {
                            var query = util.format('UPDATE TB_ADMIN SET LOGIN_TRYCNT = 0 WHERE ADMIN_ID = \'%s\'', user_id);
                            console.log(query);
                            dbConn.query(query, function(error, value) {
                                logger.info(query);
                                if (error) {
                                    logger.info('error : ', error);
                                } else {
                                    res.redirect('/status');
                                }
                            });
                        }
                    });
                }
            }
        }
    });
});

router.post('/getInfo', function(req, res) {
    id = req.session.userid;
    lv = req.session.userlv;
    res.send({
        id: id,
        lv: lv
    });
});

router.get('/logout', function(req, res) {
    logger.info('Path change : /logout');
    var id = req.session.userid;

    var query = 'SELECT * from (select * from TB_LOGIN_HISTORY WHERE ADMIN_ID = \'' + id + '\' order by INSERT_DATE desc) where rownum =1';

    dbConn.query(query, [], function(error, value) {
        logger.info(query);
        if (error) {
            logger.info('error : ', error);
        } else {
            var query2 = "UPDATE TB_LOGIN_HISTORY SET STATUS='2' , UPDATE_DATE=(select to_char(sysdate,'YYYYMMDDHH24MISS')SYS_DATE24 FROM DUAL) WHERE INSERT_DATE = '" + value[0].INSERT_DATE + "' and ADMIN_ID = '" + id + "'";
            console.log(query2);
            dbConn.query(query2, [], function(error, value) {
                logger.info(query2);
                if (error) {
                    logger.info('error : ', error);
                } else {
                    req.session.destroy(function() {
                        req.session;
                    });
                    res.clearCookie('ltelcs_LGD');
                    res.redirect('/login');
                }
            });
        }
    });


});

module.exports = router;
