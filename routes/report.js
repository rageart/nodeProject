var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var logger = require('../config/logger');
var oracledb = require('oracledb');
var dbConfig = require('../config/dbconfig.js');
//var dbConn = require('../libs/oracleConnection.js');
var dbConn = require('../libs/oraclePoolConnection.js');
var utilLib = require('../libs/utilLib.js');

router.get('/report', function(req, res) {
    logger.info(req.session.userid, ' : Path change [get] /report');
    var page = req.param('page');
    var custNM = req.param('custNM');
    var custCTN = req.param('custCTN');
    var custDEPT = req.param('custDEPT');
    var dateFrom = req.param('dateFrom');
    var dateTo = req.param('dateTo');

    var query = "SELECT CUST_CTN,CUST_NM,CUST_DEPT_NM,UPLOAD_FILE_NM,UPLOAD_FILE_SZ,STATUS ";
    query += ",TO_CHAR(TO_DATE(INSERT_DATE,'YYYYMMDDHH24MISS'),'YYYY-MM-DD HH24:MI:SS') as INSERT_DATE ";
    query += ",TO_CHAR(TO_DATE(UPDATE_DATE,'YYYYMMDDHH24MISS'),'YYYY-MM-DD HH24:MI:SS') as UPDATE_DATE ";
    query += "FROM( SELECT ROWNUM AS RNUM, A.* FROM ( SELECT * FROM TB_TERMINAL_IMAGE_TRANS  ORDER BY INSERT_DATE DESC) A";
    if (!page) {
        page = "1";
    }
    query += " WHERE ROWNUM <= " + (page) * 10;
    if (custNM) {
        query += " and CUST_NM like '%" + custNM + "%'";
    }
    if (custCTN) {
        query += " and CUST_CTN like '%" + custCTN + "%'";
    }
    if (custDEPT) {
        query += " and CUST_DEPT_NM like '%" + custDEPT + "%'";
    }
    if (dateFrom) {
        query += " and INSERT_DATE >  REPLACE('" + dateFrom + "000000','-','') and INSERT_DATE < REPLACE('" + dateTo + "235959','-','')";
    }
    query += ") WHERE RNUM >" + (page - 1) * 10 ;
    dbConn.query(query, [], function(error, value) {
        logger.info(query);
        if (error) {
            logger.info('error : ', error);
        } else {
            for (var i = 0; i < value.length; i++){
                value[i].UPLOAD_FILE_SZ=utilLib.byteConvertor(value[i].UPLOAD_FILE_SZ);
            }
            res.render('report/video_list', {
                data: value
            });
        }
    });
});

router.get('/report/:ctn/:date', function(req, res) {
    logger.info(req.session.userid, ' : Path change [get] /report/:ctn/:date');

    var ctn = req.param('ctn');
    var date = req.param('date');

    var query = "SELECT CUST_CTN,CUST_NM,CUST_DEPT_NM,UPLOAD_FILE_SZ,PLAY_TIME,DEV_MODEL,BIT_RATE ";
    query += ",TO_CHAR(TO_DATE(INSERT_DATE,'YYYYMMDDHH24MISS'),'YYYY-MM-DD HH24:MI:SS') as INSERT_DATE ";
    query += ",TO_CHAR(TO_DATE(UPDATE_DATE,'YYYYMMDDHH24MISS'),'YYYY-MM-DD HH24:MI:SS') as UPDATE_DATE ";
    query += "FROM TB_TERMINAL_IMAGE_TRANS ";
    query += "WHERE CUST_CTN= '"+ ctn +"' AND INSERT_DATE= '"+ date +"'";

    dbConn.query(query, [], function(error, value) {
        logger.info(query);
        if (error) {
            logger.info('error : ', error);
        } else {
            for (var i = 0; i < value.length; i++){
                value[i].UPLOAD_FILE_SZ=utilLib.byteConvertor(value[i].UPLOAD_FILE_SZ);
            }
            res.render('report/video_detail', {
                data: value
            });
        }
    });
});

router.get('/report_count', function(req, res) {
    logger.info(req.session.userid, ' : Path change [get] /report_count');
    var custNM = req.param('custNM');
    var custCTN = req.param('custCTN');
    var custDEPT = req.param('custDEPT');
    var dateFrom = req.param('dateFrom');
    var dateTo = req.param('dateTo');

    var query = "SELECT COUNT(*) AS CNT FROM TB_TERMINAL_IMAGE_TRANS WHERE 1=1";
    if (custNM) {
        query += " and CUST_NM like '%" + custNM + "%'";
    }
    if (custCTN) {
        query += " and CUST_CTN like '%" + custCTN + "%'";
    }
    if (custDEPT) {
        query += " and CUST_DEPT_NM like '%" + custDEPT + "%'";
    }
    if (dateFrom) {
        query += " and INSERT_DATE >  REPLACE('" + dateFrom + "000000','-','') and INSERT_DATE < REPLACE('" + dateTo + "235959','-','')";
    }
    dbConn.query(query, [], function(error, value) {
        if (error) {
            logger.info('error : ', error);
        } else {
            console.log(" " ,value);
            res.send(value);
        }
    });
});

module.exports = router;
