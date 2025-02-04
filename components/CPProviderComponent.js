"use client";
import React, { createContext, useContext } from "react";
import axios from "axios";

const CPContext = createContext();

export const CPProviderComponent = ({ children }) => {
  const fetchCPData = async () => {
    let allCPData = [];

    try {
      const cookiesResponse = await axios.post("/api/get-cookies");
      const promises = [];

      for (let i = 1; i < 2; i++) {
        const payload = { id: 49 };
        // const promise = axios.post("/api/cpData", {
        //   payload,
        //   cookies: cookiesResponse.data.cookies,
        // });
        const promise2 = axios.post("/api/cpDataCall", {
          payload,
          cookies: cookiesResponse.data.cookies,
        });
        if (promise2) {
          promises.push(promise2);
        }
      }

      const cpResponses = await Promise.all(promises);
      cpResponses.forEach((response) => {
        allCPData = [...allCPData, response.data.CPData];
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

     // await storeDataInChunks(allCPData.filter((item) => Object.keys(item).length !== 0));
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  return <CPContext.Provider value={{ fetchCPData }}>{children}</CPContext.Provider>;
};

export const useCPContext = () => useContext(CPContext);
