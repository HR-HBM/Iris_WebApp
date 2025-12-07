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

    // try {
    //     await resend.emails.send({
    //         from: 'Iris <onboarding@resend.dev>',
    //         to: process.env.EMAIL,
    //         subject: 'New Inquiry for Iris', 
    //         text: `${req.body.name} has a question about your project.\n \n Here are the details of this inquiry:\n

    //         Name: ${req.body.name}
    //         Email: ${req.body.email}
    //         Message: 
    //         ${req.body.message}`
    //     });
    //     res.render('response');
    
    // } catch (error) {
    //     console.error('Email error:', error);
    //     res.status(500).send('Failed to send email');
    // }


            


			const mail_option = {
                from: 'Iris <onboarding@resend.dev>',                
                to: process.env.EMAIL, 
                subject: 'New Inquiry for Iris', 
                text: `${name} has a question about your project.\n \n Here are the details of this inquiry:\n

            Name: ${name}
            Email: ${email}
            Message: 
            ${message}`
            };

			try {
        const info = await transporter.sendMail(mail_option);
        console.log('✓ Email sent:', info.messageId);
        res.redirect('/success');
    } catch (error) {
        console.error('✗ Email error:', error.message);
        res.status(500).send('Failed to send email: ' + error.message);
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
