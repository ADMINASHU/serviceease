import connectToDatabase from "../../../lib/mongodb";
import Data from "@/app/models/Data";
import axios from "axios";
import { NextResponse } from "next/server";
import CookieModel from "../../models/CookieModel"; // Assume you have a model to store cookies

const fetchCookies = async () => {
  try {
    const response = await axios.get(`${process.env.BASE_URL}/api/cookies`);
    console.log("Fetched cookies:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching cookies:", error);
    throw new Error("Error fetching cookies");
  }
};

export async function POST(request) {
  try {
    const payload = await request.json();
    await connectToDatabase();
    console.log("Database connected successfully in POST request");

    const parseHTMLTable = (html) => {
      var data = [];
      var tableRegex = /<table[^>]*>(.*?)<\/table>/s;
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

    const existingCookie = await CookieModel.findOne();
    console.log("Existing cookie:", existingCookie);

    let cookies = existingCookie ? existingCookie.cookies : await fetchCookies();
    if (!existingCookie) {
      await CookieModel.create({ cookies });
      console.log("New cookies stored in the database");
    }

    const makeRequest = async () => {
      return await axios.post(
        "http://serviceease.techser.com/live/index.php/calls/callsOnFilter",
        payload,
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            Accept: "*/*",
            Connection: "keep-alive",
            Referer: "http://serviceease.techser.com/live/index.php/calls/index/All",
            "X-Requested-With": "XMLHttpRequest",
            Cookie: cookies,
          },
        }
      );
    };

    let response;
    try {
      response = await makeRequest();
      // console.log("response from server: " + response);
      const getCookies = response.headers["set-cookie"];
      console.log("Cookies from response:", getCookies);

      const hasDeleted = getCookies && getCookies.some((cookie) => cookie.includes("deleted"));
      if (hasDeleted) {
        console.log("Deleted cookie found, fetching new cookies");
        cookies = await fetchCookies();
        const updateResult = await CookieModel.updateOne({}, { cookies }, { upsert: true });
        console.log("Cookies updated:", updateResult);

        response = await makeRequest(cookies);
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log("Unauthorized, fetching new cookies");
        cookies = await fetchCookies();
        const updateResult = await CookieModel.updateOne({}, { cookies }, { upsert: true });
        console.log("Cookies updated:", updateResult);

        response = await makeRequest(cookies);
      } else {
        console.error("Error making request:", error);
        throw error;
      }
    }

    // console.log('HTML response from server:', response.data);
    const table = parseHTMLTable(response.data);
    // console.log('Parsed table data:', table);
    if (table.length === 0) {
      throw new Error("No table data found in response");
    }
    const transformedData = table.map((item) => ({
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
    // console.log("Transformed data:", transformedData);

    // Count documents before update
    const initialCount = await Data.countDocuments();
    console.log("Initial document count:", initialCount);
    let newCount = 0;

    for (const item of transformedData) {
      const result = await Data.findOneAndUpdate({ callNo: item.callNo }, item, { upsert: true });
      if (!result) {
        newCount += 1; // New document added
      }
    }

    // Count documents after update
    const finalCount = await Data.countDocuments();
    console.log("Final document count:", finalCount);
    const addedCount = finalCount - initialCount;

    console.log(`Initial document count: ${initialCount}`);
    console.log(`Final document count: ${finalCount}`);
    console.log(`Added document count: ${addedCount}`);

    if (addedCount > 0) {
      return new Response(
        JSON.stringify({
          message: `Data synced successfully: ${addedCount} new data entries added`,
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    } else {
      return new Response(JSON.stringify({ message: "Only existing data has been updated" }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }
  } catch (error) {
    console.error("Error during POST request:", error.message);
    return NextResponse.json({ error: "Error fetching data from the server" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
}
