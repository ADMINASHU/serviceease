"use client";
import React, { createContext, useContext, useState, useRef } from "react";
import axios from "axios";

const CPContext = createContext();

export const CPProviderComponent = ({ children }) => {
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(0);
  const [isCancelled, setIsCancelled] = useState(false);
  const cancelRef = useRef(false);

  const fetchCPData = async () => {
    setIsCancelled(false);
    cancelRef.current = false; // Reset cancel flag at the start
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    try {
      const cookiesResponse = await axios.post("/api/get-cookies");
      const promises = [];

      for (let i = start; i < end; i++) {
        if (cancelRef.current) {
          break;
        }
        const payload = { id: i };

        const promise = axios
          .post("/api/cpData", {
            payload,
            cookies: cookiesResponse.data.cookies,
          })
          .catch((error) => {
            console.error(`Error fetching cpData for id ${i}:`, error);
          });

        const promise2 = axios
          .post("/api/cpDataCall", {
            payload,
            cookies: cookiesResponse.data.cookies,
          })
          .catch((error) => {
            console.error(`Error fetching cpDataCall for id ${i}:`, error);
          });

        promises.push(Promise.all([promise, promise2]));
        await delay(280);
      }

      const cpResponses = await Promise.all(promises);
      let allCPData = [];
      let ArrCPData = {};
      cpResponses.forEach((responseArray) => {
        const [cpDataResponse, cpDataCallResponse] = responseArray;
        const callIds = cpDataCallResponse?.data?.transformedData || [];
        ArrCPData = { ...cpDataResponse?.data?.CPData, callIds };
        allCPData = [...allCPData, ArrCPData].filter((item) => item.id !== undefined);
      });
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

  const cancelFetch = () => {
    setIsCancelled(true);
    cancelRef.current = true;
  };

  const resetCancel = () => {
    setIsCancelled(false);
    cancelRef.current = false;
  };

  return (
    <CPContext.Provider
      value={{ fetchCPData, start, end, setStart, setEnd, cancelFetch, resetCancel, isCancelled }}
    >
      {children}
    </CPContext.Provider>
  );
};

export const useCPContext = () => useContext(CPContext);
