import { NextResponse } from "next/server";
const cheerio = require("cheerio");

// In-memory store for context
let contextStore = {};

const extractTableData = (
  htmlString,
  start = 0,
  chunkSize = 500,
  month,
  year,
  region,
  branch,
  type,
  callstatus
) => {
  const $ = cheerio.load(htmlString);
  const decodeHtmlEntity = (str) => $("<textarea>").html(str).text();
  const rows = $("tbody tr").slice(start, start + chunkSize);
  const data = [];

  rows.each((i, row) => {
    const cells = $(row).find("td");
    data.push({
      callNo: cells[1] ? $(cells[1]).find("a").text().trim() || "" : "",
      natureOfComplaint: type || "",
      callStatus: callstatus || "",
      // faultReport: cells[2] ? ($(cells[2]).text().trim() || '') : '',
      callDate: cells[3] ? $(cells[3]).text().trim() || "" : "",
      callStartDate: cells[4] ? $(cells[4]).html().split("<br>")[0].trim() || "" : "",
      callEndDate: cells[4] ? $(cells[4]).html().split("<br>")[1].trim() || "" : "",
      engineerName: cells[5] ? $(cells[5]).find("a").text().trim() || "" : "",
      // engineerContact: cells[5] ? ($(cells[5])?.html()?.split("<br>")[1]?.trim()?.split(/[\s\n\t]+/)[0] || '') : '',
      // serialNo: cells[6] ? ($(cells[6]).html().split("<br>")[0].trim() || '') : '',
      // productCategory: cells[6] ? ($(cells[6]).html().split("<br>")[1].trim() || '') : '',
      // productSeries: cells[6] ? ($(cells[6]).html().split("<br>")[2].trim() || '') : '',
      // productName: cells[6] ? ($(cells[6]).html().split("<br>")[3].trim() || '') : '',
      // productModel: cells[6] ? ($(cells[6]).html().split("<br>")[4].trim() || '') : '',
      // unitStatus: cells[7] ? ($(cells[7]).html().split("<br>")[0].replace(/<[^>]+>/g, '').trim() || '') : '',
      // unitStartDate: cells[7] ? ($(cells[7]).html().split("<br>")[1].trim() || '') : '',
      // unitEndDate: cells[7] ? ($(cells[7]).html().split("<br>")[2].replace(/<[^>]+>/g, '').trim() || '') : '',
      // customerName: cells[8] ? ($(cells[8]).html().split("<br>")[0].trim() || '') : '',
      // customerAddress: cells[8] ? ($(cells[8]).html().split("<br>")[1].trim() || '') : '',
      // customerPhone: cells[9] ? ($(cells[9]).html().split("<br>")[0].trim() || '') : '',
      // customerEmail: cells[9] ? ($(cells[9]).html().split("<br>")[1].trim() || '') : '',
      // contactPerson: cells[10] ? ($(cells[10]).html().split("<br>")[0].trim() || '') : '',
      // contactPersonPhone: cells[10] ? ($(cells[10]).html().split("<br>")[1].trim() || '') : '',
      // contactPersonDesignation: cells[10] ? ($(cells[10]).html().split("<br>")[2].trim() || '') : '',
      region: region,
      branch: branch,
      // city: cells[12] ? ($(cells[12]).html().split("<br>")[0].trim() || '') : '',
      // state: cells[12] ? ($(cells[12]).html().split("<br>")[1].trim() || '') : '',
      // servicePersonRemarks: cells[13] ? ($(cells[13]).text().trim() || '') : ''
      month: `${month}`,
      year: `${year}`,
    });
  });

  return data;
};

export async function POST(request) {
  try {
    const {
      start = 0,
      chunkSize = 500,
      htmlResponse,
      month,
      year,
      region,
      branch,
      type,
      callstatus,
    } = await request.json();

    if (!htmlResponse) {
      throw new Error("HTML response not found in context");
    }

    const transformedData = extractTableData(
      htmlResponse,
      start,
      chunkSize,
      month,
      year,
      region,
      branch,
      type,
      callstatus
    );

    // Store transformed data in context
    contextStore.transformedData = [...(contextStore.transformedData || []), ...transformedData];
    contextStore.nextStart = start + chunkSize;

    return new Response(
      JSON.stringify({
        message: "HTML data parsed and transformed",
        nextStart: contextStore.nextStart,
        transformedData,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error during POST request:", error.message);
    return NextResponse.json({ error: "Error parsing HTML data" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
}
