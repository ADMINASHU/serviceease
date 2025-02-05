"use client";
import React, { useContext, useEffect } from "react";
import axios from "axios";
import DataContext from "../context/DataContext";

const DataProviderComponent = ({ children }) => {
  const {months, year} = useContext(DataContext);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const cookiesResponse = await axios.post("/api/get-cookies");
        const monthResponse = await axios.get("/api/month");
        const months = monthResponse.data.month.months || months;
        const year = monthResponse.data.month.year || year;
        const callStatuses = ["NEW", "IN PROCESS", "COMPLETED"];
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
        ];
        const types = ["breakdown", "installation", "pm"];
        let allTransformedData = [];
        let allBranchData = [];

        // Fetch all branches data
        for (const region of regions) {
          const regionPayload = { region };
          const branchResponse = await axios.post("/api/branch", {
            regionPayload,
            cookies: cookiesResponse.data.cookies,
          });
          allBranchData = [...allBranchData, ...branchResponse.data.branchResponse];
        }

        // Function to get branches by region
        const getBranchesByRegion = (region) => {
          return allBranchData
            .filter((branchData) => branchData.REGION === region)
            .map((branchData) => branchData.BRANCH);
        };

        for (const month of months) {
          for (const callstatus of callStatuses) {
            for (const region of regions) {
              for (const type of types) {
                const branches = getBranchesByRegion(region);

                for (const branch of branches) {
                  const htmlPayload = {
                    month,
                    year,
                    region,
                    branch,
                    type,
                    callstatus,
                  };

                  const htmlResponse = await axios.post("/api/get-html", {
                    htmlPayload,
                    cookies: cookiesResponse.data.cookies,
                  });

                  // if (!htmlResponse.data.htmlResponse.includes("<table>")) {
                  //   console.log(
                  //     `No table data found for month: ${month}, callstatus: ${callstatus}, region: ${region}, branch: ${branch}, type: ${type}`
                  //   );
                  //   continue;
                  // }

                  let start = 0;
                  const chunkSize = 500;
                  let moreData = true;

                  while (moreData) {
                    const parsePayload = {
                      month,
                      year,
                      region,
                      branch,
                      type,
                      callstatus,
                      start,
                      chunkSize,
                      htmlResponse: htmlResponse.data.htmlResponse,
                    };
                    const parseResponse = await axios.post("/api/parse-html", parsePayload);

                    if (
                      !parseResponse.data.transformedData ||
                      parseResponse.data.transformedData.length === 0
                    ) {
                      // console.log(
                      //   `No table data found for month: ${month}, callstatus: ${callstatus}, region: ${region}, branch: ${branch}, type: ${type}`
                      // );
                      break;
                    }

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
        }

        const storeDataInChunks = async (data) => {
          const chunkSize = 500;
          for (let i = 0; i < data.length; i += chunkSize) {
            const chunk = data.slice(i, i + chunkSize);
            const storePayload = { transformedData: chunk };
            await axios.post("/api/store-data", storePayload);
          }
        };

        await storeDataInChunks(allTransformedData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    // fetchData();
  }, [months, year]);

  return <>{children}</>;
};

export default DataProviderComponent;
