import { faker } from "@faker-js/faker";
import { Readable } from "stream";
import { randomBytes } from "crypto";
import Knex from "knex";
import { LargeObjectManager } from "pg-large-object";

const knex = Knex({
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
});

// If you are on a high latency connection and working with
// large LargeObjects, you should increase the buffer size.
// The buffer should be divisible by 2048 for best performance
// (2048 is the default page size in PostgreSQL, see LOBLKSIZE)
const bufferSize = 8 * 2048;

const readBigFileFromPostgresByStream = async () => {
  const tx = await knex.transaction();

  const file = await knex("large_files")
    .transacting(tx)
    .select("*")
    .orderBy([{ column: "id", order: "desc" }])
    .limit(1);

  if (!file[0]?.oid) {
    console.log("The oid was not found");

    return;
  }

  const { oid } = file[0];

  const connection = await tx.client.acquireConnection();

  const largeObjectManager = new LargeObjectManager({ pg: connection });

  return largeObjectManager
    .openAndReadableStreamAsync(oid, bufferSize)
    .then(([totalSize, stream]) => {
      console.log("Streaming a large object with a total size of", totalSize);

      let count = 1;

      stream.on("data", (chunk) => {
        const kB = (count * chunk.length) / 1024;
        const mB = Number(((count * chunk.length) / 1024 / 1024).toFixed(2));
        const gB = Number(
          ((count * chunk.length) / 1024 / 1024 / 1024).toFixed(4)
        );

        if (mB % 100 === 0 || count === totalSize / chunk.length - 1) {
          console.log(
            `READ, total: ${totalSize}, count: ${count}, chunk: ${
              chunk.length
            }, ${count * chunk.length} bytes, ${kB} KB, ${mB} MB, ${gB} GB`
          );
        }

        count++;
      });

      return new Promise((resolve, reject) => {
        stream.on("end", resolve);
        stream.on("error", reject);
      })
        .then(async (result) => {
          console.log("DONE READ", result);

          console.time("Commit READ");

          await tx.commit();

          console.timeEnd("Commit READ");

          console.log("FINISH READ BIG FILE FROM POSTGRES");
        })
        .catch(async (error) => {
          console.log("ERROR READ", error);

          console.time("Rollback READ");

          await tx.rollback();

          console.timeEnd("Rollback READ");
        });
    });
};

const saveBigFileToPostgresByStream = async (fileStream: Readable) => {
  const tx = await knex.transaction();
  const connection = await tx.client.acquireConnection();

  const largeObjectManager = new LargeObjectManager({ pg: connection });

  largeObjectManager
    .createAndWritableStreamAsync(bufferSize)
    .then(async ([oid, stream]) => {
      // The server has generated an oid
      console.log("Creating a large object with the oid", oid);

      await knex("large_files")
        .transacting(tx)
        .insert({ name: faker.person.firstName(), oid });

      fileStream.pipe(stream);

      return new Promise((resolve, reject) => {
        stream.on("finish", resolve);
        stream.on("error", reject);
      });
    })
    .then(async (result) => {
      console.log("DONE WRITE", result);

      console.time("Commit WRITE");

      await tx.commit();

      console.timeEnd("Commit WRITE");

      console.log("FINISH SAVE BIG FILE TO POSTGRES");
      console.log("START READ BIG FILE FROM POSTGRES");

      await readBigFileFromPostgresByStream();
    })
    .catch(async (error) => {
      console.log("ERROR WRITE", error);

      console.time("Rollback WRITE");

      await tx.rollback();

      console.timeEnd("Rollback WRITE");
    });
};

console.log(
  "Before start should wait 1 min, for appearing stats in docker desktop."
);

setTimeout(() => {
  console.log("START SAVE BIG FILE TO POSTGRES");

  const fileStream = new Readable({ read() {} });

  saveBigFileToPostgresByStream(fileStream);

  const amount = 2000; // 3000 * 1024 * 1024KB = 3000 MB

  for (let i = 0; i < amount; i++) {
    setTimeout(
      ((index) => {
        return () => {
          const random = randomBytes(1024 * 1024); // 1024 КБ

          fileStream.push(random);

          const totalSize = amount * random.length;
          const count = index + 1;

          const mB = Number(((count * random.length) / 1024 / 1024).toFixed(2));

          if (mB % 100 === 0 || count === totalSize / random.length - 1) {
            console.log(
              `WRITE, total: ${
                amount * random.length
              }, count: ${count}, chunk: ${random.length}, ${
                count * random.length
              } bytes, ${(count * random.length) / 1024} KB, ${mB} MB, ${(
                (count * random.length) /
                1024 /
                1024 /
                1024
              ).toFixed(4)} GB`
            );
          }

          if (count === amount) {
            fileStream.push(null);
          }
        };
      })(i),
      10 * i
    );
  }
}, 1 * 60_000);
