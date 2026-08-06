(() => {
  "use strict";

  const MAX_CSV_ROWS = 10000;
  const MAX_CSV_COLUMNS = 64;
  const MAX_CSV_FIELD_CHARS = 2000;

  function parseCsv(text) {
    if (typeof text !== "string") throw new Error("CSV content must be text.");
    const rows = [];
    let row = [];
    let field = "";
    let inQuotes = false;
    let quoteClosed = false;

    const appendToField = value => {
      field += value;
      if (field.length > MAX_CSV_FIELD_CHARS) {
        throw new Error(`A CSV field exceeds the ${MAX_CSV_FIELD_CHARS.toLocaleString()} character safety limit.`);
      }
    };

    const commitField = () => {
      if (row.length >= MAX_CSV_COLUMNS) {
        throw new Error(`A CSV row exceeds the ${MAX_CSV_COLUMNS} column safety limit.`);
      }
      row.push(field);
      field = "";
      quoteClosed = false;
    };

    const commitRow = () => {
      commitField();
      if (row.some(value => value !== "")) {
        if (rows.length >= MAX_CSV_ROWS) {
          throw new Error(`The CSV exceeds the ${MAX_CSV_ROWS.toLocaleString()} row safety limit.`);
        }
        rows.push(row);
      }
      row = [];
    };

    for (let index = 0; index < text.length; index += 1) {
      const char = text[index];
      const next = text[index + 1];

      if (inQuotes) {
        if (char === '"' && next === '"') {
          appendToField('"');
          index += 1;
        } else if (char === '"') {
          inQuotes = false;
          quoteClosed = true;
        } else {
          appendToField(char);
        }
        continue;
      }

      if (char === ",") {
        commitField();
      } else if (char === "\n" || char === "\r") {
        if (char === "\r" && next === "\n") index += 1;
        commitRow();
      } else if (char === '"') {
        if (field.length || quoteClosed) throw new Error("The CSV contains an unexpected quote.");
        inQuotes = true;
      } else {
        if (quoteClosed) throw new Error("The CSV contains content after a closing quote.");
        appendToField(char);
      }
    }

    if (inQuotes) throw new Error("The CSV contains an unclosed quoted field.");
    commitRow();
    return rows;
  }

  const api = {
    parseCsv,
    constants: { MAX_CSV_ROWS, MAX_CSV_COLUMNS, MAX_CSV_FIELD_CHARS }
  };

  globalThis.SentinelCsv = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})();
