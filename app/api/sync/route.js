// app/api/sync/route.js
import connectToDatabase from '../../../lib/mongodb';
import Data from '../../../models/Data';

export async function POST(request) {
  await connectToDatabase();

  const response = await fetch('YOUR_EXTERNAL_API_ENDPOINT');
  const data = await response.json();

  // Process and store the data in MongoDB
  for (const item of data) {
    await Data.findOneAndUpdate({ key: item.key }, { value: item.value }, { upsert: true });
  }

  return new Response(JSON.stringify({ message: 'Data synced successfully' }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
