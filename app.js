const express = require("express");
const multer = require("multer");
const axios = require("axios");
const path = require("path");
const FormData = require("form-data"); 
const dotenv = require("dotenv");

const bodyParser = require('body-parser');
const { check, validationResult } = require('express-validator');
const nodemailer = require('nodemailer');


const app = express();
const upload = multer({ storage: multer.memoryStorage() });

// Set EJS as view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Serve static files
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

dotenv.config();
const devpass = process.env.PASS;
const devemail = process.env.EMAIL;


// route for contact form
app.post('/send', 
	[
		check('name').notEmpty().withMessage('Name is required'),
		check('email').isEmail().withMessage('Invalid Email Address'),
		check('message').notEmpty().withMessage('Message is required')
	], (req, res) => {

		const errors = validationResult(req);

		if(!errors.isEmpty())
		{
			res.render('index', { errors : errors.mapped() });
		}
		else
		{
			const transporter = nodemailer.createTransport({
				service : 'Gmail',
				auth : {
					user : devemail,
					pass : devpass
				}
			});

			const mail_option = {
                from: devemail,                
                to: 'theengineersarchive@gmail.com', 
                subject: 'New Inquiry for Iris', 
                text: `${req.body.name} has a question about your project.\n \n Here are the details of this inquiry:\n

            Name: ${req.body.name}
            Email: ${req.body.email}
            Message: 
            ${req.body.message}`
            };

			transporter.sendMail(mail_option, (error, info) => {
				if(error)
				{
					console.log(error);
				}
				else
				{
					res.redirect('/success');
				}
			});
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
