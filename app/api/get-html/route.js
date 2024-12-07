import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { htmlPayload, cookies } = await request.json();

    const response = await fetch(
      "http://serviceease.techser.com/live/index.php/calls/callsOnFilter",
      {
        method: 'POST',
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          Accept: "*/*",
          Connection: "keep-alive",
          Referer: "http://serviceease.techser.com/live/index.php/calls/index/All",
          "X-Requested-With": "XMLHttpRequest",
          Cookie: cookies,
        },
        body: new URLSearchParams(htmlPayload).toString(),
      }
    );

    const data = await response.text();

    return NextResponse.json({
      htmlResponse: data,
    }, { status: 200 });
  } catch (error) {
    console.error("Error during POST request:", error.message);
    return NextResponse.json({ error: "Error fetching HTML data" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
}
