"use client";
import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import DataContext from "../context/DataContext";

const DataProviderComponent = ({ children }) => {
  const [parseResponseData, setParseResponseData] = useState([]);
  const { setCookies, setHtmlResponse, setTransformedData } = useContext(DataContext);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Step 1: Get cookies and store in context and DB
        const cookiesResponse = await axios.post("/api/get-cookies");

        // Initialize variables for loop
        const months = [8, 9, 10, 11, 12]; // Specify the months you want to fetch data for
        const callStatuses = ["NEW", "IN PROCESS", "COMPLETED"]; // Specify the call statuses
        const regions = [
          "AP & TELANGANA",
          "CHATTISGARH",
          "GOA",
          "KALKA",
          "KARNATAKA",
          "KERALA",
          "MADHYA PRADESH",
          "MUMBAI",
          "RAJASTHAN",
          "TAMIL NADU",
          "West Bengal",
        ]; // Replace with your actual regions
        const types = ["breakdown", "installation", "pm"]; // Specify the types
        let allTransformedData = [];

        for (const month of months) {
          for (const callstatus of callStatuses) {
            for (const region of regions) {
              for (const type of types) {
                // Step 2: Fetch HTML data using cookies from context
                const htmlPayload = {
                  month,
                  year: 2024,
                  region,
                  branch: "",
                  type, // Updated to include the new type variable
                  callstatus,
                };

                const htmlResponse = await axios.post("/api/get-html", {
                  htmlPayload,
                  cookies: cookiesResponse.data.cookies,
                });

                console.log("HTML Response:", htmlResponse.data.htmlResponse);

                // Check if HTML contains table data before parsing
                if (!htmlResponse.data.htmlResponse.includes("<table")) {
                  console.log(
                    `No table data found for month: ${month}, callstatus: ${callstatus}, region: ${region}, type: ${type}`
                  );
                  continue;
                }

                // Step 3: Parse HTML to transform data in chunks
                let start = 0;
                const chunkSize = 100;
                let moreData = true;

                while (moreData) {
                  const parsePayload = {
                    start,
                    chunkSize,
                    htmlResponse: htmlResponse.data.htmlResponse,
                  };
                  const parseResponse = await axios.post("/api/parse-html", parsePayload);

                  if (
                    !parseResponse.data.transformedData ||
                    parseResponse.data.transformedData.length === 0
                  ) {
                    console.log(
                      `No table data found for month: ${month}, callstatus: ${callstatus}, region: ${region}, type: ${type}`
                    );
                    break;
                  }

                  setParseResponseData((prevData) => [
                    ...(prevData || []),
                    ...parseResponse.data.transformedData,
                  ]);

                  allTransformedData = [
                    ...allTransformedData,
                    ...parseResponse.data.transformedData,
                  ];

                  start = parseResponse.data.nextStart;
                  moreData = parseResponse.data.transformedData.length === chunkSize;
                }
              }
            }
          }
        }

        // setTransformedData(allTransformedData);

        // Step 4: Store transformed data in DB in chunks
        const storeDataInChunks = async (data) => {
          const chunkSize = 50; // Adjust chunk size based on your requirements
          for (let i = 0; i < data.length; i += chunkSize) {
            const chunk = data.slice(i, i + chunkSize);
            const storePayload = {
              transformedData: chunk,
            };
            await axios.post("/api/store-data", storePayload);
          }
        };

        await storeDataInChunks(allTransformedData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [setCookies, setHtmlResponse, setTransformedData]);

  return <>{children}</>;
};

export default DataProviderComponent;
