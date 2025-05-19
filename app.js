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

const diagnosis = {'General Knowledge': 9, 'Entertainment:Books': 10, 'Entertainment: Music': 12, 'Video Games': 15, 'Science & Nature': 17, 'Science: Computers': 18, 'History': 23, 'Politics': 24, 'Animals': 27, 'Vehicles': 28, 'Gadgets': 30, 'Japanese Anime & Manga': 31, 'Cartoon & Animations': 32, 'Board Games': 16, 'Sports': 21, ' Entertainment: Films': 11, 'Entertainment: Musicals & Theatres': 13, 'Television': 14};


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