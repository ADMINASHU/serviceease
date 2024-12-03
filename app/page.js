"use client";

import { useEffect, useState } from "react";
import axios from "axios";

export default function ServiceEasePage() {
  const [result, setResult] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const apiURL2 = "/api/data";
      const promises = [];

      for (let month = 12; month < 13; month++) {
        const payload = {
          month: month,
          year: 2024,
          region: "",
          branch: "",
          type: "All",
          callstatus: "",
        };
        promises.push(axios.post(apiURL2, payload));
      }
      const responses = await Promise.all(promises);

      const data = responses.flatMap(response => response.data);
      setResult(data);
      setTotalCount(data.length);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Data from API</h1>
      {loading && <p>Loading data...</p>}
      {error && <p>{error}</p>}
      <p>Total rows: {totalCount}</p>
      {result.length > 0 && (
        <ul>
          {result.map((item, index) => (
            <li key={index}>{JSON.stringify(item)}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
