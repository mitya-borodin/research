import { Readable } from "stream";
import { faker } from "@faker-js/faker";

export const runStreamGeneration = (rowAmount = 1000): Readable => {
  const stream = new Readable({ read() {}, encoding: "utf-8" });

  let count = 0;

  const interval = setInterval(() => {
    if (count >= rowAmount) {
      stream.push(Buffer.from(new Array(1)), "utf-8");

      return clearInterval(interval);
    }

    const json: any = {
      name: faker.person.fullName(),
      age: faker.number.int({ max: 1000 }),
      sex: faker.person.sex(),
      country: faker.company.name(),
      flat: faker.location.cardinalDirection(),
      aircraftType: faker.airline.aircraftType(),
      airline: faker.airline.airline(),
      airplane: faker.airline.airplane(),
      airport: faker.airline.airport(),
      flightNumber: faker.airline.flightNumber(),
      recordLocator: faker.airline.recordLocator(),
      seat: faker.airline.seat(),
    };

    for (let i = 0; i < 5000; i++) {
      json[`airplane_${i}`] = faker.airline.airplane();
    }

    stream.push(Buffer.from(JSON.stringify(json)), "utf-8");

    console.log(count);

    count += 1;
  }, 1);

  return stream;
};
