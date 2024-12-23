import axios from "axios";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { payload, cookies } = await request.json();

    if (!cookies) {
      throw new Error("Cookies not found in context");
    }

    const response = await axios.post(
      "http://serviceease.techser.com/live/index.php/masters/usersOnBranch",
      payload,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          Accept: "*/*",
          Connection: "keep-alive",
          Referer: "http://serviceease.techser.com/live/index.php/reports/engproductivity",
          "X-Requested-With": "XMLHttpRequest",
          Cookie: cookies,
        },
      }
    );

    return new Response(
      JSON.stringify({
        message: "Users data fetched and stored in context",
        userResponse: response.data,
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
    return NextResponse.json({ error: "Error fetching Users data" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
}