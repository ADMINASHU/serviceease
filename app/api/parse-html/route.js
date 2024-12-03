import { NextResponse } from "next/server";

// In-memory store for context
let contextStore = {};

const parseHTMLTable = (html, start = 0, chunkSize = 10) => {
  const data = [];
  const tableRegex = /<table[^>]*>(.*?)<\/table>/s;
  const rowRegex = /<tr[^>]*>(.*?)<\/tr>/gs;
  const cellRegex = /<t[dh][^>]*>(.*?)<\/t[dh]>/gs;
  const tableMatch = tableRegex.exec(html);
  if (tableMatch) {
    const rows = tableMatch[1].match(rowRegex).slice(start, start + chunkSize);
    rows.forEach((row) => {
      const cells = row.match(cellRegex);
      const rowData = cells.map((cell) => cell.replace(/<.*?>/g, "").trim());
      data.push(rowData);
    });
  }
  return data;
};

export async function POST(request) {
  try {
    const { start, chunkSize, htmlResponse } = await request.json();
 

    if (!htmlResponse) {
      throw new Error("HTML response not found in context");
    }

    const tableChunk = parseHTMLTable(htmlResponse, start, chunkSize);
    if (tableChunk.length === 0) {
      throw new Error("No table data found in HTML response");
    }

    const transformedData = tableChunk.map((item) => ({
      blank: item[0],
      callNo: item[1],
      faultReport: item[2],
      callDate: item[3],
      callStartEndDate: item[4],
      engineerName: item[5],
      serialNo: item[6],
      unitStatus: item[7],
      customerName: item[8],
      phoneEmail: item[9],
      contactPerson: item[10],
      regionBranch: item[11],
      cityState: item[12],
      servicePersonRemarks: item[13],
    }));

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
