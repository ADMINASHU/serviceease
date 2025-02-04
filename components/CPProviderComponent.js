"use client";
import React, { createContext, useContext } from "react";
import axios from "axios";

const CPContext = createContext();

export const CPProviderComponent = ({ children }) => {
  const fetchCPData = async () => {
    try {
      const cookiesResponse = await axios.post("/api/get-cookies");
      const promises = [];

      for (let i = 0; i < 10; i++) {
        const payload = { id: i };
        const promise = axios.post("/api/cpData", {
          payload,
          cookies: cookiesResponse.data.cookies,
        });
        const promise2 = axios.post("/api/cpDataCall", {
          payload,
          cookies: cookiesResponse.data.cookies,
        });
        if (promise && promise2) {
          promises.push(Promise.all([promise, promise2]));
        }
      }

      const cpResponses = await Promise.all(promises);
      let allCPData = [];
      cpResponses.forEach((responseArray) => {
        const [cpDataResponse, cpDataCallResponse] = responseArray;

        // // Adding logging to inspect the responses
        // console.log('cpDataResponse:', cpDataResponse.data);
        // console.log('cpDataCallResponse:', cpDataCallResponse.data);

        const callIds = cpDataCallResponse.data.transformedData; // This is an array of callIds

        // If cpDataResponse.data is not an array, wrap it in an array
        const cpDataArray = Array.isArray(cpDataResponse.data.CPData)
          ? cpDataResponse.data.CPData
          : [cpDataResponse.data.CPData];

        if (callIds.length > 0) {
          callIds.forEach((callId) => {
            cpDataArray.forEach((data) => {
              allCPData.push({ ...data, callIds });
            });
          });
        }
      });

      const storeDataInChunks = async (data) => {
        const chunkSize = 500;
        for (let i = 0; i < data.length; i += chunkSize) {
          const chunk = data.slice(i, i + chunkSize);
          const storePayload = { allCPData: chunk };
          await axios.post("/api/store-data", storePayload);
        }
      };

      await storeDataInChunks(allCPData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  return <CPContext.Provider value={{ fetchCPData }}>{children}</CPContext.Provider>;
};

export const useCPContext = () => useContext(CPContext);
