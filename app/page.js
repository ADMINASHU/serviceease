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
  const { fetchCPData, setStart, setEnd, start, end, cancelFetch, resetCancel, isCancelled, currentI, isFetching } = useCPContext();
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
        <div className={styles["year-row"]}>
          <label>
            Year:
            <input
              type="number"
              value={localYear}
              onChange={(e) => setLocalYear(e.target.value)}
              required
            />
          </label>
          <button type="submit">Save</button>
        </div>
      </form>
      <hr className={styles["section-divider"]} />
      <div className={styles["fetch-row"]}>
        <button onClick={fetchData} className={styles["fetch-btn"]}>Fetch Data</button>
        <button onClick={fetchUserData} className={styles["user-btn"]}>Fetch Users Data</button>
      </div>
      <hr className={styles["section-divider"]} />
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <h1>Fetch CP Data</h1>
        <span className={styles["status-label"]}>
          Status: {isCancelled ? "Cancelled" : isFetching ? "Running" : "Normal"}
        </span>
        {currentI !== null && (
          <span style={{ color: "#8e24aa", fontWeight: 600 }}>
            Processing ID: {currentI}
          </span>
        )}
      </div>
      <div className={styles["range-row"]}>
        <label>Start:</label>
        <input
          type="number"
          value={start}
          onChange={(e) => setStart(e.target.value)}
          placeholder="Start"
        />
        <label>End:</label>
        <input
          type="number"
          value={end}
          onChange={(e) => setEnd(e.target.value)}
          placeholder="End"
        />
      </div>
      <div className={styles["button-row"]}>
        <button
          onClick={fetchCPData}
          className={styles["cp-btn"]}
          disabled={isFetching}
        >
          {isFetching ? "Fetching..." : "Fetch CP Data"}
        </button>
        <button
          onClick={isCancelled ? resetCancel : cancelFetch}
          className={isCancelled ? styles["reset-btn"] : styles["cancel-btn"]}
        >
          {isCancelled ? "Reset" : "Cancel"}
        </button>
      </div>
    </div>
  );
};

export default Home;
