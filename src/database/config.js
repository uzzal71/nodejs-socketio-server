import mysql2 from 'mysql2';

const connection = mysql2.createConnection({
  host:process.env.APP_ENV == 'production' ? process.env.DB_HOST : 'localhost'  ,
  user:process.env.APP_ENV == 'production' ? process.env.DB_USERNAME : 'root',
  password:process.env.APP_ENV == 'production' ? process.env.DB_PASSWORD : ''  ,
  database:process.env.APP_ENV == 'production' ? process.env.DB_DATABASE : 'beeda'
});

export default connection;
