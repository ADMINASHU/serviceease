// app/api/sync/route.js
import connectToDatabase from "../../../lib/mongodb";
import Data from "@/app/models/Data";
import axios from "axios";
import { NextResponse } from "next/server";

export async function POST() {
  async function getCookies() {
    try {
      const response = await axios.get(
        "https://script.google.com/macros/s/AKfycby8jP7TJO0iP-rxj4rTCfRwRq1nDoJzoqylmqKLOrv9MaEonusYnlh5q5DLjJtesV_Qbg/exec"
      );
      return NextResponse.json(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      return NextResponse.error();
    }
  }
  await connectToDatabase();
  //.....................................................................................................
  const parseHTMLTable = (html) => {
    var data = [];
    var tableRegex = /<table[^>]*>(.*?)<\/table>/s; // Changed to stop after the first table
    var rowRegex = /<tr[^>]*>(.*?)<\/tr>/gs;
    var cellRegex = /<t[dh][^>]*>(.*?)<\/t[dh]>/gs;
    var tableMatch = tableRegex.exec(html);
    if (tableMatch) {
      var rows = tableMatch[1].match(rowRegex);
      rows.forEach(function (row) {
        var cells = row.match(cellRegex);
        var rowData = cells.map(function (cell) {
          return cell.replace(/<.*?>/g, "").trim();
        });
        data.push(rowData);
      });
    }
    return data;
  };
  try {
    const cookies = await getCookies();
    const payload = {
      month: 11,
      year: 2024,
      region: "",
      branch: "",
      type: "All",
      callstatus: "",
    };
    const response = await axios.post(
      "http://serviceease.techser.com/live/index.php/calls/callsOnFilter",
      payload,
      {
        // method: "post",
        headers: {
          //   "Authorization": "Basic " + Utilities.base64Encode("admin:password"),
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          Accept: "*/*",
          Connection: "keep-alive",
          Referer: "http://serviceease.techser.com/live/index.php/calls/index/All",
          "X-Requested-With": "XMLHttpRequest",
          Cookie: cookies,
        },
      }
    );
    const table = parseHTMLTable(response.data);
    const data = NextResponse.json(table);
    // return NextResponse.json(JSON.stringify(table, null, 2));
    console.log(data);

    // Process and store the data in MongoDB
    const transformedData = data.map((item) => ({
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

    for (const item of transformedData) {
      await Data.findOneAndUpdate({ callNo: item.callNo }, item, { upsert: true });
    }

    return new Response(JSON.stringify({ message: "Data synced successfully" }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Error fetching data from the server" }, { status: 500 });
  }
  //.....................................................................................................
}
