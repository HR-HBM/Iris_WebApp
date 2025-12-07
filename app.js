const express = require("express");
const multer = require("multer");
const axios = require("axios");
const path = require("path");
const FormData = require("form-data"); 
const dotenv = require("dotenv");
const { Resend } = require('resend');


const bodyParser = require('body-parser');
const { check, validationResult } = require('express-validator');
const nodemailer = require('nodemailer');


const app = express();
// const resend = new Resend(process.env.RESEND_API_KEY);
const upload = multer({ storage: multer.memoryStorage() });

// Set EJS as view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Serve static files
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

dotenv.config();
// const devpass = process.env.PASS;
// const devemail = process.env.EMAIL;


const transporter = nodemailer.createTransport({

                host: 'smtp.resend.com',
                port: 465,
                secure: true, // true for 465, false for other ports
                auth: {
                    user: 'resend',
                    pass: process.env.RESEND_API_KEY
                }
            });


// route for contact form
app.post('/send', async (req, res) => {
    const { name, email, message } = req.body;

    try {
        const response = await axios.post(
            'https://api.resend.com/emails',
            {
                from: 'Iris <onboarding@resend.dev>',
                to: [process.env.EMAIL],  // Must be array, must be verified email
                subject: `New Inquiry for Iris - From: ${name}`,
                text: `${name} (${email}) has a question about your project.\n\nMessage:\n${message}`
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log('✓ Email sent:', response.data);
        res.redirect('/success');
    } catch (error) {
        console.error('✗ Email error:', error.response?.data || error.message);
        res.status(500).send('Failed to send email: ' + (error.response?.data?.message || error.message));
    }
});

app.get('/success', (req, res) => {

    res.render("formSubmission");

});








// Home route
app.get("/", (req, res) => {
    res.render("index", { prediction: null, errors : '' });
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
