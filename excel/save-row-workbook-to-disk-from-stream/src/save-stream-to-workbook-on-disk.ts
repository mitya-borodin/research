import Excel from "exceljs";
import { Readable, Writable } from "stream";

type SaveStreamToWorkbookOnDisk = {
  input: Readable;
  output: Writable;
};

export const saveStreamToWorkbookOnDisk = ({
  input,
  output,
}: SaveStreamToWorkbookOnDisk) => {
  const workbook = new Excel.stream.xlsx.WorkbookWriter({ stream: output });

  const worksheet = workbook.addWorksheet("example-report", {
    headerFooter: { firstHeader: "Hello Exceljs", firstFooter: "Hello World" },
  });

  const columns = [
    { header: "NAME", key: "name", width: 15 },
    { header: "AGE", key: "age", width: 15 },
    { header: "SEX", key: "sex", width: 15 },
    { header: "country", key: "country", width: 15 },
    { header: "flat", key: "flat", width: 15 },
    { header: "aircraftType", key: "aircraftType", width: 15 },
    { header: "airline", key: "airline", width: 15 },
    { header: "airplane", key: "airplane", width: 15 },
    { header: "airport", key: "airport", width: 15 },
    { header: "flightNumber", key: "flightNumber", width: 15 },
    { header: "recordLocator", key: "recordLocator", width: 15 },
    { header: "seat", key: "seat", width: 15 },
  ];

  for (let i = 0; i < 5000; i++) {
    columns.push({
      header: "airplane_" + i,
      key: "airplane_" + i,
      width: 15,
    });
  }

  worksheet.columns = columns;

  input.on("data", async (buffer) => {
    let rowData = null;

    if (buffer.length === 1) {
      console.log("LAST CHUNK OBTAINER");

      await workbook.commit();
    } else {
      worksheet.addRow(JSON.parse(buffer.toString())).commit();
    }
  });
};
