const express = require("express");
const multer = require("multer");
const axios = require("axios");
const path = require("path");
const FormData = require("form-data"); 

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
        formData.append("file", req.file.buffer, {
            filename: req.file.originalname,
            contentType: req.file.mimetype,
        });

        // Call FastAPI endpoint
        const response = await axios.post("https://retina-api-production.up.railway.app/predict", formData, {
            headers: formData.getHeaders(),
        });

        
        const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
        const originalName = req.file.originalname;


        res.render("index", { prediction: response.data, base64Image, originalName });
    } catch (error) {
        console.error(error);
        res.render("index", { prediction: { error: "Prediction failed", base64Image: null } });
    }
});

app.listen(3000, () => console.log("Server running on Render"));
