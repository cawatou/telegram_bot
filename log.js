const log4js = require('log4js');
log4js.configure({
    appenders: { cheese: { type: 'file', filename: 'logs/cheese.log' } },
    categories: { default: { appenders: ['cheese'], level: 'info' } }
});

const log = log4js.getLogger('request');
module.exports = log;