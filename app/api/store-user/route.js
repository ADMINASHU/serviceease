import connectToDatabase from "../../../lib/mongodb";
import UserData from "@/app/models/UserData";

import { NextResponse } from "next/server";


export async function POST(request) {
  try {
    await connectToDatabase();

    const { usersData } = await request.json();

    if (!usersData) {
      throw new Error("all user data not found in context");
    }

    // Function to store data in chunks
    const storeUserDataInChunks = async (data, chunkSize = 50) => {
      for (let i = 0; i < data.length; i += chunkSize) {
        const chunk = data.slice(i, i + chunkSize);
        const bulkOps = chunk.map(item => ({
          updateOne: {
            filter: { UMID: item.UMID },
            update: { $set: item },
            upsert: true
          }
        }));
        await UserData.bulkWrite(bulkOps);
      }
    };

    // Store transformed data in chunks
    await storeUserDataInChunks(usersData);

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
