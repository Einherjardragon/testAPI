#### 資料庫前置準備工作

```mysql
CREATE DATABASE IF NOT EXISTS orthanc_db DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS v5_mdeical DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS 'v5app'@'%' IDENTIFIED BY 'V5=54807093';
ALTER USER 'v5app'@'%' IDENTIFIED WITH mysql_native_password BY 'V5=54807093';

GRANT ALL PRIVILEGES ON orthanc_db.* TO 'v5app'@'%';
GRANT ALL PRIVILEGES ON v5_mdeical.* TO 'v5app'@'%';

FLUSH PRIVILEGES;

DROP TABLE IF EXISTS `sys_user`;

CREATE TABLE IF NOT EXISTS `sys_user` (
  `_id` smallint(5) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `sys_user` (`name`, `password`) VALUES("v5admin",PASSWORD("1o4xu4dk ru4"));


/*
drop user if exists '_v5app'@'%';
drop database if exists __orthanc_db;
drop database if exists __v5_mdeical;

CREATE DATABASE IF NOT EXISTS __orthanc_db DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS __v5_mdeical DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS '_v5app'@'%' IDENTIFIED BY 'V5=54807093';
ALTER USER '_v5app'@'%' IDENTIFIED WITH mysql_native_password BY 'V5=54807093';

GRANT ALL PRIVILEGES ON __orthanc_db.* TO '_v5app'@'%';
GRANT ALL PRIVILEGES ON __v5_mdeical.* TO '_v5app'@'%';

FLUSH PRIVILEGES;
*/
```
