// "use client";
// import { useEffect, useState } from "react";
// import axios from "axios";

// export default function DataPage() {
//   useEffect(() => {
//     const fetchCookies = async () => {
//       const apiURL = "/api/cookies";
//       try {
//         const response = await axios.get(apiURL);
//         // setCookie(response.data);
//         return response.data;
//       } catch (err) {
//         console.error(err);
//       }
//     };
//     const fetchData = async () => {
//       try {
//         const apiURL2 = "/api/sync";
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

//         // setData(response2.data);
//         return null;
//         // console.log("page: " + data);
//       } catch (err) {
//         console.error(err);
//       }
//     };
//     fetchData();
//   }, []);

//   return (
//     <main>
//       <h1>Data from API</h1>
//     </main>
//   );
// }

"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { NextResponse } from "next/server";

export default function ServiceEasePage() {
  // const [result, setResult] = useState([]);
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const apiURL2 = "/api/data";
      const promises = [];

      for (let month = 7; month < 13; month++) {
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
      const response = await Promise.all(promises);

      return null;
    } catch (err) {
      console.error(err);
    }
  };

  return <h1>Data from API</h1>;
}
