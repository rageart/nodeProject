var util = require('util');
var logger = require('../config/logger');

exports.GetViewerIndex = function (dbConn, info, callback) {
	
	var query = util.format('SELECT' +
		    	' mod(count(P_CUST_CTN), 9999) + 1 VIEW_INDEX' +
				' FROM TB_VIEW_SERVICE' + 
				' WHERE' +
		    	' DEV_KEY = \'%s\' AND DEV_TYPE = \'3\'', info.DEV_KEY);
	
    dbConn.query(query, function (error, results) {
        
        logger.info('Query:', query);
        if (error) {
            logger.error('DB Error:', error);
        } else {
            logger.info('DB Success:', results); 
            callback(info, results);
        }
    });    
};

exports.GetViewerIndex2 = function (dbConn, viewInfo, DEV_TYPE, callback) {
	
	var query = util.format('SELECT' +
		    	' mod(count(P_CUST_CTN), 9999) + 1 VIEW_INDEX' +
				' FROM TB_VIEW_SERVICE' + 
				' WHERE' +
		    	' DEV_KEY = \'%s\' AND DEV_TYPE = \'%s\'', viewInfo.DEV_KEY, DEV_TYPE);
	
    dbConn.query(query, function (error, results) {
        
        logger.info('Query:', query);
        if (error) {
            logger.error('DB Error:', error);
        } else {
            logger.info('DB Success:', results); 
            callback(results, viewInfo);
        }
    });    
};

