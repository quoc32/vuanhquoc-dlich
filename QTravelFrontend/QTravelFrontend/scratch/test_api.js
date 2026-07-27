import axios from 'axios';

async function test() {
  const api = axios.create({
    baseURL: 'http://localhost:3000/api/v1',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const response = await api.get('/hotels/', { params: { limit: 1 } });
  const returnedData = response.data; // this simulates hotel.service.js return
  
  // this simulates HotelSearchResults.jsx
  const finalArray = returnedData.data?.data || [];
  
  console.log("Is array?", Array.isArray(finalArray));
  console.log("Length:", finalArray.length);
  if (finalArray.length > 0) {
    console.log("First element name:", finalArray[0].name);
    console.log("First element rating:", finalArray[0].overallRating);
    console.log("First element object keys:", Object.keys(finalArray[0]));
  } else {
    console.log("Array is empty or undefined");
    console.log("returnedData keys:", Object.keys(returnedData));
    if (returnedData.data) console.log("returnedData.data keys:", Object.keys(returnedData.data));
  }
}

test().catch(console.error);
