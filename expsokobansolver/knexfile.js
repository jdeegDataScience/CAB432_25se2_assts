require('dotenv').config();

/* const LOCAL_DB_CONNECTION = JSON.parse(process.env.LOCAL_DB_CONNECTION);

module.exports = {
  client: 'mysql2',
  connection: LOCAL_DB_CONNECTION
}; */

const PG_PASSWORD = process.env.PG_PASSWORD;

module.exports = {
    client: 'pg',
    connection: {
        host: "database-1-instance-1.ce2haupt2cta.ap-southeast-2.rds.amazonaws.com",
        port: "5432",
        database: "cohort_2025",
        user: "s100",
        password: PG_PASSWORD
    } 
};