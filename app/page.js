"use client"
import { useEffect, useState } from 'react';
import axios from "axios";

export default function DataPage() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchCookies = async () => {
      const apiURL = "/api/cookies";
      try {
        const response = await axios.get(apiURL);
        // setCookie(response.data);
        return response.data;
      } catch (err) {
        console.error(err);
      }
    };
    const fetchData = async () => {
      const apiURL2 = "/api/sync";
      const payload = {
        month: 11,
        year: 2024,
        region: "",
        branch: "",
        type: "All",
        callstatus: "",
      };
      const cookies = await fetchCookies();
      const send = { payload, cookies };
      try {
        const response2 = await axios.post(apiURL2, send);
        setData(response2.data);
        // console.log("page: " + data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);


  return (
    <main>
      <h1>Data from API</h1>
      <ul>
        {data.map((item) => (
          <li key={item._id}>{JSON.stringify(item)}</li>
        ))}
      </ul>
    </main>
  );
}
