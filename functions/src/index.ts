import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import fetch from "node-fetch";

admin.initializeApp();
const db = admin.firestore();

export const getPriceSuggestion = functions.https.onCall(async (data, context) => {
  // 1. Validate Input & Authentication
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "User must be logged in.");
  }

  const { crop, location } = data;
  if (!crop || !location) {
    throw new functions.https.HttpsError("invalid-argument", "Crop and location are required.");
  }

  // 2. Check Firestore Cache
  const cacheKey = `${crop.toLowerCase()}_${location.toLowerCase()}`.replace(/\s+/g, "_");
  const cacheRef = db.collection("price_cache").doc(cacheKey);
  const cacheSnap = await cacheRef.get();

  if (cacheSnap.exists) {
    const cacheData = cacheSnap.data();
    // Cache valid for 24 hours
    if (Date.now() - cacheData!.timestamp < 24 * 60 * 60 * 1000) {
      return { ...cacheData, source: "cache" };
    }
  }

  // 3. Fetch from data.gov.in API
  // Note: Set this using `firebase functions:config:set datagov.apikey="YOUR_KEY"`
  const apiKey = functions.config().datagov?.apikey || process.env.DATAGOV_API_KEY;

  if (!apiKey) {
    throw new functions.https.HttpsError("failed-precondition", "API Key is not configured.");
  }

  try {
    const url = `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=${apiKey}&format=json&filters[commodity]=${encodeURIComponent(crop)}&filters[state]=${encodeURIComponent(location)}`;
    const response = await fetch(url);
    const result = await response.json();

    if (!result.records || result.records.length === 0) {
      throw new functions.https.HttpsError("not-found", "No market data found for this crop and location.");
    }

    // 4. Calculate Logic
    let minSum = 0, maxSum = 0, modalSum = 0;
    result.records.forEach((r: any) => {
      minSum += parseFloat(r.min_price);
      maxSum += parseFloat(r.max_price);
      modalSum += parseFloat(r.modal_price);
    });

    const count = result.records.length;
    const modalPrice = Math.round(modalSum / count);
    
    const responseData = {
      minPrice: Math.round(minSum / count),
      maxPrice: Math.round(maxSum / count),
      modalPrice: modalPrice,
      recommendedPrice: Math.round(modalPrice * 1.05), // Suggest slightly higher than modal price for profit
      timestamp: Date.now(),
    };

    // 5. Store in Cache
    await cacheRef.set(responseData);

    return { ...responseData, source: "data.gov.in" };
  } catch (error) {
    console.error("API Error:", error);
    throw new functions.https.HttpsError("internal", "Failed to fetch price data.");
  }
});
