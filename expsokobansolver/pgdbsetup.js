const options = require('./knexfile.js');
const knex = require('knex')(options);

async function main() {
    // create table 'users'
    // with a primary key using 'increments()'
    knex.schema.createTable('users', function (table) {
        table.primary('email', {constraintName: 'users_pk_email'});
        table.increments('userId');
        table.string('email', 235).unique({deferrable: 'not deferrable'}).notNullable();
        table.string('hash', 60).notNullable();
        table.string('firstName', 235);
        table.string('lastName', 235);
        table.date('dob');
    });

    knex.schema.createTable('usersBLtokens', function (table) {
        table.primary('email', {constraintName: 'usersBLtokens_pk_email'});
        table.string('email', 235).unique({deferrable: 'not deferrable'}).notNullable();
        table.string('BLfrom').notNullable();
    });

    knex.schema.createTable('puzzles', function (table) {
        table.primary('puzzleId', {constraintName: 'puzzles_pk_puzzleId'});
        table.string('puzzleId').unique({deferrable: 'not deferrable'}).notNullable();
        table.integer('userId').notNullable();
        table.string('name', 235).notNullable();
        table.string('solnVis', 235).notNullable();
        table.string('solnMoves', 235).notNullable();
        table.integer('solnCost').notNullable();
        table.timestamp('ts').defaultTo(knex.fn.now());
    });
}

main();