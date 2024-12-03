"use client"

import { useEffect, useState } from "react";
import axios from "axios";

export default function ServiceEasePage() {
    // const [result, setResult] = useState([]);
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
   
      // setResult(responses.data);
      return null;
     
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <main>
      <h1>Data from API</h1>


    </main>
  );
}