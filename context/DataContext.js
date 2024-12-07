"use client";
import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const [months, setMonths] = useState([]);
  const [year, setYear] = useState(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const response = await axios.get("/api/month");
        setMonths(response.data.months || []);
        setYear(response.data.year || "");
        console.log(response.data);
      } catch (error) {
        console.error("Error fetching initial data:", error);
      }
    };

    fetchInitialData();
  }, []);

  return (
    <DataContext.Provider
      value={{
        months,
        setMonths,
        year,
        setYear,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export default DataContext;
