"use client";
import React, { createContext, useContext, useState, useRef } from "react";
import axios from "axios";

const CPContext = createContext();

export const CPProviderComponent = ({ children }) => {
  const [apiTotal, setApiTotal] = useState(0);
  const [apiCompleted, setApiCompleted] = useState(0);
  const [start, setStart] = useState(1); // Default to 1 instead of 0
  const [end, setEnd] = useState(0);
  const [time, setTime] = useState(300); // Track time taken for fetching
  const timeRef = useRef(time);
  const [isCancelled, setIsCancelled] = useState(false);
  const [currentI, setCurrentI] = useState(null); // Track current i value
  const [isFetching, setIsFetching] = useState(false); // Add fetching state
  const cancelRef = useRef(false);

  // Keep timeRef in sync with time state
  React.useEffect(() => {
    timeRef.current = time;
  }, [time]);

  const fetchCPData = async () => {
    if (isFetching) return; // Prevent concurrent fetches
    // Ensure start and end are numbers
    const startNum = Number(start);
    const endNum = Number(end);
    if (isNaN(startNum) || isNaN(endNum) || startNum >= endNum) return; // Prevent invalid range

    setIsFetching(true);
    setIsCancelled(false);
    cancelRef.current = false; // Reset cancel flag at the start
    setCurrentI(null); // Reset currentI at the start
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    // Calculate total API requests (2 per i)
    const totalRequests = (endNum - startNum) * 2;
    setApiTotal(totalRequests);
    setApiCompleted(0);

    let allCPData = []; // <-- Move this here to collect during loop

    try {
      const cookiesResponse = await axios.post("/api/get-cookies");
      const promises = [];

      for (let i = startNum; i < endNum; i++) {
        if (cancelRef.current) {
          break;
        }
        setCurrentI(i); // Update current i value
        const payload = { id: i };

        // Collect both API responses for this i
        const promise = axios
          .post("/api/cpData", {
            payload,
            cookies: cookiesResponse.data.cookies,
          })
          .then((cpDataResponse) => {
            setApiCompleted((prev) => prev + 1);
            return cpDataResponse;
          })
          .catch((error) => {
            console.error(`Error fetching cpData for id ${i}:`, error);
            setApiCompleted((prev) => prev + 1);
            return null;
          });

        const promise2 = axios
          .post("/api/cpDataCall", {
            payload,
            cookies: cookiesResponse.data.cookies,
          })
          .then((cpDataCallResponse) => {
            setApiCompleted((prev) => prev + 1);
            return cpDataCallResponse;
          })
          .catch((error) => {
            console.error(`Error fetching cpDataCall for id ${i}:`, error);
            setApiCompleted((prev) => prev + 1);
            return null;
          });

        // Wait for both to finish for this i
        const [cpDataResponse, cpDataCallResponse] = await Promise.all([promise, promise2]);
        if (cpDataResponse && cpDataCallResponse) {
          const callIds = cpDataCallResponse?.data?.transformedData || [];
          const ArrCPData = { ...cpDataResponse?.data?.CPData, callIds };
          if (ArrCPData.id !== undefined) {
            allCPData.push(ArrCPData);
          }
        }

        await delay(timeRef.current ?? 300);
      }

      // Store all collected data after the loop
      const storeDataInChunks = async (data) => {
        const chunkSize = 500;
        for (let i = 0; i < data.length; i += chunkSize) {
          const chunk = data.slice(i, i + chunkSize);
          const storePayload = { allCPData: chunk };
          try {
            const resp =  await axios.post("/api/store-CP", storePayload);
            if (resp?.data?.currentSaved !== undefined) {
              setCurrentI(resp.data.currentSaved);
            } else {
              setCurrentI(null);
            }
          } catch {
            setCurrentI(null);
          }
        }
      };

      if (allCPData.length > 0) {
        await storeDataInChunks(allCPData);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setCurrentI(null);
    } finally {
      setIsFetching(false); // Reset fetching state
    }
  };

  const cancelFetch = () => {
    setIsCancelled(true);
    cancelRef.current = true;
    // setIsFetching(false); // Reset fetching state
  };

  const resetCancel = () => {
    setIsCancelled(false);
    cancelRef.current = false;
    setCurrentI(null); 
  };

  return (
    <CPContext.Provider
      value={{
        fetchCPData,
        start,
        end,
        setStart,
        setTime,
        time,
        setEnd,
        cancelFetch,
        resetCancel,
        isCancelled,
        currentI, // Expose currentI
        isFetching, // Expose isFetching
        timeRef, // Expose timeRef if needed elsewhere
        apiTotal,
        apiCompleted,
      }}
    >
      {children}
    </CPContext.Provider>
  );
};

export const useCPContext = () => useContext(CPContext);
