import axios from "axios";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { htmlPayload, cookies } = await request.json();
    console.log(cookies);

    if (!cookies) {
      throw new Error("Cookies not found in context");
    }

    const response = await axios.post(
      "http://serviceease.techser.com/live/index.php/calls/callsOnFilter",
      htmlPayload,
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

    return new Response(
      JSON.stringify({
        message: "HTML data fetched and stored in context",
        htmlResponse: response.data,
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
    return NextResponse.json({ error: "Error fetching HTML data" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
}