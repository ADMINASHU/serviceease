import { NextResponse } from "next/server";
const cheerio = require("cheerio");

const extractTableData = (htmlString) => {
  const $ = cheerio.load(htmlString);
  const rows = $("tbody tr");
  const data = [];

  rows.each((i, row) => {
    const cells = $(row).find("td");
    if (cells.length > 0) {
      const cellContent = $(cells[0]).html();
      const match = cellContent.match(/<br>(.*?)<br>/);
      const natureOfComplaint = match ? match[1].trim() : "";

      data.push({
        callNo: cells[0] ? $(cells[0]).text().trim().split('\n')[0].trim() : "",
        natureOfComplaint: natureOfComplaint
      });
    }
  });

  return data;
};




export async function POST(request) {
  try {
    const { payload, cookies } = await request.json();

    if (!cookies) {
        throw new Error("Cookies not found in context");
    }
    const response = await fetch(
      "http://serviceease.techser.com/live/index.php/calls/latestcomplaintsOnCustprodId",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          Accept: "*/*",
          Connection: "keep-alive",
          "X-Requested-With": "XMLHttpRequest",
          Referer: "http://serviceease.techser.com/live/",
          Cookie: cookies,
        },
        body: new URLSearchParams(payload).toString(),
      }
    );
    const htmlText = await response.text();
   
    const $ = cheerio.load(htmlText);
    const firstTable = $("table").first().html();

    if (firstTable) {
      const htmlResponse = `<table>${firstTable}</table>`;
      if (!htmlResponse) {
        throw new Error("HTML response not found in context");
      }
      const transformedData = extractTableData(htmlResponse);
      // console.log(transformedData);
      return NextResponse.json(
        {
            transformedData,
        },
        { status: 200 }
      );
    }
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Error fetching HTML and Parsing data" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
}
