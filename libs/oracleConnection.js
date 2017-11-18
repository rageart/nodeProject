var oracledb = require('oracledb');
var dbConfig = require('../config/dbconfig.js');
oracledb.outFormat = oracledb.OBJECT;
oracledb.autoCommit = true;

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

    oracledb.getConnection(dbConfig)
        .then(function(connection) {
            return connection.execute(
                    query,
                    arr
                )
                .then(function(result) {
                    console.log(result.metaData);
                    console.log(result.rows);
                    cb(null, result.rows);
                    return connection.close();
                })
                .catch(function(err) {
                    console.log(err.message);
                    //response.json({error: err.message});
                    cb(err.message, null);
                    return connection.close();
                });
        })
        .catch(function(err) {
            console.error(err.message);
            //response.json({error: err.message});
            cb(err.message, null);
        });
};