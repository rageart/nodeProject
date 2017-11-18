var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var logger = require('../config/logger');
var dbConn = require('../libs/oraclePoolConnection.js');
var channelAPI = require('../libs/channelAPI.js');
var util = require('util');

exports.createCode = function (callback) {
    logger.info('createCode');
    var query = "SELECT P_CODE * 1000 + CODE BEING_CODE FROM TB_DEPT_DEPTH WHERE GUBUN = '2' ORDER BY CODE ASC";
    dbConn.query(query, function(error, results) {
        logger.info('Query:', query);
        if (error) {
            logger.error('DB Error:', error);
        } else {
            var baseCode = 100000;
            var newCode = 0;
            if (Object.keys(results).length == 0) {
                newCode = baseCode;
            } else if (results.length == 900000) {
                response.send({result:'error', msg:'생성할 수 있는 범위를 초과하였습니다. 관리자에게 문의 바랍니다.'});
                return;
            } else {
                for (var i = 0; i < results.length; i++) {
                    if (Number(results[i].BEING_CODE) !== baseCode+i) {
                        break;
                    } else {
                        newCode = baseCode+(i+1);
                    }
                }
            }
            
            logger.info('newCode : ', newCode, ' type :', typeof newCode);

            var p_code = newCode.toString().substring(0, 3);
            var code = newCode.toString().substring(3, 6);

            logger.info('code_01 : ', p_code, ' code_02 :', code);

            var query;
            if (code == '000') { // 대분류 코드 처음 생성 시점
                query = util.format("INSERT ALL INTO TB_DEPT_DEPTH (GUBUN, CODE, CODE_NM, P_CODE, INSERT_DATE)" +
                "values('%s', '%s', '%s','%s', to_char(sysdate,'yyyymmddhh24miss')) INTO TB_DEPT_DEPTH (GUBUN, CODE, CODE_NM, P_CODE, INSERT_DATE) " +
                "values('%s', '%s', '%s','%s', to_char(sysdate,'yyyymmddhh24miss')) SELECT * FROM DUAL", '1', p_code, '', '-', '2', code, '', p_code);
            } else {
                query = util.format("INSERT INTO TB_DEPT_DEPTH (GUBUN, CODE, CODE_NM, P_CODE, INSERT_DATE)" +
                "values('%s', '%s', '%s','%s', to_char(sysdate,'yyyymmddhh24miss'))", '2', code, '', p_code);
            }
            dbConn.query(query, function(error, results) {
                logger.info('Query:', query);
                if (error) {
                    logger.error('DB Error:', error);
                    callback(error, null, null);
                } else {
                    callback(null, p_code, code);
                }
            });
        }
    });
};

exports.addChannel = function(request, obj) {
    var query;
    query = "INSERT INTO TB_DEFAULT_CONNECT_INFO " +
        "VALUES (:DEV_KEY, :DEV_TYPE, :DEV_NM, :DEV_DEPT_NM, :CODE_01, :CODE_02, :CODE_03, " +
        "to_char(sysdate,'yyyymmddhh24miss'), to_char(sysdate,'yyyymmddhh24miss'), :ADMIN_ID)";

    var data = [];
    data.push(request.param('DEV_KEY'));
    data.push(constVal.MOBILE);
    data.push(request.param('DEV_NM'));
    data.push(request.param('DEV_DEPT_NM'));
    data.push(obj.code_01);
    data.push(obj.code_02);
    data.push(obj.code_03);
    data.push(request.param('ADMIN_ID'));
    
    dbConn.query(query, data, function(error, results) {
        logger.info('Query:', query);
        if (error) {
            logger.error('DB Error:', error);
            
        } else {
            logger.info('invite channel success : ', request.param('DEV_KEY'), ' ', request.param('ADMIN_ID'));
        }
    });    
}

exports.getRegidsChannel = function(code_01, code_02, code_03, callback) {
    var query;
    query = util.format("SELECT MOBILE_NUM, DEV_KEY, DEV_NM, DEV_DEPT_NM " +
    "FROM TB_DEFAULT_CONNECT_INFO " +
    "WHERE CODE_01 = '%s' AND CODE_02 = '%s' AND CODE_03 = '%s' ", code_01, code_02, code_03);
    
    dbConn.query(query, function(error, results) {
        logger.info('Query:', query);
        if (error) {
            logger.error('DB Error:', error);
            callback(error, null);
        } else {
            callback(null,results);
        }
    });    
}