import type { Knex } from "knex";

// Update with your config settings.

export const knexConfig: { [key: string]: Knex.Config } = {
  development: {
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
  },
};

module.exports = knexConfig;
