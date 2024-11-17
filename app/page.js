"use client";
import { useEffect, useState } from "react";
import axios from "axios";

export default function DataPage() {
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
      try {
        const apiURL2 = "/api/sync";
        const cookies = await fetchCookies();
        const promises = [];

        for (let month = 8; month < 13; month++) {
          const payload = {
            month: month,
            year: 2024,
            region: "",
            branch: "",
            type: "All",
            callstatus: "",
          };
          const send = { payload, cookies };
          promises.push(axios.post(apiURL2, send));
        }
        const responses = await Promise.all(promises);
     
        // setData(response2.data);
        return null;
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
    </main>
  );
}

//...............................................

// "use client";

// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import TableDisplayAndFilters from "./(components)/tableDisplayAndFilters";
// import DataExtractor from "./(components)/dataExtractor";
// import TableView from "./(components)/TableView";

// const DataPage = () => {
//   const [data, setData] = useState(null);
//   const [processedData, setProcessedData] = useState([]);

//   useEffect(() => {
//     const fetchCookies = async () => {
//       const apiURL = "/api/webapp";
//       try {
//         const response = await axios.get(apiURL);
//         // setCookie(response.data);
//         return response.data;
//       } catch (err) {
//         console.error(err);
//       }
//     };
//     async function fetchData() {
//       try {
//         let data = [];
//         const apiURL2 = "/api/serviceease";
//         const cookies = await fetchCookies();
//         const promises = [];

//         for (let month = 8; month < 13; month++) {
//           const payload = {
//             month: month,
//             year: 2024,
//             region: "",
//             branch: "",
//             type: "All",
//             callstatus: "",
//           };
//           const send = { payload, cookies };
//           promises.push(axios.post(apiURL2, send));
//         }

//         const responses = await Promise.all(promises);
//         responses.forEach((response) => {
//           const arr = response.data;
//           console.log(arr);
//           data = [...data, ...arr];
//         });

//         setData(data);
//       } catch (error) {
//         console.error("Error fetching data:", error);
//       }
//     }

//     fetchData();
//   }, []);
//   const selectedColumns = [16, 18, 3, 14, 15, 26, 20, 21, 22, 23, 24, 25, 27];
//   const points = {
//     Breakdown: {
//       eng: { new: 0, pending: 1, closed: [2, 2.5, 3] },
//       branch: { new: -0.1, pending: -0.05, closed: 0 },
//       region: { new: 0, pending: 0, closed: 0 },
//     },
//     Installation: {
//       eng: { new: 0, pending: 1, closed: [2, 2.5, 3] },
//       branch: { new: 0, pending: -0.25, closed: 0.2 },
//       region: { new: 0, pending: 0, closed: 0 },
//     },
//     Pm: {
//       eng: { new: 0, pending: 1.5, closed: [2, 3, 3] },
//       branch: { new: 0, pending: -0.5, closed: 0.1 },
//       region: { new: 0, pending: 0, closed: 0 },
//     },
//   };
//   return (
//     <div>
//       <h1>Complaint Data</h1>
//       {/* <p>{JSON.stringify(data)}</p> */}

//       <DataExtractor data={data} onDataProcessed={setProcessedData} />
//       <TableView data={processedData} selectedColumns={selectedColumns} />
//     </div>
//   );
// };

// export default DataPage;
