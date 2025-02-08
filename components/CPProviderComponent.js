"use client";
import React, { createContext, useContext } from "react";
import axios from "axios";

const CPContext = createContext();

export const CPProviderComponent = ({ children }) => {
  const fetchCPData = async () => {
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    try {
      const cookiesResponse = await axios.post("/api/get-cookies");
      const promises = [];

      for (let i = 4000; i < 6000; i++) {
        const payload = { id: i };
        const promise = axios.post("/api/cpData", {
          payload,
          cookies: cookiesResponse.data.cookies,
        });
        const promise2 = axios.post("/api/cpDataCall", {
          payload,
          cookies: cookiesResponse.data.cookies,
        });

        promises.push(Promise.all([promise, promise2]));
        await delay(300); // Add a delay of 1 second between each iteration
      }

      const cpResponses = await Promise.all(promises);
      let allCPData = [];
      let ArrCPData = {};
      cpResponses.forEach((responseArray) => {
        const [cpDataResponse, cpDataCallResponse] = responseArray;
        const callIds = cpDataCallResponse.data.transformedData; // Extract callNo as an array of strings
        ArrCPData = { ...cpDataResponse.data.CPData, callIds };
        allCPData = [...allCPData, ArrCPData].filter((item) => item.id !== undefined);
      });
      console.log(allCPData);
      const storeDataInChunks = async (data) => {
        const chunkSize = 500;
        for (let i = 0; i < data.length; i += chunkSize) {
          const chunk = data.slice(i, i + chunkSize);
          const storePayload = { allCPData: chunk };
          await axios.post("/api/store-CP", storePayload);
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
