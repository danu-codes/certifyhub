import * as XLSX from "xlsx";

const NAME_HEADERS = [
  "name",
  "full name",
  "participant name",
  "student name",
  "recipient name",
  "certificate name",
];

export async function readExcelFile(file) {
  const extension = file.name.split(".").pop()?.toLowerCase();

  if (!["xlsx", "xls", "csv"].includes(extension)) {
    throw new Error("Please upload an Excel or CSV file.");
  }

  const buffer = await file.arrayBuffer();

  const workbook = XLSX.read(buffer, {
    type: "array",
  });

  const sheetName = workbook.SheetNames[0];

  if (!sheetName) {
    throw new Error("The spreadsheet has no worksheets.");
  }

  const sheet = workbook.Sheets[sheetName];

  const rows = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    defval: "",
    blankrows: false,
  });

  if (!rows.length) {
    throw new Error("The spreadsheet is empty.");
  }

  const headers = rows[0].map((value) =>
    String(value).trim().toLowerCase()
  );

  const nameIndex = headers.findIndex((header) =>
    NAME_HEADERS.includes(header)
  );

  const columnIndex = nameIndex >= 0 ? nameIndex : 0;
  const startRow = nameIndex >= 0 ? 1 : 0;

  const participants = rows
    .slice(startRow)
    .map((row, index) => ({
      id: index + 1,
      name: String(row[columnIndex] ?? "").trim(),
    }))
    .filter((person) => person.name.length > 0);

  if (!participants.length) {
    throw new Error("No participant names were found.");
  }

  return participants;
}