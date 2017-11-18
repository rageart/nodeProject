var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var logger = require('../config/logger');
var oracledb = require('oracledb');
var dbConfig = require('../config/dbconfig.js');
//var dbConn = require('../libs/oracleConnection.js');
var dbConn = require('../libs/oraclePoolConnection.js');
var utilLib = require('../libs/utilLib.js');

router.get('/setup/setting', function(req, res) {
    logger.info('Path change : /setup/setting');
    var page = req.param('page');
    var searchKey = req.param('searchKey');
    var searchVal = req.param('searchVal');

    var query = "SELECT * ";
    query += "FROM( SELECT ROWNUM AS RNUM, A.* FROM ( SELECT a.*, (SELECT count(b.CODE_01) FROM TB_DEFAULT_CONNECT_INFO b WHERE a.CODE_01=b.CODE_01 and a.CODE_02=b.CODE_02 and a.CODE_03=b.CODE_03) as CH_CNT FROM TB_CONTROL a WHERE a.DELETE_FLAG !='1') A";
    if (!page) {
        page = "1";
    }
    query += " WHERE ROWNUM <= " + (page) * 3;
    if (searchKey) {
        query += " and " + searchKey + " like '%" + searchVal + "%'";
    }
    query += ") WHERE RNUM >" + (page - 1) * 3 + " ORDER BY SEQ "

    logger.info(query);
    dbConn.query(query, [], function(error, value) {
        if (error) {
            logger.info('error : ', error);
        } else {
            res.render('setup/setting', {
                data: value,
                admin_lv: req.session.userlv
            });
        }
    });
});

router.post('/setup/setting', function(req, res) {
    logger.info('Path change : /setup/setting');
    var channel = req.param('channel');
    var description = req.param('description');
    var date = "to_char(sysdate,'YYYYMMDDHH24MISS')";
    var query = "INSERT INTO TB_CONTROL (SEQ, CTL_NM, CTL_ADMIN_NM, INSERT_DATE) "
    query += "VALUES(SEQ.nextval,'" + channel + "','" + description + "'," + date + ")";
    dbConn.query(query, [], function(error, value) {
        logger.info(query);
        if (error) {
            logger.info('error : ', error);
        } else {
            res.send({
                "channel": channel
            });
        }
    });
});

router.get('/setup/setting_count', function(req, res) {
    logger.info('Path change : /setup/setting_count');
    var searchKey = req.param('searchKey');
    var searchVal = req.param('searchVal');

    var query = "SELECT COUNT(*) AS CNT FROM TB_CONTROL WHERE DELETE_FLAG !='1'";
    if (searchKey) {
        query += " and " + searchKey + " like '%" + searchVal + "%'";
    }
    logger.info(query);
    dbConn.query(query, [], function(error, value) {

        if (error) {
            logger.info('error : ', error);
        } else {
            res.send(value);
        }
    });
});

router.get('/setup/login_search', function(req, res) {
    logger.info('Path change : /setup/login_search');
    var page = req.param('page');
    var dateFrom = req.param('dateFrom');
    var dateTo = req.param('dateTo');
    var id = req.param('id');

    var query = "SELECT AGENT,IP_ADDR,ADMIN_ID,STATUS, UPDATE_DATE ";
    query += ",TO_CHAR(TO_DATE(INSERT_DATE,'YYYYMMDDHH24MISS'),'YYYY-MM-DD HH24:MI:SS') as INSERT_DATE ";
    query += "FROM( SELECT ROWNUM AS RNUM, A.* FROM ( SELECT * FROM TB_LOGIN_HISTORY ORDER BY INSERT_DATE) A";
    if (!page) {
        page = "1";
    }
    query += " WHERE ROWNUM <= " + (page) * 10;
    if (dateFrom) {
        query += " and INSERT_DATE >  REPLACE('" + dateFrom + "000000','-','') and INSERT_DATE < REPLACE('" + dateTo + "235959','-','')";
    }
    if (id) {
        query += " and ADMIN_ID like '%" + id + "%'";
    }
    query += ") WHERE RNUM >" + (page - 1) * 10;
    logger.info(query);
    dbConn.query(query, [], function(error, value) {

        if (error) {
            logger.info('error : ', error);
        } else {
            for (var i = 0; i < value.length; i++) {
                value[i].AGENT = utilLib.GetBrowserInfo(value[i].AGENT);
            }
            res.render('setup/login_search', {
                data: value,
                admin_lv: req.session.userlv
            });
        }
    });
});

