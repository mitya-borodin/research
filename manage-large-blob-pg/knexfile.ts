import type { Knex } from "knex";

// Update with your config settings.

export const knexConfig: { [key: string]: Knex.Config } = {
  development: {
    client: "postgresql",
    connection: {
      host: "pg_large_object",
      port: 5432,
      database: "pg-large-object",
      user: "pg-large-object",
      password: "pg-large-object",
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: "knex_migrations",
    },
  },
};

module.exports = knexConfig;
