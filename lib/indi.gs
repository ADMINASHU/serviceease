function onEdit(e) {
  const sheet = e.source.getActiveSheet();
  const editedRange = e.range;

  if (sheet.getName() === "Entry") {
    const row = editedRange.getRow();
    const bValue = sheet.getRange(row, 2).getValue();
    if (!bValue) return;

    const fixedColumnCount = 53;
    const data = sheet.getRange(3, 1, sheet.getMaxRows() - 2, fixedColumnCount).getValues();
    const nonBlankData = data.filter(row => row.some(cell => cell !== ''));
    const filteredData = nonBlankData.filter(row => row[1] === bValue);

    if (filteredData.length > 0) {
      var allData = filteredData.map(row => {
        const trimmed = row.slice(0, fixedColumnCount);
        while (trimmed.length < fixedColumnCount) trimmed.push('');
        return trimmed;
      });

      generateSingleIndentPDF( allData, sheet);
    }
  }
}

function generateSingleIndentPDF( allData, sheet) {
  const templateDocId = "1Ne7JoH0Dl1GEkyaLezBTI_TLXvG5z3bnZYwrBexi5cw";
  const targetFolderId = "1IUlGqtBZ6AsC3O_Xm5WqVbbOwi4Sa-sF";

  let data = null, dataB = null, dataR = null, dataC = null;

  for (let i = 0; i < allData.length; i++) {
    const row = allData[i];
    const product = (row[7] || "").toString().toUpperCase();
    console.log(product);
    if (!data && (product.includes("UPS") || product.includes("INVERTER") || product.includes("SERVO"))) {
      data = row;
    } else if (!dataB && product.includes("BATTERY")) {
      dataB = row;
    } else if (!dataR && product.includes("RACK")) {
      dataR = row;
    } else if (!dataC && product.includes("CABLE")) {
      dataC = row;
    }
  }
console.log(allData[0]);
  const featureStr = data[13];
  const featureStr2 = dataB && dataB[13];

  const templateFile = DriveApp.getFileById(templateDocId);
  const indentNo = data[1];
  const copyFile = templateFile.makeCopy("Indent-" + indentNo);
  const copyDocId = copyFile.getId();
  const doc = DocumentApp.openById(copyDocId);
  const body = doc.getBody();

  const headers = Array.from({ length: 53 }, (_, i) => `COL${i + 1}`); // Customize if needed

  // Map table fields for each product type row (data, dataB, dataR, dataC)
  var placeholderMap = {
    "{{INDENT}}": data[1],
    "{{DATE}}": data[0] ? Utilities.formatDate(new Date(data[0]), Session.getScriptTimeZone(), "dd/MM/yyyy") : "",
    "{{PLANT}}": data[35],
    "{{GROUP}}": data[2],
    "{{BRANCH}}": data[3],
    "{{OWNER}}": data[4],
    "{{APVPCO}}": data[31],
    "{{REVDATE}}":data[32] ?  Utilities.formatDate(
      new Date(data[32]),
      Session.getScriptTimeZone(),
      "dd/MM/yyyy"
    ) : "",
    "{{OANUM}}": data[34],
    "{{APVBY}}": data[46],
    "{{APVDATE}}":data[48] ?  Utilities.formatDate(
      new Date(data[48]),
      Session.getScriptTimeZone(),
      "dd/MM/yyyy"
    ) : "",
    "{{PRODUCT}}": data[7],
    "{{RAT}}": data[8],
    "{{A}}": data[14] + " A",
    "{{VOLT}}": data[12] + " V",
    "{{PF}}": data[11],
    "{{QTY}}": data[10] + " Nos",
    "{{PHASE}}": data[9],
    "{{MODEL}}": data[15],
    "{{DRBDATE}}":data[36] ? Utilities.formatDate(new Date(data[36]), Session.getScriptTimeZone(), "dd/MM/yyyy") : "",
    "{{TOC}}": data[40],
    "{{AP}}": data[41] + " A",
    "{{DPDATE}}": data[42] ? Utilities.formatDate(new Date(data[42]), Session.getScriptTimeZone(), "dd/MM/yyyy") : "",

    "{{v1}}": getFeatures(featureStr, "HSB"),
    "{{v2}}": getFeatures(featureStr, "PRS"),
    "{{v3}}": getFeatures(featureStr, "LCD"),
    "{{v4}}": getFeatures(featureStr, "RS232"),
    "{{v5}}": getFeatures(featureStr, "BISBS"),
    "{{v6}}": getFeatures(featureStr, "SNMP"),
    "{{v7}}": getFeatures(featureStr, "MB"),
    "{{v8}}": getFeatures(featureStr, "CBB"),

    "{{v14}}": getFeatures(featureStr, "PBB"),
    "{{v15}}": getFeatures(featureStr, "CTBB"),
    "{{v16}}": getFeatures(featureStr, "ESBS"),

    "{{v9}}": getFeatures(featureStr, "ETR"),
    "{{WARR}}": data[17] + " Yr",
    "{{v10}}": getFeatures(featureStr, "SENC"),
    "{{TYPE}}": dataB !== null && dataB[16],
    "{{MAKE}}": dataB !== null && dataB[15],
    "{{CAP}}": dataB !== null && dataB[8],
    "{{BQTY}}": dataB !== null && dataB[10] + " Nos",
    "{{BWARR}}": dataB !== null && dataB[17] + " Yr",
    "{{v11}}": getFeatures2(featureStr2, "Battery-Stand"),
    "{{v12}}": getFeatures2(featureStr2, "Battery-Box"),
    "{{v13}}": data[43] === "APPROVED" ? "Y" : "X",
    "{{v17}}": getFeatures2(featureStr2, "Inter-Lnk-Cable"),


    "{{CPERSON}}": data[19],

    "{{SHADDRESS}}": data[21],
    "{{GSTIN}}": data[20],
    "{{PO}}": data[18],
    "{{DECINV}}": data[23],
    "{{BILLADDRESS}}": data[22],


    "{{BBR}}": "₹" + parseFloat(tbrValue).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    "{{TBB}}": "₹" + parseFloat(tbbValue).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    "{{TBV}}": "₹" + parseFloat(tbvValue).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    "{{TTX}}": "₹" + parseFloat(ttxValue).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    "{{TOV}}": "₹" + parseFloat(billValue).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    "{{TOTP}}": "₹" + parseFloat(totpValue).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    "{{CON}}": "₹" + parseFloat(conValue).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    "{{REMARKS}}": data[51], // BC8
    "{{DATETIME}}": Utilities.formatDate(
      new Date(),
      Session.getScriptTimeZone(),
      "dd/MM/yyyy HH:mm"
    ) ,
    // Table row 1: data (UPS/INVERTER/SERVO)
    "{{a1}}": safeVal(data, 25), // Z
    "{{b1}}": safeVal(data, 24), // AA
    "{{c1}}": safeVal(data, 7), // H
    "{{d1}}": rateVal(safeVal2(data, 28), safeVal2(data, 26), safeVal2(data, 10)),
    "{{e1}}": safeVal2(data, 10), // K
    "{{f1}}": safeVal(data, 26),
    "{{g1}}": safeVal(data, 28), // AC

    // Table row 2: dataB (BATTERY)
    "{{a2}}": safeVal(dataB, 25),
    "{{b2}}": safeVal(dataB, 24),
    "{{c2}}": safeVal(dataB, 7),
    "{{d2}}": rateVal(safeVal2(dataB, 28), safeVal2(dataB, 26), safeVal2(dataB, 10)),
    "{{e2}}": safeVal2(dataB, 10),
    "{{f2}}": safeVal(dataB, 26),
    "{{g2}}": safeVal(dataB, 28),

    // Table row 3: dataR (RACK)
    "{{a3}}": safeVal(dataR, 25),
    "{{b3}}": safeVal(dataR, 24),
    "{{c3}}": safeVal(dataR, 7),
    "{{d3}}": rateVal(safeVal2(dataR, 28), safeVal2(dataR, 26), safeVal2(dataR, 10)),
    "{{e3}}": safeVal2(dataR, 10),
    "{{f3}}": safeVal(dataR, 26),
    "{{g3}}": safeVal(dataR, 28),

    // Table row 4: dataC (CABLE)
    "{{a4}}": safeVal(dataC, 25),
    "{{b4}}": safeVal(dataC, 24),
    "{{c4}}": safeVal(dataC, 7),
    "{{d4}}": rateVal(safeVal2(dataC, 28), safeVal2(dataC, 26), safeVal2(dataC, 10)),
    "{{e4}}": safeVal2(dataC, 10),
    "{{f4}}": safeVal(dataC, 26),
    "{{g4}}": safeVal(dataC, 28),
  };


  for (const key in placeholderMap) {
    body.replaceText(key, placeholderMap[key] ?? "");
  }

  const footer = doc.getFooter();
  if (footer) {
    for (const key in placeholderMap) {
      footer.replaceText(key, placeholderMap[key] ?? "");
    }
  }

  doc.saveAndClose();
  const pdfFile = DriveApp.getFileById(copyDocId).getAs("application/pdf");
  const createdFile = DriveApp.getFolderById(targetFolderId).createFile(pdfFile);
  const pdfUrl = createdFile.getUrl();

  // Write the PDF link into all matching rows in "Entry"
  const indentValue = data[1];
  const bValues = sheet.getRange(3, 2, sheet.getLastRow() - 2).getValues();

  for (let i = 0; i < bValues.length; i++) {
    if (bValues[i][0] === indentValue) {
      sheet.getRange(i + 3, 52).setValue(pdfUrl); // Column Z (26)
    }
  }

  Logger.log("PDF generated: " + pdfUrl);
}