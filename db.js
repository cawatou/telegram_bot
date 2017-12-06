var mongo   = require("mongodb").MongoClient,
    Promise = require("es6-promise"),
    config  = require('./config'),
    url  = config.db_url;

var get = function get(col_name, limit, where, mysort){
    return new Promise(function(resolve, reject) {
        mongo.connect(url, function(err, db){
            //console.log("where: ", where);
            db.collection(col_name).find(where).sort(mysort).toArray(function(err, data){
                //console.log("data: ", data);
                if(limit == 'one') resolve(data[0]);
                if(limit == 'all') resolve(data);
                db.close();
            });
            if(err){
                logger.info('bd->get error:', err);
                reject(err);
            }
        });
    });
}

var update = function update(col_name, new_value, old_value){
    return new Promise(function(resolve, reject) {
        mongo.connect(url, function(err, db){
            db.collection(col_name).updateOne(old_value, new_value, function(err, res) {
                if (err) throw err;
                else resolve('update');
                db.close();
            });
            if(err){
                logger.info('bd error:', err);
                reject(err);
            }
        });
    });
}

var insert = function insert(col_name, data){
    return new Promise(function(resolve, reject) {
        mongo.connect(url, function(err, db){
            db.collection(col_name).insertOne(data, function(err, res) {
                if (err) throw err;
                else resolve('insert');
                db.close();
            });
            if(err){
                logger.info('bd error:', err);
                reject(err);
            }
        });
    });
}

module.exports.get = get;
module.exports.update = update;
module.exports.insert = insert;