router.get('/login_search_count', function(req, res) {
    logger.info('Path change : login_search_count');
    var dateFrom = req.param('dateFrom');
    var dateTo = req.param('dateTo');
    var id = req.param('id');

    var query = "SELECT COUNT(*) AS CNT FROM TB_LOGIN_HISTORY WHERE 1=1";
    if (dateFrom) {
        query += " and INSERT_DATE >  REPLACE('" + dateFrom + "000000','-','') and INSERT_DATE < REPLACE('" + dateTo + "235959','-','')";
    }
    if (id) {
        query += " and ADMIN_ID like '%" + id + "%'";
    }
    logger.info(query);
    dbConn.query(query, [], function(error, value) {

        if (error) {
            logger.info('error : ', error);
        } else {
            res.send(value);
        }
    });
});


router.get('/setup/user_management', function(req, res) {
    logger.info('Path change : /setup/user_management');
    res.render('setup/user_management', {
        admin_lv: req.session.userlv
    });
});

router.post('/setup/channel_management', function(req, res) {
    logger.info('Path change : /setup/channel_management');

    /*
    var query = "SELECT DEPARTMENT_CODE AS \"id\" , DEPARTMENT_NAME AS \"text\", ORGANIZATION_LEVEL_CODE";
    query += ", CASE WHEN ORGANIZATION_LEVEL_CODE<=150 THEN '#' ELSE '#' END AS \"parent\"";
    query += " FROM TB_COM_DEPARTMENT_M";
    query += " WHERE ORGANIZATION_LEVEL_CODE<=200";
    */
    /*
    var query = "SELECT DEPARTMENT_CODE AS \"id\" , DEPARTMENT_NAME AS \"text\", PARENT_ORGANIZATION_CODE AS \"parent\"";
    query += "FROM (";
    query += "SELECT DEPARTMENT_CODE, DEPARTMENT_NAME, ORGANIZATION_LEVEL_CODE";
    query += ", CASE WHEN ORGANIZATION_LEVEL_CODE<=150 THEN '#' ELSE PARENT_ORGANIZATION_CODE";
    query += " END PARENT_ORGANIZATION_CODE";
    query += " FROM TB_COM_DEPARTMENT_M WHERE ORGANIZATION_LEVEL_CODE<=200";
    query += ")";
    query += "ORDER BY PARENT_ORGANIZATION_CODE";
    */
    /*
    var query = "SELECT DEPARTMENT_CODE AS \"id\", DEPARTMENT_NAME AS \"text\""
    query += "    , CASE WHEN PARENT_ORGANIZATION_CODE IS NULL THEN '#' ELSE PARENT_ORGANIZATION_CODE END \"parent\""
    query += "    , ORGANIZATION_LEVEL"
    query += " FROM TB_COM_DEPARTMENT_M_T"
    */
    var query = "";
    query += " SELECT ID AS \"id\", TEXT AS \"text\", PARENT AS \"parent\", MOBILE AS \"mobile\"";
    query += "    , (SELECT DEPARTMENT_NAME FROM TB_COM_DEPARTMENT_M_T WHERE DEPARTMENT_CODE=S1.PARENT) AS \"parent_name\"";
    query += " FROM (";
    query += "    SELECT DEPARTMENT_CODE AS ID, DEPARTMENT_NAME AS TEXT";
    query += "        , CASE WHEN PARENT_ORGANIZATION_CODE  IS NULL THEN '#' ELSE PARENT_ORGANIZATION_CODE END AS PARENT, MOBILE_NO AS MOBILE";
    query += "    FROM (";
    query += "        SELECT DEPARTMENT_CODE, DEPARTMENT_NAME, PARENT_ORGANIZATION_CODE, '' AS MOBILE_NO";
    query += "        FROM TB_COM_DEPARTMENT_M_T";
    query += "        UNION ALL ";
    query += "        SELECT EMPLOYEE_NO, EMPLOYEE_NAME||' '||TITLE_NAME, DEPARTMENT_CODE, MOBILE_NO";
    query += "        FROM TB_COM_EMPLOYEE_M_T";
    query += "    )";
    query += "    ORDER BY PARENT, ID";
    query += ") S1";

    logger.info('query : '+ query);

    dbConn.query(query, [], function(error, value) {
      if (error) {
        logger.info('error : ', error);
      } else {
        res.json(value);
      }
    });
});

router.get('/channel/user', function(req, res) {
    logger.info('Path change : /channel/user');
    var channel = req.param('channel');

    var query = "SELECT * FROM TB_DEFAULT_CONNECT_INFO ";
        query += "where CODE_01 =(select CODE_01 FROM TB_CONTROL WHERE CTL_NM='"+channel+"')";
        query += "and CODE_02 =(select CODE_02 FROM TB_CONTROL WHERE CTL_NM='"+channel+"')";
        query += "and CODE_03 =(select CODE_03 FROM TB_CONTROL WHERE CTL_NM='"+channel+"')";
    logger.info(query);
    dbConn.query(query, [], function(error, value) {
        if (error) {
            logger.info('error : ', error);
        } else {
            res.send(value);
        }
    });
});



module.exports = router;
