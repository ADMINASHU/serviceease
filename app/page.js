"use client";
import React, { useContext, useState, useEffect } from "react";
import axios from "axios";
import styles from "./page.module.css";
import DataContext from "../context/DataContext";
import { useUserContext } from "../components/UserProviderComponent";
import { useCPContext } from "@/components/CPProviderComponent";
import { useNewDataContext } from "@/components/DataProviderComponent";

const Home = () => {
  const { months, setMonths, year, setYear } = useContext(DataContext);
  const { fetchUserData } = useUserContext();
  const { fetchCPData } = useCPContext();
  const { fetchData } = useNewDataContext();

  const [localMonths, setLocalMonths] = useState([]);
  const [localYear, setLocalYear] = useState("");

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const response = await axios.get("/api/month");
        setLocalMonths(response.data.month?.months || []);
        setLocalYear(response.data.month?.year || 2024);
      } catch (error) {
        console.error("Error fetching initial data:", error);
      }
    };

    fetchInitialData();
  }, []);

  const handleMonthClick = (month) => {
    const newMonths = localMonths.includes(month)
      ? localMonths.filter((m) => m !== month)
      : [...localMonths, month];
    setLocalMonths(newMonths);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post("/api/month", {
        months: localMonths,
        year: localYear,
      });
      setMonths(localMonths);
      setYear(localYear);
      console.log("Data saved:", response.data);
    } catch (error) {
      console.error("Error saving data:", error);
    }
  };

  return (
    <div className={styles["form-container"]}>
      <h1>Set Months and Year</h1>
      <form onSubmit={handleSubmit}>
        <label>Months:</label>
        <div className={styles["month-buttons"]}>
          {[...Array(12).keys()].map((month) => (
            <button
              key={month + 1}
              type="button"
              className={localMonths.includes(month + 1) ? styles["selected"] : ""}
              onClick={() => handleMonthClick(month + 1)}
            >
              {month + 1}
            </button>
          ))}
        </div>
        <br />
        <label>
          Year:
          <input
            type="number"
            value={localYear}
            onChange={(e) => setLocalYear(e.target.value)}
            required
          />
        </label>
        <br />
        <button type="submit">Save</button>
      </form>
      <button onClick={fetchData}>Fetch Data</button>
      <button onClick={fetchUserData}>Fetch Users Data</button>
      <button onClick={fetchCPData}>Fetch CP Data</button>
    </div>
  );
};

export default Home;
