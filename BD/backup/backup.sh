mysqldump --user=${MYSQL_USER} --password=${MYSQL_PASSWORD} oficinaSubasta > /docker-entrypoint-initdb.d/setup.sql
