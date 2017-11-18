var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var logger = require('../config/logger');
var oracledb = require('oracledb');
//var dbConfig = require('../config/dbconfig.js');
var constVal = require('../config/const.js');
var dbConn = require('../libs/oraclePoolConnection.js');
var channelAPI = require('../libs/channelAPI.js');
var util = require('util');
var querystring = require('querystring');
var url = require('url');

router.post('/channel', function (req, res) {
    logger.info(req.session.userid, ' :  [post] /channel');
    
    channelAPI.createCode(function(err, code_01, code_02) {
        if (err) {
            res.send({result:'error', msg:err});
            return;
        }                
        var code_03 = '000';
        var code_id = code_01 + '' + code_02 + '' + code_03;
        var name = req.param('channel_name');
        var desc = req.param('channel_desc');

        var query = "INSERT INTO TB_CONTROL " +
                    "VALUES " +
                    "(SEQ_TB_CONTROL.NEXTVAL, :CTL_NM, :CTL_ADMIN_NM, :CTL_TEL_NUM, to_char(sysdate,'yyyymmddhh24miss'), :USER_YN, :CODE_01, :CODE_02, :CODE_03, " +
                    ":CODE_ID, :DEFAULT_DEVICE, :CALL_ID, :PASSWD, :CHANNEL_DESC)";

        dbConn.query(query, [name, '', '', 'Y', code_01, code_02, code_03, Number(code_id), constVal.MOBILE, '', '', desc], function (error, results) {
            logger.info('Query:', query);
            if (error) {
                logger.error('DB Error:', error);
                res.send({result:'error', msg:error});
            } else {
                logger.info('DB Success:');
                res.send({result:'success', msg:'채널 생성 성공'});
                var obj = {};
                obj.code_01 = code_01;
                obj.code_02 = code_02;
                obj.code_03 = code_03;
                // 채널 생성자가 반드시 포함될 필요는 없을듯
                //channelAPI.addChannel(req, obj);
            }
        });
    })
});

//put /channel
router.delete('/channel', function (req, res) {
    logger.info(req.session.userid, ' :  [delete] /channel');

    getCodeChannel(req.param('CHANNEL_NM'), function(err, code_01, code_02, code_03) {
        if (err) {
            res.send({result:'error', msg:err});
            return;
        }                
        
        var query = util.format("UPDATE TB_CONTROL SET DELETE_FLAG = '1' WHERE CODE_01 = '%s' AND CODE_02 = '%s' AND CODE_03 = '%s'", code_01, code_02, code_03);        
        dbConn.query(query, function (error, results) {
            logger.info('Query:', query);
            if (error) {
                logger.error('DB Error:', error);
                res.send({result:'error', msg:error});
            } else {
                logger.info('DB Success:');
                res.send({result:'success', msg:'채널삭제 성공'});
            }
        });
    })
});

//post /channel/:id
router.post('/channel/:user', function (req, res) {
    logger.info(req.session.userid, ' :  [post] /channel/:user');

    var dev_key = req.param('user');
    var dev_nm = req.param('DEV_NM');
    var dev_dept_nm = req.param('DEV_DEPT_NM');
    var channel_auth = '2';

    logger.info(dev_key, dev_nm, dev_dept_nm);
    
    getCodeChannel(req.param('CHANNEL_NM'), function(err, code_01, code_02, code_03) {
        if (err) {
            res.send({result:'error', msg:err});
            return;
        }                
        
        logger.info(dev_key, dev_nm, dev_dept_nm);

        var query = "INSERT INTO TB_DEFAULT_CONNECT_INFO " +
                    "VALUES " +
                    "(:DEV_KEY, :DEV_TYPE, :DEV_NM, :DEV_DEPT_NM, :CODE_01, :CODE_02, :CODE_03, " +
                    "to_char(sysdate,'yyyymmddhh24miss'), to_char(sysdate,'yyyymmddhh24miss'), :ADMIN_ID, :MOBILE_NUM, :CHANNEL_AUTH)";
        
        dbConn.query(query, [dev_key, '1', dev_nm, dev_dept_nm, code_01, code_02, code_03, req.session.userid, '', channel_auth], function (error, results) {
            logger.info('Query:', query);
            if (error) {
                logger.error('DB Error:', error);
                res.send({result:'error', msg:error});
            } else {
                logger.info('DB Success:');
                res.send({result:'success', msg:'채널삽입 성공'});
            }
        });
    })
});

