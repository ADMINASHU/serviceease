import axios from 'axios';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const URL = process.env.APPSCRIPT_URL;
    console.log("Fetching cookies from URL:", URL); // Log the URL

    // Check if the URL is valid
    if (!URL) {
      throw new Error('APPSCRIPT_URL is not defined');
    }

    const response = await axios.get(URL);
    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json({ error: 'Error fetching data' }, { status: 500 });
  }
}
