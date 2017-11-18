var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var logger = require('../config/logger');
var oracledb = require('oracledb');
var dbConfig = require('../config/dbconfig.js');
//var dbConn = require('../libs/oracleConnection.js');
var dbConn = require('../libs/oraclePoolConnection.js');

router.get('/status', function(req, res) {
    logger.info('Path change : /status');
    console.log('user : ' + req.session.userid + "<br>email : " + req.session.userpw);
    var page = req.param('page');
    var searchKey = req.param('searchKey');
    var searchVal = req.param('searchVal');

    var query = "SELECT CUST_CTN,CUST_NM,CUST_DEPT_NM,UPLOAD_FILE_NM,UPLOAD_FILE_SZ,STATUS ";
    query += ",TO_CHAR(TO_DATE(INSERT_DATE,'YYYYMMDDHH24MISS'),'YYYY-MM-DD HH24:MI:SS') as INSERT_DATE ";
    query += ",TO_CHAR(TO_DATE(UPDATE_DATE,'YYYYMMDDHH24MISS'),'YYYY-MM-DD HH24:MI:SS') as UPDATE_DATE ";
    query += "FROM( SELECT ROWNUM AS RNUM, A.* FROM ( SELECT * FROM TB_TERMINAL_IMAGE_TRANS WHERE STATUS <=3) A";
    if (!page) {
        page = "1";
    }
    query += " WHERE ROWNUM <= " + (page) * 10;
    if (searchKey) {
        query += " and " + searchKey + " like '%" + searchVal + "%'";
    }
    query += ") WHERE RNUM >" + (page - 1) * 10 + " ORDER BY CUST_CTN "
    logger.info(query);
    dbConn.query(query, [], function(error, value) {
        logger.info('start', value);
        if (error) {
            logger.info('error : ', error);
        } else {
            res.render('status/realtime_list', {
                data: value
            });
        }
    });
});

router.get('/status_count', function(req, res) {
    logger.info('Path change : /status_count');
    var searchKey = req.param('searchKey');
    var searchVal = req.param('searchVal');

    var query = "SELECT COUNT(*) AS CNT FROM TB_TERMINAL_IMAGE_TRANS WHERE STATUS <=3";
    if (searchKey) {
        query += " and " + searchKey + " like '%" + searchVal + "%'";
    }
    logger.info(query);
    dbConn.query(query, [], function(error, value) {

        if (error) {
            logger.info('error : ', error);
        } else {
            console.log(" ", value);
            res.send(value);
        }
    });
});

router.get('/status_ch_info', function(req, res) {
    logger.info('Path change : /status_ch_info');
    var CUST_CTN = req.param('CUST_CTN');
    var INSERT_DATE = req.param('INSERT_DATE');

    var query = "SELECT * FROM TB_TERMINAL_IMAGE_TRANS WHERE CUST_CTN='"+CUST_CTN+"' and INSERT_DATE='"+ INSERT_DATE+"'";
    logger.info(query);
    dbConn.query(query, [], function(error, value) {
        if (error) {
            logger.info('error : ', error);
        } else {
            res.send(value);
        }
    });
});

router.get('/status_user_info', function(req, res) {
    logger.info('Path change : /status_user_info');
    var CUST_CTN = req.param('CUST_CTN');
    var INSERT_DATE = req.param('INSERT_DATE');

    var query = "SELECT a.DEV_KEY,b.DEV_NM,c.EMPLOYEE_NO,c.EMPLOYEE_NAME, c.TITLE_NAME,d.DEPARTMENT_NAME FROM TB_view_service a ";
        query+="left join TB_DEFAULT_CONNECT_INFO b on a.DEV_KEY=b.DEV_KEY ";
        query+="left join TB_COM_EMPLOYEE_M_T c on a.DEV_KEY=c.EMPLOYEE_NO ";
        query+="left join TB_COM_DEPARTMENT_M_T d on d.DEPARTMENT_CODE=c.DEPARTMENT_CODE ";
        query+="where a.P_CUST_CTN='"+CUST_CTN+"' and a.P_INSERT_DATE='"+20171101132413+"'";

    logger.info(query);
    dbConn.query(query, [], function(error, value) {
        if (error) {
            logger.info('error : ', error);
        } else {
            res.send(value);
        }
    });
})


module.exports = router;
