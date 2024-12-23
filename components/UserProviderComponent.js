"use client";
import React, { createContext, useContext, useEffect } from "react";
import axios from "axios";

const UserContext = createContext();

export const UserProviderComponent = ({ children }) => {
  const fetchUserData = async () => {
    try {
      const cookiesResponse = await axios.post("/api/get-cookies");
      const regions = [
        "AP & TELANGANA",
        "CHATTISGARH",
        "GOA",
        "KALKA",
        "KARNATAKA",
        "KERALA",
        "MADHYA PRADESH",
        "MUMBAI",
        "RAJASTHAN",
        "TAMIL NADU",
        "West Bengal",
      ];
      let allUsersData = [];
      let allBranchData = [];

      // Fetch all branches data
      for (const region of regions) {
        const regionPayload = { region };
        const branchResponse = await axios.post("/api/branch", {
          regionPayload,
          cookies: cookiesResponse.data.cookies,
        });
        allBranchData = [...allBranchData, ...branchResponse.data.branchResponse];
      }

      // Function to get branches by region
      const getBranchesByRegion = (region) => {
        return allBranchData
          .filter((branchData) => branchData.REGION === region)
          .map((branchData) => branchData.BRANCH);
      };

      for (const region of regions) {
        const branches = getBranchesByRegion(region);

        for (const branch of branches) {
          const payload = {
            region,
            branch,
          };

          const userResponse = await axios.post("/api/get-users", {
            payload,
            cookies: cookiesResponse.data.cookies,
          });

          allUsersData = [...allUsersData, ...userResponse.data.userResponse];
        }
      }
      const storeDataInChunks = async (data) => {
        const chunkSize = 50;
        for (let i = 0; i < data.length; i += chunkSize) {
          const chunk = data.slice(i, i + chunkSize);
          const storePayload = { usersData: chunk };
          await axios.post("/api/store-user", storePayload);
        }
      };

      await storeDataInChunks(allUsersData);

    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  return (
    <UserContext.Provider value={{ fetchUserData }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => useContext(UserContext);
