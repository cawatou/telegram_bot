var mongo = require("mongodb").MongoClient,
    Promise = require("es6-promise"),
    url  = 'mongodb://localhost:27017/tgbot';

var get = function get(col_name, limit, where, mysort){
    return new Promise(function(resolve, reject) {
        mongo.connect(url, function(err, db){
            db.collection(col_name).find(where).sort(mysort).toArray(function(err, data){
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
        console.log(col_name, new_value, old_value);
        mongo.connect(url, function(err, db){
            console.log('update');
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

module.exports.get = get;
module.exports.update = update;