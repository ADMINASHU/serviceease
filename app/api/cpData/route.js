import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(request) {
  try {
    const { payload, cookies } = await request.json();
    if (!cookies) {
      throw new Error("Cookies not found in context");
    }

    const response = await axios.post(
      "http://serviceease.techser.com/live/index.php/calls/custproddetailsOnId",
      payload,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          Accept: "*/*",
          Connection: "keep-alive",
          "X-Requested-With": "XMLHttpRequest",
          Referer: "http://serviceease.techser.com/live/",
          Cookie: cookies,
          "Accept-Encoding": "gzip, deflate, br",
        },
      }
    );
    const CP = response.data[0];
    const CPData = {
      id: CP.ID,
      custId: CP.CUSTID,
      prodId: CP.PRODID,
      serialNo: CP.SERIALNO,
      pincode: CP.PINCODE,
      customerName: CP.CUSTOMERNAME,
      customerAddress: CP.CUSTTOMERADDRESS,
      state: CP.STATE,
      city: CP.CITY,
      region: CP.REGION,
      branch: CP.BRANCH,
      prodDescription: CP.PRODDESCRIPTION,
      batMake: CP.BATMAKE,
      batType: CP.BATTYPE,
      batteryCode: CP.BATTERYCODE,
      batteryCapacity: CP.BATTERYCAPACITY,
      batteryQty: CP.BATTERYQTY,
      category: CP.CATEGORY,
      name: CP.NAME,
      series: CP.SERIES,
      model: CP.MODEL,
      modelCode: CP.MODELCODE,
      capacity: CP.CAPACITY,
      capacityUnit: CP.CAPACITYUNIT,
    };

    return NextResponse.json(
      {
        CPData,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ error: "Error fetching in CP data" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
}
