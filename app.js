const express = require("express");
const multer = require("multer");
const axios = require("axios");
const path = require("path");
const FormData = require("form-data"); // Explicitly use form-data package

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

// Set EJS as view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Serve static files
app.use(express.static("public"));

// Home route
app.get("/", (req, res) => {
    res.render("index", { prediction: null });
});

// Prediction route
app.post("/predict", upload.single("image"), async (req, res) => {
    try {
        const formData = new FormData();
        // Use Buffer directly instead of Blob
        formData.append("file", req.file.buffer, {
            filename: req.file.originalname,
            contentType: req.file.mimetype,
        });

        // Call FastAPI endpoint
        const response = await axios.post("http://127.0.0.1:8000/predict", formData, {
            headers: formData.getHeaders(),
        });

        res.render("index", { prediction: response.data });
    } catch (error) {
        console.error(error);
        res.render("index", { prediction: { error: "Prediction failed" } });
    }
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));