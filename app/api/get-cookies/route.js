import axios from "axios";
import { NextResponse } from "next/server";
import CookieModel from "../../models/CookieModel"; // Assume you have a model to store cookies
import connectToDatabase from "../../../lib/mongodb";

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
    await connectToDatabase();
   
    const cookies =  await fetchCookies();
    if (cookies) {
      await CookieModel.create({ cookies });
      console.log("New cookies stored in the database");
    }

    return new Response(
      JSON.stringify({ message: "Cookies fetched and stored in context", cookies }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error during POST request:", error.message);
    return NextResponse.json({ error: "Error fetching cookies" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
}
