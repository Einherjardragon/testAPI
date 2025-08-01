docker run -d -p 3306:3306 --name mysql -e MYSQL_ROOT_PASSWORD=123456 -e MYSQL_DATABASE=test mysql:8

## 安裝依賴

在專案根目錄下，使用 npm 安裝所需的依賴：

```bash
npm install
```

執行
node index.js

預設port 8081
若要更改port 可直接在index.js
 server.listen(8081, function () {
        return __awaiter(this, void 0, void 0, function* () {
            logger.info(`Express server has started on port ${8081}. `);
        });
    });
