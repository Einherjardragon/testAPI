建立 volume 儲存資料
```bash
docker volume create mysql-data
```

執行mysql docker 預設密碼和DB名稱
```bash
docker run -d -p 3306:3306 --name mysql -e MYSQL_ROOT_PASSWORD=123456 -e MYSQL_DATABASE=test mysql:8 --character-set-server=utf8mb4 --collation-server=utf8mb4_unicode_ci
```

## 安裝依賴

在專案根目錄下，使用 npm 安裝所需的依賴：

```bash
npm install
```

執行
```bash
node index.js
```

預設port 8081
若要更改port 可直接在index.js內做修改

## 20250804
1. 更新批次刪除後，批次下case同步刪除
2. 更新case儲存時所需帶入的資料
3. 更新API說明