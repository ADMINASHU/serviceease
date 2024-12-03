import connectToDatabase from "../../../lib/mongodb";
import Data from "@/app/models/Data";
import { NextResponse } from "next/server";

// In-memory store for context
let contextStore = {};

export async function POST(request) {
  try {
    await connectToDatabase();
    console.log("Database connected successfully in POST request");
    const { transformedData } = await request.json();

    if (!transformedData) {
      throw new Error("Transformed data not found in context");
    }

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
    return NextResponse.json({ error: "Error storing transformed data" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
}
