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
        const months = [ 11, 12]; // Specify the months you want to fetch data for
        // let allTransformedData = [];

        for (const month of months) {
          // Step 2: Fetch HTML data using cookies from context
          const htmlPayload = {
            month,
            year: 2024,
            region: "",
            branch: "",
            type: "All",
            callstatus: "",
          };
          const htmlResponse = await axios.post("/api/get-html", {
            htmlPayload,
            cookies: cookiesResponse.data.cookies,
          });

          // Step 3: Parse HTML to transform data in chunks
          let start = 0;
          const chunkSize = 100;
          let moreData = true;

          while (moreData) {
            const parsePayload = { start, chunkSize, htmlResponse: htmlResponse.data.htmlResponse };
            const parseResponse = await axios.post("/api/parse-html", parsePayload);

            setParseResponseData((prevData) => [
              ...(prevData || []),
              ...parseResponse.data.transformedData,
            ]);

            // allTransformedData = [
            //   ...allTransformedData,
            //   ...parseResponse.data.transformedData,
            // ];

            start = parseResponse.data.nextStart;
            moreData = parseResponse.data.transformedData.length === chunkSize;
          }
        }

        // setTransformedData(allTransformedData);

        // Step 4: Store transformed data in DB
        const storePayload = {
          transformedData: parseResponseData,
        };
        await axios.post("/api/store-data", storePayload);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [setCookies, setHtmlResponse, setTransformedData]);

  return <>{children}</>;
};

export default DataProviderComponent;
