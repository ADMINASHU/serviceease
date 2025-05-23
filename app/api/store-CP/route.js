import connectToDatabase from "../../../lib/mongodb";
import { NextResponse } from "next/server";
import CPData from "@/app/models/CPData";

export async function POST(request) {
  try {
    await connectToDatabase();

    const { allCPData } = await request.json();

    if (!allCPData) {
      throw new Error("Transformed data not found in context");
    }

    // Function to store data in chunks
    const storeDataInChunks = async (data, chunkSize = 500) => {
      for (let i = 0; i < data.length; i += chunkSize) {
        const chunk = data.slice(i, i + chunkSize);
        const bulkOps = chunk.map((item) => ({
          updateOne: {
            filter: { id: item.id },
            update: { $set: item },
            upsert: true,
          },
        }));
        await CPData.bulkWrite(bulkOps);
      }
    };
    // console.log(allCPData.filter((item) => item.custId !== ""));
    // Store transformed data in chunks
    const finalData = allCPData.filter((item) => item.custId !== null && item.custId !== undefined && item.custId !== "");
    await storeDataInChunks(finalData);

    // Return only the count of currently saved data
    const currentSaved = finalData.length;

    return NextResponse.json(
      {
        message: "Data synced successfully",
        currentSaved,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error during POST request:", error.message);
    return NextResponse.json({ error: "Error storing transformed data" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
}
