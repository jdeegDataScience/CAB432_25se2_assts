const options = require('./knexfile.js');
const knex = require('knex')(options);

module.exports = async function createDBtables() {
    console.log(options);
    // check if table 'users' exists
    knex.schema.hasTable('users').then(function (exists) {
        console.log("Users table exists: ", exists);
        if (!exists) {
            // create table 'users'
            // with a primary key using 'increments()'
            knex.schema.createTable('users', function (table) {
                table.primary('email', {constraintName: 'users_pk_email'});
                table.increments('id');
                table.string('email', 235).unique({deferrable: 'not deferrable'}).notNullable();
                table.string('hash', 60).notNullable();
                table.string('username', 235);
                table.string('firstName', 235);
                table.string('lastName', 235);
                table.date('dob');
            });
        }
    }).catch((err) => {
        console.error('Error during user table create');
        console.error('Error: ', err.message);
    });

    // check if table 'usersBLtokens' exists
    knex.schema.hasTable('usersBLtokens').then(function (exists) {
        console.log("UsersBLtokens table exists: ", exists);
        if (!exists) {
            // create table 'usersBLtokens'
            // with a primary key using 'email'
            knex.schema.createTable('usersBLtokens', function (table) {
                table.primary('email', {constraintName: 'usersBLtokens_pk_email'});
                table.string('email', 235).unique({deferrable: 'not deferrable'}).notNullable();
                table.string('BLfrom').notNullable();
            });
        }
    }).catch((err) => {
        console.error('Error during userBLtokens table create');
        console.error('Error: ', err.message);
    });

    // check if table 'puzzles' exists
    knex.schema.hasTable('puzzles').then(function (exists) {
        console.log("Puzzles table exists: ", exists);
        if (!exists) {
            // create table 'puzzles'
            // with a primary key using 'puzzleId'
            knex.schema.createTable('puzzles', function (table) {
                table.primary('puzzleId', {constraintName: 'puzzles_pk_puzzleId'});
                table.string('puzzleId').unique({deferrable: 'not deferrable'}).notNullable();
                table.integer('userId').notNullable();
                table.string('name', 235).notNullable();
                table.integer('cost').notNullable();
                table.timestamp('ts').defaultTo(knex.fn.now());
            });
        }
    }).catch((err) => {
        console.error('Error during puzzles table create');
        console.error('Error: ', err.message);
    });    
}