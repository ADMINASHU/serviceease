function parseDate(dateStr) {
  if (!dateStr) return null;
  if (dateStr instanceof Date) return dateStr;
  if (typeof dateStr !== 'string') return null;
  const [day, month, year] = dateStr.split('/').map(num => parseInt(num, 10));
  return new Date(year, month - 1, day);
}

function parseTime(timeStr) {
  if (!timeStr) return [0, 0];
  if (timeStr instanceof Date) return [timeStr.getHours(), timeStr.getMinutes()];
  const parts = timeStr.includes(':') ? timeStr.split(':') : timeStr.split('.');
  return parts.length === 2 ? [parseInt(parts[0], 10) || 0, parseInt(parts[1], 10) || 0] : [0, 0];
}

function fetch() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet();
  const entrySheet = sheet.getSheetByName("Complaints");
  const indentSheet = sheet.getSheetByName("Complaint_Records");

  const values = entrySheet.getDataRange().getValues();
  const headers = values.slice(0, 2);
  const data = values.slice(2);

  // Column Indexes
  const complaintNumberIndex = 2, visitDateIndex = 25, visitTimeIndex = 26;
  const callStatusIndex = 30, submittedByIndex = 28, expenseColumnIndex = 36;
  const startDateIndex = 0, complaintStatusIndex = 17, statusDateIndex = 18, statusSubmittedByIndex = 19;
  const differenceDaysIndex = 20, differenceDaysIndex2 = 21, differenceDaysIndex3 = 22;
  const countVisitIndex = 23, sumExpenseIndex = 24, ticketNumberIndex = 1;

  // Trim Text Values (Batch Processing)
  data.forEach(row => row.forEach((_, i) => row[i] = (typeof row[i] === "string") ? row[i].trim() : row[i]));

  // Sorting by Complaint Number
  data.sort((a, b) => String(a[complaintNumberIndex]).localeCompare(String(b[complaintNumberIndex])));

  // Optimize Maps for Processing
  const latestComplaintStatusMap = new Map();
  const oldestComplaintStatusMap = new Map();
  const ticketNumberCountMap = new Map();
  const expenseSumMap = new Map();

  data.forEach(row => {
    const complaintNumber = row[complaintNumberIndex];
    const visitDate = parseDate(row[visitDateIndex]);
    const startDate = parseDate(row[startDateIndex]);
    const callStatus = row[callStatusIndex], submittedBy = row[submittedByIndex];
    const expenseValue = parseFloat(row[expenseColumnIndex]) || 0;
    const ticketNumber = row[ticketNumberIndex];

    // Latest Complaint Status Tracking
    if (!latestComplaintStatusMap.has(complaintNumber) || visitDate > parseDate(latestComplaintStatusMap.get(complaintNumber).visitDate)) {
      latestComplaintStatusMap.set(complaintNumber, { visitDate, startDate, callStatus, submittedBy });
    }

    // Oldest Complaint Status Tracking
    if (!oldestComplaintStatusMap.has(complaintNumber) || visitDate < parseDate(oldestComplaintStatusMap.get(complaintNumber).visitDate)) {
      oldestComplaintStatusMap.set(complaintNumber, { visitDate, startDate });
    }

    // Track Ticket Numbers Count
    if (!ticketNumberCountMap.has(complaintNumber)) ticketNumberCountMap.set(complaintNumber, new Set());
    if (ticketNumber) ticketNumberCountMap.get(complaintNumber).add(ticketNumber);

    // Sum Expenses
    expenseSumMap.set(complaintNumber, (expenseSumMap.get(complaintNumber) || 0) + expenseValue);
  });

  // Applying Data Updates Efficiently
  data.forEach(row => {
    const complaintNumber = row[complaintNumberIndex];
    if (latestComplaintStatusMap.has(complaintNumber)) {
      const latestData = latestComplaintStatusMap.get(complaintNumber);
      row[statusDateIndex] = latestData.visitDate;
      row[complaintStatusIndex] = latestData.callStatus;
      row[statusSubmittedByIndex] = latestData.submittedBy;
    }
    if (oldestComplaintStatusMap.has(complaintNumber)) {
      const oldestData = oldestComplaintStatusMap.get(complaintNumber);
      row[differenceDaysIndex] = Math.max(0, Math.floor((oldestData.visitDate - oldestData.startDate) / (1000 * 60 * 60 * 24)));
    }
    if (row[complaintStatusIndex] === "CLOSED" && latestComplaintStatusMap.has(complaintNumber)) {
      const latestData = latestComplaintStatusMap.get(complaintNumber);
      row[differenceDaysIndex2] = Math.max(0, Math.floor((latestData.visitDate - latestData.startDate) / (1000 * 60 * 60 * 24)));
      if (oldestComplaintStatusMap.has(complaintNumber)) {
        const oldestData = oldestComplaintStatusMap.get(complaintNumber);
        row[differenceDaysIndex3] = Math.max(0, Math.floor((latestData.visitDate - oldestData.visitDate) / (1000 * 60 * 60 * 24)));
      }
    } else {
      row[differenceDaysIndex2] = 0;
      row[differenceDaysIndex3] = 0;
    }
    row[countVisitIndex] = ticketNumberCountMap.has(complaintNumber) ? ticketNumberCountMap.get(complaintNumber).size : 0;
    row[sumExpenseIndex] = expenseSumMap.get(complaintNumber) || 0;
  });

  // Push optimized data back in a single batch
  indentSheet.getRange(3, 1, data.length, data[0].length).setValues(data);

  // Unmerge all merged cells in the data range before merging new groups
  indentSheet.getRange(3, 1, data.length, 25).breakApart();

  // Merge all 25 columns for rows with the same COMPLAINT NUMBER and fill with the first row's data
  let mergeStartRow = 3; // Start merging from row 3 (excluding headers)
  for (let i = 4; i <= data.length + 2; i++) {
    const currentComplaint = i <= data.length + 2 ? data[i - 1 - 2][complaintNumberIndex] : null;
    const previousComplaint = data[i - 2 - 2] ? data[i - 2 - 2][complaintNumberIndex] : null;

    const groupSize = i - mergeStartRow;
    if (currentComplaint !== previousComplaint || i > data.length + 2) {
      if (mergeStartRow <= i - 1 && groupSize > 1) {
        // Fill all rows in the group with the first row's data, except TICKET NUMBER (index 1)
        const fillData = data[mergeStartRow - 3].slice(0, 25);
        for (let j = mergeStartRow; j < i; j++) {
          for (let k = 0; k < 25; k++) {
            if (k === 1) continue; // Skip TICKET NUMBER column
            data[j - 3][k] = fillData[k];
          }
        }
        // Only merge if more than one row in the group
        indentSheet.getRange(mergeStartRow, 1, groupSize, 25).mergeVertically();
      }
      mergeStartRow = i;
    }
  }

  // Write back the updated data after filling
  indentSheet.getRange(3, 1, data.length, data[0].length).setValues(data);

  // Formatting Enhancements (Batch Operations)
  const statusColors = data.map(row => {
    const status = row[complaintStatusIndex];
    return Array(row.length).fill(status === "CLOSED" ? "#008000" : status === "PENDING" ? "#FF0000" : null);
  });

  const backgrounds = data.map(row => Array(row.length).fill(row[complaintStatusIndex] === "PENDING" ? "#fcf9bb" : null));

  indentSheet.getRange(3, 1, data.length, data[0].length).setFontColors(statusColors).setBackgrounds(backgrounds);
  indentSheet.getRange(1, 1, headers.length + data.length, headers[0].length).setVerticalAlignment("middle");

  // Apply borders to all entered data (including the last row) in a single batch
  const totalRows = data.length;
  const totalCols = data[0].length;
  const dataRangeBorders = indentSheet.getRange(3, 1, totalRows, totalCols); // Data starts from row 3
  dataRangeBorders.setBorder(true, true, true, true, true, true); // Apply borders on all sides
  const headerRange = indentSheet.getRange(1, 1, 2, totalCols); // Headers (first two rows)
  headerRange.setBorder(true, true, true, true, true, true); // Borders for headers
}



