import axios from "axios";
import { NextResponse } from "next/server";


export async function GET() {
  try {
    const URL = process.env.APPSCRIPT_URL;
    const response = await axios.get(URL);
    return NextResponse.json(response.data);
  } catch (error) {
    console.error("Error fetching data:", error);
    throw new Error("Error fetching data");
  }
}
