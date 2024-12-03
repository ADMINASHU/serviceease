// app/ServiceEasePage.js
"use client";

import { useContext } from "react";
import DataContext from "../../context/DataContext";

export default function ServiceEasePage() {
  const { transformedData } = useContext(DataContext);

  return (
    <div>
      <h1>Data from API</h1>
      <p>Total rows: {transformedData ? transformedData.length : 0}</p>
      {/* {transformedData && (
        <ul>
          {transformedData.map((item, index) => (
            <li key={index}>{JSON.stringify(item)}</li>
          ))}
        </ul>
      )} */}
    </div>
  );
}
