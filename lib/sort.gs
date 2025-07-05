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
    for (let i = 0; i < 8; i++) {
      if (typeof row[i] === "string") {
        row[i] = row[i].trim();
      }
    }
  });

  // Sort data based on the first seven columns
  data.sort((row1, row2) => row1.slice(0, 7).join().localeCompare(row2.slice(0, 7).join()));

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
      // Update columns Y to AE if needed
      const logCValue = row[2];
      if (!exclusionSet.has(logCValue)) {
        for (let col = 24; col <= 30; col++) {
          row[col] = '#####.##';
        }
      }
      if (i > 0) {
        // Blank columns 1-7 for all but first row in group
        for (let col = 0; col < 7; col++) {
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

  // --- Begin: Merge all 7 columns for each group, using columns 1-3 for comparison ---
  let rowIdx = 3; // Start from row 3 (1-based)
  for (const group of groups) {
    if (group.length > 1) {
      indentSheet.getRange(rowIdx, 1, group.length, 7).mergeVertically();
      // Merge AE column (col 31) for the group
      indentSheet.getRange(rowIdx, 31, group.length, 1).mergeVertically();
    }
    // Calculate sum of AE (col 31, index 30) for the group
    let sumAE = 0;
    for (let i = 0; i < group.length; i++) {
      const val = parseFloat(group[i][30]);
      if (!isNaN(val)) sumAE += val;
    }
    // Set the merged AE cell (first row of group) to the sum
    indentSheet.getRange(rowIdx, 31).setValue(sumAE);
    rowIdx += group.length;
  }
  // --- End: Merge all 7 columns for each group, using columns 1-3 for comparison ---

  // Apply borders to all entered data (including the last row)
  const totalRows = sortedValues.length;
  const totalCols = sortedValues[0].length;
  const dataRange = indentSheet.getRange(3, 1, totalRows - 2, totalCols); // Data starts from row 3
  dataRange.setBorder(true, true, true, true, true, true); // Apply borders on all sides
  const headerRange = indentSheet.getRange(1, 1, 2, totalCols); // Headers (first two rows)
  headerRange.setBorder(true, true, true, true, true, true); // Borders for headers

  // --- Align columns L to R (12 to 18) to right ---
 // indentSheet.getRange(3, 12, totalRows, 7).setHorizontalAlignment("right");
  // indentSheet.getRange(1,24).setHorizontalAlignment('center');
}

function getSheetURL() {
  const link =  SpreadsheetApp.getActiveSpreadsheet().getUrl();
  const url = link + '?gid=0#gid=0&range=B';
  return url;
}