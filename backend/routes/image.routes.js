const express = require("express");
const axios = require("axios");
const multer = require("multer");

const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

router.post("/detect", upload.single("image"), async (req, res) => {
  try {

    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    const base64Image = req.file.buffer.toString("base64");

    const response = await axios.post(
      "https://api.clarifai.com/v2/models/food-item-recognition/outputs",
      {
        inputs: [
          {
            data: {
              image: {
                base64: base64Image,
              },
            },
          },
        ],
      },
      {
        headers: {
          Authorization: `Key ${process.env.CLARIFAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const concepts =
      response.data.outputs[0].data.concepts;

    const ingredients = concepts
      .slice(0, 5)
      .map((c) => c.name);

    res.json({ ingredients });

  } catch (err) {

    console.error("AI ERROR:", err.response?.data || err.message);

    res.status(500).json({
      message: "Image detection failed",
    });
  }
});

module.exports = router;