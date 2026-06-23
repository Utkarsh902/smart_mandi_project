import cors from "cors";
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
    app.use(cors());

  app.use(express.json());

  // Mock Mandi Price API
  app.get("/api/mandi-prices", (req, res) => {
    const { crop, location } = req.query;
    // In a real app, this would call an external government or market API
    const basePrice = Math.floor(Math.random() * 2000) + 1000; // Random price between 1000 and 3000
    res.json({
      crop: crop || "Wheat",
      location: location || "Local Mandi",
      currentPrice: basePrice,
      unit: "per Quintal",
      trend: Math.random() > 0.5 ? "up" : "down",
      updatedAt: new Date().toISOString(),
    });
  });

  // ML Price Suggestion API (Integrates with data.gov.in)
  app.post("/api/suggest-price", async (req, res) => {
    const { crop, location } = req.body;
    if (!crop || !location) {
      return res.status(400).json({ error: "Crop and location are required" });
    }

    const apiKey = process.env.DATAGOV_API_KEY;

    // If API key is provided, fetch real data from Agmarknet (data.gov.in)
    if (apiKey && apiKey !== "YOUR_DATAGOV_API_KEY") {
      try {
        const url = `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=${apiKey}&format=json&filters[commodity]=${encodeURIComponent(crop)}&filters[state]=${encodeURIComponent(location)}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.records && data.records.length > 0) {
          let minSum = 0, maxSum = 0, modalSum = 0;
          
          data.records.forEach((r: any) => {
            minSum += parseFloat(r.min_price);
            maxSum += parseFloat(r.max_price);
            modalSum += parseFloat(r.modal_price);
          });
          
          const count = data.records.length;
          const modalPrice = Math.round(modalSum / count);
          
          return res.json({
            minPrice: Math.round(minSum / count),
            maxPrice: Math.round(maxSum / count),
            modalPrice: modalPrice,
            recommendedPrice: Math.round(modalPrice * 1.05), // 5% profit margin over modal
            source: "data.gov.in"
          });
        }
      } catch (error) {
        console.error("Error fetching from data.gov.in:", error);
        // Fallback to mock data if API fails
      }
    }

    // Fallback Mock Data (if no API key or no records found)
    const basePrice = Math.floor(Math.random() * 1000) + 1500;
    res.json({
      minPrice: basePrice - 200,
      maxPrice: basePrice + 300,
      modalPrice: basePrice,
      recommendedPrice: Math.round(basePrice * 1.05),
      source: "mock_estimation"
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });

  server.on("error", (err: any) => {
    if (err && err.code === "EADDRINUSE") {
      console.error(`Port ${PORT} is already in use. Kill the process using it or set the PORT environment variable.`);
    } else {
      console.error("Server error:", err);
    }
    process.exit(1);
  });
}

startServer();
