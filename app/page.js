import Image from "next/image";
import styles from "./page.module.css";

export default function Home() {
  return (
    <p>HOME</p>
  );
}
//.......................

// app/api/sync/route.js
import connectToDatabase from '../../../lib/mongodb';
import Data from '../../../models/Data';

export async function POST(request) {
  await connectToDatabase();

  const response = await fetch('YOUR_EXTERNAL_API_ENDPOINT');
  const apiData = await response.json();

  // Process and store the data in MongoDB
  const transformedData = apiData.map(item => ({
    callNo: item[0],
    natureOfComplaint: item[1],
    callDate: item[3],
    callStartDate: item[4],
    callEndDate: item[5],
    engineerName: item[5],
    engineerContact: item[6],
    serialNo: item[7],
    productCategory: item[7],
    productSeries: item[7],
    productName: item[7],
    productModel: item[7],
    unitStatus: item[8],
    startDate: item[8],
    endDate: item[8],
    customerName: item[9],
    customerAddress: item[9],
    phone: item[10],
    email: item[10],
    contactPerson: item[11],
    contactPersonPhone: item[11],
    contactPersonDesignation: item[11],
    region: item[12],
    branch: item[12],
    city: item[13],
    state: item[13],
    servicePersonRemarks: item[14],
    closedDate: item[15],
    duration: item[16],
    complaintId: item[17],
    originalComplaintId: item[18],
    status: item[19],
    assignedTo: item[20],
    month: item[21],
    year: item[22],
    count: item[23],
    realStatus: item[24],
    isPending: item[25]
  }));

  for (const item of transformedData) {
    await Data.findOneAndUpdate({ callNo: item.callNo }, item, { upsert: true });
  }

  return new Response(JSON.stringify({ message: 'Data synced successfully' }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
