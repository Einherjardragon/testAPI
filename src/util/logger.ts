const path = require('path');
const log4js = require('log4js');

// 自訂日誌格式
const layout = {
    type: 'pattern',
    pattern: '%d{yyyy-MM-dd hh:mm:ss.SSS} [%p] %m'
};

// 配置log4js
log4js.configure({
    appenders: {
        // 控制台輸出
        console: { type: 'console' },
        // 日誌文件位置 dataeFile會根據日期分割
        file: { type: 'dateFile', filename: path.join(__dirname, '../log/server.log'), layout, pattern: '.yyyy-MM-dd' },
        // 日誌切割後帶後綴名稱

    },
    categories: {
        // 默認日誌
        default: { appenders: ['file', 'console'], level: 'debug' },
    }
});

// 取得默認日誌
const logger = log4js.getLogger();

module.exports = logger;