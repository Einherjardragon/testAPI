const path = require('path');
const log4js = require('log4js');
const layout = {
    type: 'pattern',
    pattern: '%d{yyyy-MM-dd hh:mm:ss.SSS} [%p] %m'
};
log4js.configure({
    appenders: {
        console: { type: 'console' },
        file: { type: 'dateFile', filename: path.join(__dirname, '../log/server.log'), layout, pattern: '.yyyy-MM-dd' },
    },
    categories: {
        default: { appenders: ['file', 'console'], level: 'debug' },
    }
});
const logger = log4js.getLogger();
module.exports = logger;
