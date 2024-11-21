"use server";
import axios from "axios";


const fetchCookies = async () => {
  try {
    const response = await axios.get("/api/cookies");
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching cookies:", error);
    throw new Error("Error fetching cookies");
  }
};

export default fetchCookies;
