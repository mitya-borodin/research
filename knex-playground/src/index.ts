import Knex from "knex";

const knex = Knex({
  client: "postgresql",
  connection: {
    host: "localhost",
    port: 6000,
    database: "pg-knex-playground",
    user: "pg-knex-playground",
    password: "pg-knex-playground",
  },
  pool: {
    min: 2,
    max: 10,
  },
  migrations: {
    tableName: "knex_migrations",
  },
});

const builder = knex.schema.createTable("table_name", function (table) {
  table.uuid("id").primary();
  table.string("external_id", 36);
  table.string("type", 255);
  table.string("user_id", 36);
  table.timestamp("created_at").defaultTo(knex.fn.now());
});

console.log(
  builder
    .toSQL()
    .map(({ sql }) => sql)
    .join(";\n\r")
);
