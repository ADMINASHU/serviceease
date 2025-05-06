function sortAndMergeColumnsToIndentTable() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet();
  const entrySheet = sheet.getSheetByName("Log"); // Sheet with the entry table
  const indentSheet = sheet.getSheetByName("Indent"); // Sheet where results should be output

  const entryRange = entrySheet.getDataRange();
  const values = entryRange.getValues();

  // Preserve headers
  const headers = [values[0], values[1]]; // First two rows as headers
  const data = values.slice(2); // Rest of the data (from row 3)

  // Trim and normalize data for comparison
  data.forEach(row => {
    for (let i = 0; i < 6; i++) {
      if (typeof row[i] === "string") {
        row[i] = row[i].trim();
      }
    }
  });

  // Sort data based on the first six columns
  data.sort((row1, row2) => row1.slice(0, 6).join().localeCompare(row2.slice(0, 6).join()));

  // --- Begin: Group rows by columns 1-3 ---
  const groups = [];
  let currentGroup = [];
  let prevKey = null;
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const currKey = [row[0], row[1], row[2]].join("||");
    if (currKey !== prevKey && currentGroup.length > 0) {
      groups.push(currentGroup);
      currentGroup = [];
    }
    currentGroup.push(row);
    prevKey = currKey;
  }
  if (currentGroup.length > 0) groups.push(currentGroup);
  // --- End: Group rows by columns 1-3 ---

  // --- Begin: Optimize exclusion check using Set ---
  const summarySheet = sheet.getSheetByName("Summary");
  const summaryLastRow = summarySheet.getLastRow();
  let exclusionValues = [];
  if (summaryLastRow >= 5) {
    exclusionValues = summarySheet.getRange(5, 2, summaryLastRow - 4, 1).getValues();
  }
  const exclusionSet = new Set(exclusionValues.flat().filter(v => v !== "" && v != null));
  // --- End: Optimize exclusion check using Set ---

  // --- Begin: Build output rows with only first row of each group having values in columns 1-6 ---
  const outputRows = [];
  for (const group of groups) {
    for (let i = 0; i < group.length; i++) {
      const row = group[i].slice(); // clone
      // Update columns J to P if needed
      const logCValue = row[2];
      if (!exclusionSet.has(logCValue)) {
        for (let col = 9; col <= 15; col++) {
          row[col] = '#####.##';
        }
      }
      if (i > 0) {
        // Blank columns 1-6 for all but first row in group
        for (let col = 0; col < 6; col++) {
          row[col] = "";
        }
      }
      outputRows.push(row);
    }
  }
  // --- End: Build output rows with only first row of each group having values in columns 1-6 ---

  // Combine headers and processed data
  const sortedValues = headers.concat(outputRows);

  // Write to Indent sheet
  indentSheet.clear();
  indentSheet.getRange(1, 1, sortedValues.length, sortedValues[0].length).setValues(sortedValues);

  // Copy formatting (including date format) from Entry sheet to Indent sheet
  const entryRangeFormat = entrySheet.getRange(1, 1, entrySheet.getLastRow(), entrySheet.getLastColumn());
  const indentRangeFormat = indentSheet.getRange(1, 1, sortedValues.length, entrySheet.getLastColumn());
  entryRangeFormat.copyTo(indentRangeFormat, { formatOnly: true });

  // --- Begin: Merge all 6 columns for each group, using columns 1-3 for comparison ---
  let rowIdx = 3; // Start from row 3 (1-based)
  for (const group of groups) {
    if (group.length > 1) {
      indentSheet.getRange(rowIdx, 1, group.length, 6).mergeVertically();
    }
    rowIdx += group.length;
  }
  // --- End: Merge all 6 columns for each group, using columns 1-3 for comparison ---

  // Apply borders to all entered data (including the last row)
  const totalRows = sortedValues.length;
  const totalCols = sortedValues[0].length;
  const dataRange = indentSheet.getRange(3, 1, totalRows - 2, totalCols); // Data starts from row 3
  dataRange.setBorder(true, true, true, true, true, true); // Apply borders on all sides
  const headerRange = indentSheet.getRange(1, 1, 2, totalCols); // Headers (first two rows)
  headerRange.setBorder(true, true, true, true, true, true); // Borders for headers

  // --- Align columns J to P (10 to 16) to right ---
  indentSheet.getRange(1, 10, totalRows, 7).setHorizontalAlignment("right");
}