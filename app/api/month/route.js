import { NextResponse } from "next/server";
import Month from "../../models/MonthModel";
import connectToDatabase from "../../../lib/mongodb";

export async function POST(request) {
  try {
    const { months, year } = await request.json();
    await connectToDatabase();

    // Use upsert to update or insert the single document
    const month = await Month.findOneAndUpdate(
      {},
      {
        $set: {
          months,
          year,
        },
      },
      { new: true, upsert: true }  // Create a new document if one doesn't exist
    );

    return new Response(JSON.stringify({ message: "Month updated successfully", month }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error during POST request:", error.message);
    return NextResponse.json({ error: "Error updating data" }, { status: 500 });
  }
}

export async function GET() {
  try {
    await connectToDatabase();
    const month = await Month.findOne().lean();

    return new Response(JSON.stringify({ message: "Month fetched", month }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error during GET request:", error.message);
    return NextResponse.json({ error: "Error fetching data" }, { status: 500 });
  }
}
