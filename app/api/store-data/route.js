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

    // Function to store data in chunks
    const storeDataInChunks = async (data, chunkSize = 50) => {
      let newCount = 0;
      let updateCount = 0;
      for (let i = 0; i < data.length; i += chunkSize) {
        const chunk = data.slice(i, i + chunkSize);
        for (const item of chunk) {
          const result = await Data.findOneAndUpdate({ callNo: item.callNo }, item, { upsert: true, new: true });
          if (result.upserted) {
            newCount += 1; // New document added
          } else {
            updateCount += 1; // Existing document updated
          }
        }
      }
      return { newCount, updateCount };
    };

    // Count documents before update
    const initialCount = await Data.countDocuments();
    console.log("Initial document count:", initialCount);

    // Store transformed data in chunks
    const { newCount, updateCount } = await storeDataInChunks(transformedData);

    // Count documents after update
    const finalCount = await Data.countDocuments();
    console.log("Final document count:", finalCount);

    const addedCount = finalCount - initialCount;

    console.log(`Initial document count: ${initialCount}`);
    console.log(`Final document count: ${finalCount}`);
    console.log(`New document count: ${newCount}`);
    console.log(`Updated document count: ${updateCount}`);

    return new Response(
      JSON.stringify({
        message: `Data synced successfully: ${newCount} new data entries added, ${updateCount} existing data entries updated`,
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
    return NextResponse.json({ error: "Error storing transformed data" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
}
