import connectToDatabase from "../../../lib/mongodb";
import Data from "@/app/models/Data";
import { NextResponse } from "next/server";


export async function POST(request) {
  try {
    await connectToDatabase();

    const { transformedData } = await request.json();

    if (!transformedData) {
      throw new Error("Transformed data not found in context");
    }

    // Function to store data in chunks
    const storeDataInChunks = async (data, chunkSize = 50) => {
      for (let i = 0; i < data.length; i += chunkSize) {
        const chunk = data.slice(i, i + chunkSize);
        const bulkOps = chunk.map(item => ({
          updateOne: {
            filter: { callNo: item.callNo },
            update: { $set: item },
            upsert: true
          }
        }));
        await Data.bulkWrite(bulkOps);
      }
    };

    // Store transformed data in chunks
    await storeDataInChunks(transformedData);

    return NextResponse.json({
      message: "Data synced successfully"
    }, { status: 200 });
  } catch (error) {
    console.error("Error during POST request:", error.message);
    return NextResponse.json({ error: "Error storing transformed data" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
}
