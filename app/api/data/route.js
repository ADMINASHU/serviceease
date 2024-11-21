import connectToDatabase from '../../../lib/mongodb';
import Data from '../../models/Data';
import axios from 'axios';
import { NextResponse } from 'next/server';
import CookieModel from '../../models/CookieModel'; // Assume you have a model to store cookies
// import {fetchCookies} from '../../../lib/fetchCookies'; // Assume you have a function to fetch cookies
import fetchCookies from '../../../lib/fetchCookies';


export async function POST(request) {
  await connectToDatabase();

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
          return cell.replace(/<.*?>/g, '').trim();
        });
        data.push(rowData);
      });
    }
    return data;
  };

  try {
    const { payload } = await request.json();
    const existingCookie = await CookieModel.findOne(); // Fetch the stored cookie

    let cookies = existingCookie ? existingCookie.cookies : await fetchCookies(); // Fetch new cookies if not stored

    const makeRequest = async (cookies) => {
      return await axios.post(
        'http://serviceease.techser.com/live/index.php/calls/callsOnFilter',
        payload,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            Accept: '*/*',
            Connection: 'keep-alive',
            Referer: 'http://serviceease.techser.com/live/index.php/calls/index/All',
            'X-Requested-With': 'XMLHttpRequest',
            Cookie: cookies,
          },
        }
      );
    };

    let response;

    try {
      response = await makeRequest(cookies);
    } catch (error) {
      if (error.response && error.response.status === 401) { // If unauthorized, fetch new cookies
        cookies = await fetchCookies();
        await CookieModel.updateOne({}, { cookies }, { upsert: true }); // Update the stored cookie
        response = await makeRequest(cookies); // Retry the request with new cookies
      } else {
        throw error;
      }
    }

    const table = parseHTMLTable(response.data);

    // Process and store the data in MongoDB
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

    for (const item of transformedData) {
      await Data.findOneAndUpdate({ callNo: item.callNo }, item, { upsert: true });
    }

    return new Response(JSON.stringify({ message: 'Data synced successfully' }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error fetching data from the server:', error.message);
    return NextResponse.json({ error: 'Error fetching data from the server' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 });
}
