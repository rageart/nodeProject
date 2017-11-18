var oracledb = require('oracledb');
var dbConfig = require('../config/dbconfig.js');
var logger = require('../config/logger');
oracledb.outFormat = oracledb.OBJECT;
oracledb.autoCommit = true;

var poolCon;

// Main entry point.  Creates a connection pool, on callback creates an
// HTTP server that executes a query based on the URL parameter given.
// The pool values shown are the default values.
exports.init = function() {
    oracledb.createPool(
        {
            user: dbConfig.user,
            password: dbConfig.password,
            connectString: dbConfig.connectString,
            poolMax: 8
            // Default values shown below
            // externalAuth: false, // whether connections should be established using External Authentication
            // poolMax: 4, // maximum size of the pool. Increase UV_THREADPOOL_SIZE if you increase poolMax
            // poolMin: 0, // start with no connections; let the pool shrink completely
            // poolIncrement: 1, // only grow the pool by one connection at a time
            // poolTimeout: 60, // terminate connections that are idle in the pool for 60 seconds
            // poolPingInterval: 60, // check aliveness of connection if in the pool for 60 seconds
            // queueRequests: true, // let Node.js queue new getConnection() requests if all pool connections are in use
            // queueTimeout: 60000, // terminate getConnection() calls in the queue longer than 60000 milliseconds
            // poolAlias: 'myalias' // could set an alias to allow access to the pool via a name
            // stmtCacheSize: 30 // number of statements that are cached in the statement cache of each connection
        },

        function(err, pool) {
            if (err) {
                logger.error("createPool() error: " + err.message);
                return;
            }
            logger.info("createPool() success: ");
            poolCon = pool;
        }
    );
}

function bindToCurrentDomain(callback) {
    if (!callback) return;
  
    var domain = process.domain;
  
    return domain
      ? domain.bind(callback)
      : callback;
}
  
exports.query = function(query, values, callback) {

    var cb = bindToCurrentDomain(callback);
    
    var arr = [];
    if (typeof values == 'function') {
        cb = bindToCurrentDomain(values);
    } else if (values !== undefined) {
        arr = values;
    } else if (typeof values !== 'object') {
        throw new Errr("values is not object type!");
    }

    poolCon.getConnection(function(err, connection) {
        if (err) {
            logger.error("getConnection() error", err);
            return;
        }

        connection.execute(
            query,
            arr, // bind variable value
            function(err, result) {
                if (err) {
                    connection.close(function(err) {
                        if (err) {
                            // Just logging because handleError call below will have already
                            // ended the response.                            
                            logger.error("execute() error release() error", err);
                            cb(err, null);
                        }
                    });
                    logger.error("execute() error", err);
                    cb(err, null);
                    //handleError(response, "execute() error", err);
                    return;
                }
                logger.info(result.rows);
                cb(null, result.rows);
                /* Release the connection back to the connection pool */
                connection.close(function(err) {
                    if (err) {
                        logger.error("normal release() error", err);
                        cb(err, null);
                        //handleError(response, "normal release() error", err);
                    } else {
                        logger.info("release() success");
                        //htmlFooter(response);
                    }
                });
            }
        );
    });
};