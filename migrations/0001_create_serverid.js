const tableName = 'serverid';

exports.up = (knex, Promise) => {
    return knex
        .schema
        .createTable(tableName, (t) => {
            t.increments('id').unsigned().notNullable().primary();
            t.dateTime('created_at').notNullable();
            t.dateTime('updated_at').notNullable();
            t.string('server_name').notNullable();
            t.string('server_ip').notNullable();
            t.string('server_port');
            t.string('server_description').notNullable();
            t.string('votifier_host');
            t.string('votifier_port');
            t.string('votifier_public_key');
            t.string('server_website');
            t.string('discord_server');
            t.string('server_country').notNullable();

            t.unique('server_name', 'server_ip', 'server_uq1');
        });
};

exports.down = (knex, Promise) => {
    return knex.schema.dropTable(tableName);
};
