const express = require("express");
const router = express.Router();
const axios = require("axios");

router.post("/price-suggest", async (req, res) => {
  try {
    const response = await axios.post(
      "http://localhost:8000/predict",
      req.body,
      { headers: { "Content-Type": "application/json" } }
    );

    return res.json(response.data);
  } catch (err) {
    const status = err.response?.status || 500;
    const details = err.response?.data || err.message;

    console.error("AI Error:", details);

    return res.status(status).json({
      error: "AI service failed",
      details,
    });
  }
});

module.exports = router;