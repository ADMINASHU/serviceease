function sortAndMergeColumnsToIndentTable() {
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

  // Trim and normalize data for comparison
  data.forEach((row) => {
    for (let i = 0; i < 23; i++) {
      if (typeof row[i] === "string") {
        row[i] = row[i].trim(); // Trim text values only
      }
    }
  });

  // Sort data based on the first 23 columns
  data.sort((row1, row2) => row1.slice(0, 23).join().localeCompare(row2.slice(0, 23).join()));

  // Combine headers and sorted data
  const sortedValues = headers.concat(data);

  // Clear the Indent sheet and write sorted data, including headers
  indentSheet.clear();
  indentSheet.getRange(1, 1, sortedValues.length, sortedValues[0].length).setValues(sortedValues);

  // Apply vertical merging to the first 23 columns
  let mergeStartRow = 3; // Start merging from row 3 (excluding headers)
  for (let i = 4; i <= sortedValues.length + 1; i++) {
    const currentRow =
      i <= sortedValues.length
        ? sortedValues[i - 1].slice(0, 23).join() // Slice and join the first 23 columns for comparison
        : null; // Null at the end to finalize the last group
    const previousRow = sortedValues[i - 2].slice(0, 23).join();

    // If the group ends OR it's the last row
    if (currentRow !== previousRow || i > sortedValues.length) {
      if (mergeStartRow <= i - 1) {
        indentSheet.getRange(mergeStartRow, 1, i - mergeStartRow, 23).mergeVertically(); // Merge vertically
      }
      mergeStartRow = i; // Update merge start row
    }
  }

  // Update CURRENT COMPLAINT STATUS, STATUS DATE, and STATUS SUBMITTED BY using the latest VISIT DATE and TIME
  const latestComplaintStatusMap = new Map();
  data.forEach((row) => {
    const complaintNumber = row[complaintNumberIndex];
    const visitDate = row[visitDateIndex];
    const visitTime = row[visitTimeIndex] || "00:00"; // Default to '00:00' if time is missing
    // Merge date and time for comparison (format: "YYYY-MM-DD HH:mm")
    const combinedDateTime = visitDate + " " + visitTime;
    const callStatus = row[callStatusIndex];
    const submittedBy = row[submittedByIndex];

    if (latestComplaintStatusMap.has(complaintNumber)) {
      const existingEntry = latestComplaintStatusMap.get(complaintNumber);
      const existingDateTime = existingEntry.visitDate + " " + existingEntry.visitTime;

      if (combinedDateTime > existingDateTime) {
        latestComplaintStatusMap.set(complaintNumber, {
          visitDate,
          visitTime,
          callStatus,
          submittedBy,
        });
      }
    } else {
      latestComplaintStatusMap.set(complaintNumber, {
        visitDate,
        visitTime,
        callStatus,
        submittedBy,
      });
    }
  });

  // Update STATUS DATE, CURRENT COMPLAINT STATUS, and STATUS SUBMITTED BY
  data.forEach((row) => {
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
  data.forEach((row) => {
    const complaintNumber = row[complaintNumberIndex];
    const visitDate = row[visitDateIndex];
    const visitTime = row[visitTimeIndex] || "00:00";
    const existingDateTime = new Date(visitDate + " " + visitTime);
    const startDate = new Date(row[startDateIndex]);

    if (oldestComplaintStatusMap.has(complaintNumber)) {
      const existingEntry = oldestComplaintStatusMap.get(complaintNumber);
      if (existingDateTime < new Date(existingEntry.visitDate + " " + existingEntry.visitTime)) {
        oldestComplaintStatusMap.set(complaintNumber, {
          visitDate,
          visitTime,
          startDate,
          existingDateTime,
        });
      }
    } else {
      oldestComplaintStatusMap.set(complaintNumber, {
        visitDate,
        visitTime,
        startDate,
        existingDateTime,
      });
    }
  });

  // Calculate and update DIFFERENCE DAYS (S)
  data.forEach((row) => {
    const complaintNumber = row[complaintNumberIndex];
    if (oldestComplaintStatusMap.has(complaintNumber)) {
      const oldestData = oldestComplaintStatusMap.get(complaintNumber);
      const differenceDays = Math.max(
        0,
        Math.floor((oldestData.existingDateTime - oldestData.startDate) / (1000 * 60 * 60 * 24))
      );
      row[differenceDaysIndex] = differenceDays;
    }
  });

  // Update DIFFERENCE DAYS using the latest VISIT DATE
  const letestComplaintStatusMap = new Map();
  data.forEach((row) => {
    const complaintNumber = row[complaintNumberIndex];
    const visitDate = row[visitDateIndex];
    const visitTime = row[visitTimeIndex] || "00:00";
    const existingDateTime = new Date(visitDate + " " + visitTime);
    const startDate = new Date(row[startDateIndex]);

    if (letestComplaintStatusMap.has(complaintNumber)) {
      const existingEntry = letestComplaintStatusMap.get(complaintNumber);
      if (existingDateTime > new Date(existingEntry.visitDate + " " + existingEntry.visitTime)) {
        letestComplaintStatusMap.set(complaintNumber, {
          visitDate,
          visitTime,
          startDate,
          existingDateTime,
        });
      }
    } else {
      letestComplaintStatusMap.set(complaintNumber, {
        visitDate,
        visitTime,
        startDate,
        existingDateTime,
      });
    }
  });

  // Update DIFFERENCE DAYS (T and U) based on CLOSED status
  data.forEach((row) => {
    if (row[complaintStatusIndex] === "CLOSED") {
      const complaintNumber = row[complaintNumberIndex];
      if (letestComplaintStatusMap.has(complaintNumber)) {
        const letestData = letestComplaintStatusMap.get(complaintNumber);
        const differenceDays = Math.max(
          0,
          Math.floor((letestData.existingDateTime - letestData.startDate) / (1000 * 60 * 60 * 24))
        );
        row[differenceDaysIndex2] = differenceDays;

        if (oldestComplaintStatusMap.has(complaintNumber)) {
          const oldestData = oldestComplaintStatusMap.get(complaintNumber);
          const difference = Math.max(
            0,
            Math.floor(
              (letestData.existingDateTime - oldestData.existingDateTime) / (1000 * 60 * 60 * 24)
            )
          );
          row[differenceDaysIndex3] = difference;
        }
      }
    } else {
      row[differenceDaysIndex2] = 0;
      row[differenceDaysIndex3] = 0;
    }
  });

  // Count all occurrences of VISIT DATE for each COMPLAINT NUMBER and update column V
  const visitDateCountMap = new Map();
  data.forEach((row) => {
    const complaintNumber = row[complaintNumberIndex];
    if (!visitDateCountMap.has(complaintNumber)) {
      visitDateCountMap.set(complaintNumber, 0); // Initialize count
    }
    // Increment the count for this complaint number
    visitDateCountMap.set(complaintNumber, visitDateCountMap.get(complaintNumber) + 1);
  });

  // Update the counts into column V (index 21)
  data.forEach((row) => {
    const complaintNumber = row[complaintNumberIndex];
    if (visitDateCountMap.has(complaintNumber)) {
      row[countVisitDateIndex] = visitDateCountMap.get(complaintNumber); // Total count of VISIT DATES
    } else {
      row[countVisitDateIndex] = 0; // Default to 0 if no VISIT DATE entries
    }
  });

  // Sum up values from column AI for each unique complaint number
  const expenseSumMap = new Map(); // To store the sum of expenses per complaint number
  data.forEach((row) => {
    const complaintNumber = row[complaintNumberIndex];
    const expenseValue = parseFloat(row[expenseColumnIndex]) || 0; // Ensure numeric value or default to 0
    if (!expenseSumMap.has(complaintNumber)) {
      expenseSumMap.set(complaintNumber, 0); // Initialize sum for this complaint number
    }
    expenseSumMap.set(complaintNumber, expenseSumMap.get(complaintNumber) + expenseValue); // Add expense value
  });

  // Fill summed values into column W
  data.forEach((row) => {
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
  const statusColors = data.map((row) => {
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
  row2Range.setWrap(true).setFontSize(9).setFontWeight("bold");

  // Highlight rows with PENDING status
  const dataRange = indentSheet.getRange(3, 1, data.length, data[0].length);
  const backgrounds = data.map((row) => {
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
