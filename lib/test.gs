// Add this helper function at the top of the file
function parseDate(dateStr) {
  if (!dateStr) return null;
  if (dateStr instanceof Date) return dateStr;
  if (typeof dateStr !== 'string') return null;

  const parts = dateStr.split('/');
  if (parts.length !== 3) return null;

  const [day, month, year] = parts.map(num => parseInt(num, 10));
  return new Date(year, month - 1, day);
}

// Update the parseTime function to handle time properly
function parseTime(timeStr) {
  if (!timeStr) return [0, 0];

  // If timeStr is a Date object (which Google Sheets sends for time values)
  if (timeStr instanceof Date) {
    return [timeStr.getHours(), timeStr.getMinutes()];
  }

  // Handle string time format
  if (typeof timeStr === 'string') {
    const parts = timeStr.includes(':') ? timeStr.split(':') : timeStr.split('.');
    if (parts.length === 2) {
      return [parseInt(parts[0], 10) || 0, parseInt(parts[1], 10) || 0];
    }
  }

  return [0, 0];
}

function fetch() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet();
  const entrySheet = sheet.getSheetByName("Complaints"); // Sheet with the entry table
  const indentSheet = sheet.getSheetByName("Complaint_Records"); // Sheet where results should be output

  const entryRange = entrySheet.getDataRange();
  const values = entryRange.getValues();

  // Preserve headers
  const headers = [values[0], values[1]]; // First two rows as headers
  const data = values.slice(2); // Rest of the data (from row 3)

  // Define column indices based on letters
  const callStatusIndex = 28; // Column AC corresponds to index 27
  const complaintStatusIndex = 15; // Column P corresponds to index 16
  const statusDateIndex = 16; // Column Q corresponds to index 17
  const statusSubmittedByIndex = 17; // Column R corresponds to index 18
  const differenceDaysIndex = 18; // Column S corresponds to index 19
  const differenceDaysIndex2 = 19; // Column T corresponds to index 20
  const differenceDaysIndex3 = 20; // Column U corresponds to index 21
  const countVisitDateIndex = 21; // Column U corresponds to index 21
  const complaintNumberIndex = 2; // Column C corresponds to index 2
  const visitDateIndex = 23; // Column X corresponds to index 24
  const visitTimeIndex = 24; // Column Y corresponds to index 25
  const startDateIndex = 0; // Column A corresponds to index 1
  const submittedByIndex = 26; // Column Z corresponds to index 26
  const sumExpenseIndex = 22; // Column W (index 22)
  const expenseColumnIndex = 34; // Column AI (index 34)

  // Define date column indices to skip during trimming
  const dateColumns = [startDateIndex, statusDateIndex, visitDateIndex]; // Add any other date columns here

  // Trim and normalize data for comparison, excluding date columns
  data.forEach(row => {
    for (let i = 0; i < 23; i++) {
      if (!dateColumns.includes(i) && typeof row[i] === "string") {
        row[i] = row[i].trim(); // Trim text values only, skip date columns
      }
    }
  });

  // Sort data based only on COMPLAINT NUMBER (column 3, index 2)
  data.sort((row1, row2) => {
    const a = row1[complaintNumberIndex] || '';
    const b = row2[complaintNumberIndex] || '';
    return String(a).localeCompare(String(b));
  });

  // Combine headers and sorted data
  const sortedValues = headers.concat(data);

  // Clear the Indent sheet and write sorted data, including headers
  indentSheet.clear();

  // Format specific header cells
  const specificCells = indentSheet.getRangeList(['A1', 'D1']);
  specificCells.setFontWeight('bold')
    .setHorizontalAlignment('center')
    .setBackground('#003030')
    .setFontColor('white');
  const specificCells2 = indentSheet.getRangeList(['B1', 'E1']);
  specificCells2.setFontWeight('bold')
    .setHorizontalAlignment('center')
    .setBackground('white')
    .setFontColor('#003030');

  // Write the data
  indentSheet.getRange(1, 1, sortedValues.length, sortedValues[0].length).setValues(sortedValues);

  // Merge all 23 columns for rows with the same COMPLAINT NUMBER and fill with the first row's data
  let mergeStartRow = 3; // Start merging from row 3 (excluding headers)
  for (let i = 4; i <= sortedValues.length + 1; i++) {
    const currentComplaint = i <= sortedValues.length ? sortedValues[i - 1][complaintNumberIndex] : null;
    const previousComplaint = sortedValues[i - 2][complaintNumberIndex];

    if (currentComplaint !== previousComplaint || i > sortedValues.length) {
      if (mergeStartRow <= i - 1) {
        // Fill all rows in the group with the first row's data
        const fillData = sortedValues[mergeStartRow - 1].slice(0, 23);
        for (let j = mergeStartRow; j < i; j++) {
          for (let k = 0; k < 23; k++) {
            sortedValues[j - 1][k] = fillData[k];
          }
        }
        // Merge vertically for all 23 columns
        indentSheet.getRange(mergeStartRow, 1, i - mergeStartRow, 23).mergeVertically();
      }
      mergeStartRow = i;
    }
  }

  // Write back the updated data after filling
  indentSheet.getRange(3, 1, data.length, data[0].length).setValues(sortedValues.slice(2));

  // Update CURRENT COMPLAINT STATUS, STATUS DATE, and STATUS SUBMITTED BY using the latest VISIT DATE and TIME
  const latestComplaintStatusMap = new Map();
  data.forEach(row => {
    const complaintNumber = row[complaintNumberIndex];
    const visitDateStr = row[visitDateIndex];
    const visitTimeStr = row[visitTimeIndex];

    // Create date object and set time
    const visitDate = parseDate(visitDateStr);
    let combinedDateTime = null;
    if (visitDate) {
      combinedDateTime = new Date(visitDate);
      const [hours, minutes] = parseTime(visitTimeStr);
      combinedDateTime.setHours(hours, minutes, 0);
    }

    const callStatus = row[callStatusIndex];
    const submittedBy = row[submittedByIndex];

    if (latestComplaintStatusMap.has(complaintNumber)) {
      const existingEntry = latestComplaintStatusMap.get(complaintNumber);
      const existingDate = parseDate(existingEntry.visitDate);
      let existingDateTime = null;
      if (existingDate && existingEntry.visitTime) {
        existingDateTime = new Date(existingDate);
        const [hours, minutes] = parseTime(existingEntry.visitTime);
        existingDateTime.setHours(hours, minutes, 0);
      }

      if (combinedDateTime && (!existingDateTime || combinedDateTime > existingDateTime)) {
        latestComplaintStatusMap.set(complaintNumber, {
          visitDate: visitDateStr,
          visitTime: visitTimeStr,
          callStatus,
          submittedBy,
          dateObj: combinedDateTime
        });
      }
    } else {
      latestComplaintStatusMap.set(complaintNumber, {
        visitDate: visitDateStr,
        visitTime: visitTimeStr,
        callStatus,
        submittedBy,
        dateObj: combinedDateTime
      });
    }
  });

  // Update STATUS DATE, CURRENT COMPLAINT STATUS, and STATUS SUBMITTED BY
  data.forEach(row => {
    const complaintNumber = row[complaintNumberIndex];
    if (latestComplaintStatusMap.has(complaintNumber)) {
      const latestData = latestComplaintStatusMap.get(complaintNumber);
      row[statusDateIndex] = latestData.visitDate; // Use the date string directly
      row[complaintStatusIndex] = latestData.callStatus;
      row[statusSubmittedByIndex] = latestData.submittedBy;
    }
  });

  // Update DIFFERENCE DAYS (S) using the oldest VISIT DATE
  const oldestComplaintStatusMap = new Map();
  data.forEach(row => {
    const complaintNumber = row[complaintNumberIndex];
    const visitDate = parseDate(row[visitDateIndex]); // Parse the VISIT DATE
    const startDate = parseDate(row[startDateIndex]); // Parse the START DATE

    if (oldestComplaintStatusMap.has(complaintNumber)) {
      const existingEntry = oldestComplaintStatusMap.get(complaintNumber);
      if (visitDate < parseDate(existingEntry.visitDate)) { // Update map for oldest VISIT DATE
        oldestComplaintStatusMap.set(complaintNumber, { visitDate: visitDate, startDate: startDate });
      }
    } else {
      // Add new entry to the map
      oldestComplaintStatusMap.set(complaintNumber, { visitDate: visitDate, startDate: startDate });
    }
  });

  // Calculate and update DIFFERENCE DAYS (S)
  data.forEach(row => {
    const complaintNumber = row[complaintNumberIndex];
    if (oldestComplaintStatusMap.has(complaintNumber)) {
      const oldestData = oldestComplaintStatusMap.get(complaintNumber);
      const differenceDays = Math.max(0, Math.floor((oldestData.visitDate - oldestData.startDate) / (1000 * 60 * 60 * 24))); // Difference in days
      row[differenceDaysIndex] = differenceDays; // Update DIFFERENCE DAYS
    }
  });

  // Update DIFFERENCE DAYS (S) using the letest VISIT DATE
  const letestComplaintStatusMap = new Map();
  data.forEach(row => {
    const complaintNumber = row[complaintNumberIndex];
    const visitDate = parseDate(row[visitDateIndex]); // Parse the VISIT DATE
    const startDate = parseDate(row[startDateIndex]); // Parse the START DATE

    if (letestComplaintStatusMap.has(complaintNumber)) {
      const existingEntry = letestComplaintStatusMap.get(complaintNumber);
      if (visitDate > parseDate(existingEntry.visitDate)) { // Update map for letest VISIT DATE
        letestComplaintStatusMap.set(complaintNumber, { visitDate: visitDate, startDate: startDate });
      }
    } else {
      // Add new entry to the map
      letestComplaintStatusMap.set(complaintNumber, { visitDate: visitDate, startDate: startDate });
    }
  });

  // Update DIFFERENCE DAYS (T) based on CLOSED status in column P
  data.forEach(row => {
    if (row[complaintStatusIndex] === "CLOSED") {
      const complaintNumber = row[complaintNumberIndex];
      if (letestComplaintStatusMap.has(complaintNumber)) {
        const letestData = letestComplaintStatusMap.get(complaintNumber);
        const differenceDays = Math.max(0, Math.floor((letestData.visitDate - letestData.startDate) / (1000 * 60 * 60 * 24))); // Difference in days
        row[differenceDaysIndex2] = differenceDays; // Update DIFFERENCE DAYS
        if (oldestComplaintStatusMap.has(complaintNumber)) {
          const oldestData = oldestComplaintStatusMap.get(complaintNumber);
          const difference = Math.max(0, Math.floor((letestData.visitDate - oldestData.visitDate) / (1000 * 60 * 60 * 24))); // Difference in days
          row[differenceDaysIndex3] = difference; // Update DIFFERENCE DAYS
        }
      }
    } else {
      row[differenceDaysIndex2] = 0; // If not CLOSED, set column T to 0
      row[differenceDaysIndex3] = 0; // If not CLOSED, set column U to 0
    }
  });

  // Count all unique TICKET NUMBERs for each COMPLAINT NUMBER and update column V
  const ticketNumberIndex = 3; // Column D (TICKET NUMBER), adjust if needed
  const visitDateCountMap = new Map();
  data.forEach(row => {
    const complaintNumber = row[complaintNumberIndex];
    const ticketNumber = row[ticketNumberIndex];
    if (!visitDateCountMap.has(complaintNumber)) {
      visitDateCountMap.set(complaintNumber, new Set());
    }
    visitDateCountMap.get(complaintNumber).add(ticketNumber);
  });

  // Update the counts into column V (index 21)
  data.forEach(row => {
    const complaintNumber = row[complaintNumberIndex];
    if (visitDateCountMap.has(complaintNumber)) {
      row[countVisitDateIndex] = visitDateCountMap.get(complaintNumber).size; // Unique TICKET NUMBER count
    } else {
      row[countVisitDateIndex] = 0;
    }
  });

  // Sum up values from column AI for each unique complaint number
  const expenseSumMap = new Map(); // To store the sum of expenses per complaint number
  data.forEach(row => {
    const complaintNumber = row[complaintNumberIndex];
    const expenseValue = parseFloat(row[expenseColumnIndex]) || 0; // Ensure numeric value or default to 0
    if (!expenseSumMap.has(complaintNumber)) {
      expenseSumMap.set(complaintNumber, 0); // Initialize sum for this complaint number
    }
    expenseSumMap.set(complaintNumber, expenseSumMap.get(complaintNumber) + expenseValue); // Add expense value
  });

  // Fill summed values into column W
  data.forEach(row => {
    const complaintNumber = row[complaintNumberIndex];
    if (expenseSumMap.has(complaintNumber)) {
      row[sumExpenseIndex] = expenseSumMap.get(complaintNumber); // Update column W with the sum
    } else {
      row[sumExpenseIndex] = 0; // Default to 0 if no entries
    }
  });

  // Write back updates to the Indent sheet
  indentSheet.getRange(3, 1, data.length, data[0].length).setValues(data);

  // Format text colors for CLOSED and PENDING status in column P
  const statusColors = data.map(row => {
    const status = row[complaintStatusIndex];
    const colorArray = Array(row.length).fill(null);
    if (status === "CLOSED") {
      colorArray[complaintStatusIndex] = "#008000"; // Green color for CLOSED
    } else if (status === "PENDING") {
      colorArray[complaintStatusIndex] = "#FF0000"; // Red color for PENDING
    }
    return colorArray;
  });
  const statusRange = indentSheet.getRange(3, 1, data.length, data[0].length);
  statusRange.setFontColors(statusColors);

  // Set vertical alignment for all cells to middle
  const fullRange = indentSheet.getRange(1, 1, sortedValues.length, sortedValues[0].length);
  fullRange.setVerticalAlignment("middle");

  // Set text wrapping for row 2
  const row2Range = indentSheet.getRange(2, 1, 1, sortedValues[0].length);
  row2Range.setWrap(true)
    .setFontSize(8)
    .setFontWeight('bold')
    .setBackground('#003030')  // Dark Magenta 3
    .setFontColor('white');    // White text

  // Highlight rows with PENDING status
  const dataRange = indentSheet.getRange(3, 1, data.length, data[0].length);
  const backgrounds = data.map(row => {
    const isPending = row[complaintStatusIndex] === "PENDING";
    return Array(row.length).fill(isPending ? "#fcf9bb" : null); // Light yellow background for PENDING rows
  });
  dataRange.setBackgrounds(backgrounds);

  // Apply borders to all entered data (including the last row)
  const totalRows = sortedValues.length;
  const totalCols = sortedValues[0].length;
  const dataRangeBorders = indentSheet.getRange(3, 1, totalRows - 2, totalCols); // Data starts from row 3
  dataRangeBorders.setBorder(true, true, true, true, true, true); // Apply borders on all sides
  const headerRange = indentSheet.getRange(1, 1, 2, totalCols); // Headers (first two rows)
  headerRange.setBorder(true, true, true, true, true, true); // Borders for headers
}