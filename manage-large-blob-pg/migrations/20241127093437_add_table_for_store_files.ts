import type { Knex } from "knex";

export async function up(knex: Knex) {
  const hasTable = await knex.schema.hasTable("large_files");

  if (!hasTable) {
    return knex.schema.createTable("large_files", (tableBuilder) => {
      tableBuilder.increments();
      tableBuilder.string("name");
      tableBuilder.bigInteger("oid");
      tableBuilder.timestamps();
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists("large_files");
}