function addDynamicHyperlinks() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var sheetName = sheet.getName(); // Get active sheet name

  // Regular expression to match names like "JAN 25", "FEB 25", etc.
  var validSheetPattern = /^[A-Z]{3} 25$/;

  if (!validSheetPattern.test(sheetName)) {
    Logger.log("Skipped: Sheet name '" + sheetName + "' does not match the required format.");
    return; // Exit script if sheet name does not match
  }

  var lastRow = sheet.getLastRow(); // Get last row with data
  var values = sheet.getRange("M5:M" + lastRow).getValues(); // Values in column M
  var categoryRange = sheet.getRange("E5:E" + lastRow).getValues(); // Corresponding values in column E

  for (var i = 0; i < values.length; i++) {
    var cellValue = values[i][0]; // Value from column M
    var category = categoryRange[i][0]; // Value from column E

    // Skip rows if column M or E is blank, OR if column M does not start with "B"
    if (!cellValue || !category || !cellValue.startsWith("B")) {
      sheet.getRange(i + 5, 35).setValue("");
      continue;
    }
    var callType = "";
    // Mapping values in column E to call categories
    if (category.toUpperCase().includes("PM")) {
      callType = "PMCALLS";
    } else if (category.toUpperCase().includes("STAND BY")) {
      callType = "INSTALLATIONCALLS";
    } else if (category.toUpperCase().includes("CHARGEABLE")) {
      callType = "BREAKDOWNCALLS";
    } else if (category.toUpperCase().includes("INSTALLATION")) {
      callType = "INSTALLATIONCALLS";
    } else if (category.toUpperCase().includes("SERVICE")) {
      callType = "BREAKDOWNCALLS";
    } else {
      callType = "BREAKDOWNCALLS"; // Default if no match is found
    }

    var hyperlinkFormula = `=HYPERLINK("http://serviceease.techser.com/live/index.php/calls/fsrreport1/${callType}/${cellValue}", "${cellValue}")`;
    sheet.getRange(i + 5, 35).setFormula(hyperlinkFormula); // Writing back to column AI (35th column)
  }
}