var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var logger = require('../config/logger');
var oracledb = require('oracledb');
var dbConfig = require('../config/dbconfig.js');
//var dbConn = require('../libs/oracleConnection.js');
var dbConn = require('../libs/oraclePoolConnection.js');
var pushServiceAPI = require('../libs/pushServiceAPI.js');
var util = require('util');
var url = require('url');
var querystring = require('querystring');

router.put('/mobile/push/:id', function(req, res) {
    logger.info(req.session.userid, ' : Path change [put] /mobile/push', '/', req.param('id'));

    pushServiceAPI.checkValidRegID(dbConn, req, function(error, results) {
        
        //var date = new Date().formatDate("yyyyMMddhhmmss");
        var query;
        if (Object.keys(results).length == 0) { // regId 최초등록
            query = util.format('INSERT INTO TB_PUSH_REG_INFO (DEV_KEY, DEV_TYPE, REG_ID, REG_STATUS, INSERT_DATE, UPDATE_DATE) VALUES' +
                '( \'%s\', \'%s\', \'%s\', \'%s\', TO_CHAR(SYSDATE, \'YYYYMMDDHHmmss\'), TO_CHAR(SYSDATE, \'YYYYMMDDHHmmss\'))', req.param('id'), '1', req.param('reg_id'), '1'); //, TO_CHAR(SYSDATE, 'YYYYMMDDHHmmss'), TO_CHAR(SYSDATE, 'YYYYMMDDHHmmss'));
        } else {                                // regId update
            query = util.format('UPDATE TB_PUSH_REG_INFO SET REG_ID = \'%s\', UPDATE_DATE = TO_CHAR(SYSDATE, \'YYYYMMDDHHmmss\') WHERE DEV_KEY = \'%s\' and DEV_TYPE = \'%s\'', req.param('reg_id'), req.param('id'), '1');
        }

        dbConn.query(query, function(error, result) {
            logger.info('Query:', query);
            if (error) {
                logger.error('DB Error:', error);
                res.json({result:"error", message:error});
            } else {
                res.json({result:"success"});
            }
        });
    });
});

router.get('/mobile/init/:id', function(req, res) {
    logger.info(req.session.userid, ' : Path change [get] /mobile/init', '/', req.param('id'));
    var urlquery = querystring.parse(url.parse(req.url).query);        
    var query = util.format('SELECT TERMS_YN, PRIVATE_YN, GPS_YN FROM TB_CUST_INFO WHERE CUST_CTN = \'%s\' AND CTN_DEVICE = \'%s\'', req.param('id'), urlquery.CTN_DEVICE);
    dbConn.query(query, function(error, result) {
        logger.info('Query:', query);
        if (error) {
            logger.error('DB Error:', error);
            res.json({result:"error", message:error});
        } else {
            res.json({result:"success", data:result});
        }
    });
});

router.get('/mobile/notice/:id', function(req, res) {
    logger.info(req.session.userid, ' : Path change [get] /mobile/notice', '/', req.param('id'));
    
    var query;
    query = util.format('SELECT N_SENDDATE, N_INSERTDATE, N_TITLE, N_CONTENT, N_T_DATE from TB_NOTICE_POPUP ' +
            'WHERE N_T_DATE > \'%s\' and N_SENDDATE != \'\' and rownum = 1 ' +
            'order by N_SENDDATE desc, N_UPDATEDATE desc, N_INSERTDATE desc', req.param('id'));
    dbConn.query(query, function(error, result) {
        logger.info('Query:', query);
        if (error) {
            logger.error('DB Error:', error);
            res.json({result:"error", message:error});
        } else {
            res.json({result:"success", data:result});
        }
    });
});

router.get('/mobile/stream/:id', function(req, res) {
    logger.info(req.session.userid, ' : Path change [get] /mobile/stream', '/', req.param('id'));
    
    var query = 'select a.CTL_TYPE CTL_TYPE, ' +
                'b.CTL_NM CTL_NM, b.CTL_TEL_NUM CTL_TEL_NUM, ' +
                'b.CODE_ID CODE_ID, b.DEFAULT_DEVICE DEFAULT_DEVICE ' +
                'from ' +
                '(select CTL_TYPE, CTL_SEQ from TB_CONTROL_SETUP_INFO where CUST_CTN=\'' + req.param('id') + '\') a ' +
                'left join ' +
                '(select SEQ, CTL_NM, CTL_TEL_NUM, CODE_ID, DEFAULT_DEVICE from TB_CONTROL ) b ' +
                'on a.CTL_SEQ = b.SEQ';

    dbConn.query(query, function(error, result) {
        logger.info('Query:', query);
        if (error) {
            logger.error('DB Error:', error);
            res.json({result:"error", message:error});
        } else {
            res.json({result:"success", data:result});
        }
    });
});

module.exports = router;