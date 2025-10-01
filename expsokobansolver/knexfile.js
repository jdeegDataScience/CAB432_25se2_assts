require('dotenv').config();

const LOCAL_DB_CONNECTION = JSON.parse(process.env.LOCAL_DB_CONNECTION);

module.exports = {
  client: 'mysql2',
  connection: LOCAL_DB_CONNECTION
};

/*
const PG_DB_CONNECTION = process.env.PG_DB_CONNECTION;
module.exports = {
    client: 'pg',
    connection: PG_DB_CONNECTION 
}; */