//delete /channel/:id
router.delete('/channel/:user', function (req, res) {
    logger.info(req.session.userid, ' :  [delete] /channel/:user');
    
    var query = "DELETE FROM TB_DEFAULT_CONNECT_INFO WHERE DEV_KEY = '" + req.param('user') + "'";    
    dbConn.query(query, function (error, results) {
        logger.info('Query:', query);
        if (error) {
            logger.error('DB Error:', error);
            res.send({result:'error', msg:error});
        } else {
            logger.info('DB Success:');
            res.send({result:'success', msg:'채널삭제 성공'});
        }
    });
});

//put /channel/:id
router.put('/channel/:user', function (req, res) {
    logger.info(req.session.userid, ' :  [put] /channel/:user');
    
    //var query = "UPDATE TB_ADMIN SET ADMIN_LV = '" + req.param('USER_LEVEL') + "' WHERE ADMIN_ID = '" + req.param('user') + "'";
    getCodeChannel(req.param('CHANNEL_NM'), function(err, code_01, code_02, code_03) {
        if (err) {
            res.send({result:'error', msg:err});
            return;
        }

        var query = util.format("UPDATE TB_DEFAULT_CONNECT_INFO " + 
        "SET CHANNEL_AUTH = '2' " +
        "WHERE CODE_01 = '%s' AND CODE_02 = '%s' AND CODE_03 = '%s' AND CHANNEL_AUTH = '1'", code_01, code_02, code_03);

        dbConn.query(query, function (error, results) {
            logger.info('Query:', query);
            if (error) {
                logger.error('DB Error:', error);
                res.send({result:'error', msg:error});
            } else {
                logger.info('DB Success:');
                logger.info({result:'success', msg:'채널관리자 변경 성공'});

                var query1 = util.format("UPDATE TB_DEFAULT_CONNECT_INFO " + 
                "SET CHANNEL_AUTH = '%s' " +
                "WHERE DEV_KEY = '%s' AND CODE_01 = '%s' AND CODE_02 = '%s' AND CODE_03 = '%s' ", req.param('USER_LEVEL'), code_01, code_02, code_03);

                dbConn.query(query1, function (error, results) {
                    logger.info('Query:', query1);
                    if (error) {
                        logger.error('DB Error:', error);
                        res.send({result:'error', msg:error});
                    } else {
                        logger.info('DB Success:');
                        res.send({result:'success', msg:'채널관리자 변경 성공'});
                    }
                });
            }
        });
    });
});


router.get('/channel/services', function (req, res) {
    logger.info(req.session.userid, ' :  [get] /channel/:services');
    var decodedUrl = querystring.unescape(req.url);
    logger.info('decodedUrl : ', decodedUrl);
    var urlquery = querystring.parse(url.parse(decodedUrl).query);
    logger.info('urlquery : ', urlquery.channel_nm);
    
    getCodeChannel(urlquery.channel_nm, function(err, code_01, code_02, code_03) {
        if (err) {
            res.send({result:'error', msg:err});
            return;
        }

        var query = util.format("SELECT count(*) SVC_CNT FROM TB_TERMINAL_IMAGE_TRANS " +
                    "WHERE CODE_01 = '%s' AND CODE_02 = '%s' AND CODE_03 = '%s'", code_01, code_02, code_03);
        dbConn.query(query, function (error, results) {
            logger.info('Query:', query);
            if (error) {
                logger.error('DB Error:', error);
                res.send({result:'error', msg:error});
            } else {
                logger.info('DB Success:');
                res.send(results[0]);
            }
        });
    });
});


var getCodeChannel = function (nm, callback) {
    var query = "SELECT CODE_01, CODE_02, CODE_03 FROM TB_CONTROL WHERE CTL_NM = '" + nm + "'";    
    dbConn.query(query, function (error, result) {
        logger.info('Query:', query);
        if (error) {
            logger.error('DB Error:', error);
            callback(error);
        } else {
            logger.info('DB Success:');
            if (Object.keys(result).length == 0) {
                callback('채널 정보 없음');
            } else {
                callback(null, result[0].CODE_01,result[0].CODE_02, result[0].CODE_03);
            }
        }
    });        
}

module.exports = router;