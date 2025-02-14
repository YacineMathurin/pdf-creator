import express from "express";
import puppeteer from "puppeteer";
import QRCode from "qrcode"; // Import the QRCode library
import os from "os";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"; // Import AWS SDK v3
import { default as htmlContent } from "./html-content.mjs";
import dotenv from "dotenv";

dotenv.config();

const {
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
  AWS_REGION,
  AWS_BUCKET_NAME,
} = process.env;

const app = express();
const port = 3000;

// Set up AWS S3 configuration for SDK v3
const s3 = new S3Client({
  region: AWS_REGION, // Set your AWS region
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID, // Your AWS Access Key
    secretAccessKey: AWS_SECRET_ACCESS_KEY, // Your AWS Secret Key
  },
});

// Function to generate the PDF using Puppeteer
async function generatePDF(htmlContent) {
  try {
    // Launch the browser (in headless mode)
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    // Set HTML content in the page
    await page.setContent(htmlContent, { waitUntil: "networkidle0" });

    // Generate PDF from the HTML
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
    });

    await browser.close();

    return pdfBuffer;
  } catch (error) {
    console.error("Error during PDF generation:", error);
    throw new Error("PDF generation failed");
  }
}

// Function to generate QR code for a URL as a data URL
async function generateQRCode(url) {
  try {
    // Generate the QR code as a base64-encoded image for the given URL
    const qrCodeDataUrl = await QRCode.toDataURL(url);
    return qrCodeDataUrl; // Return the base64-encoded QR code image
  } catch (error) {
    console.error("Error generating QR code:", error);
    throw new Error("QR Code generation failed");
  }
}

app.get("/generate-pdf", async (req, res) => {
  try {
    const { title, content } = req.query;

    if (!title || !content) {
      return res
        .status(400)
        .send('Missing "title" or "content" query parameter.');
    }

    const qrCodeDataUrl = await generateQRCode("https://chatgpt.com/");

    // Generate the PDF buffer
    const pdfBuffer = await generatePDF(htmlContent(qrCodeDataUrl));

    const hostname = os.hostname(); // e.g., "Johns-MacBook"

    // Define the S3 file path
    const fileName = `${hostname}_generated.pdf`;
    const s3Params = {
      Bucket: AWS_BUCKET_NAME,
      Key: `pdfs/${fileName}`, // Store PDFs in a 'pdfs' folder
      Body: pdfBuffer,
      ContentType: "application/pdf",
    };

    // Upload PDF to S3 using AWS SDK v3
    try {
      const command = new PutObjectCommand(s3Params); // Create a PutObjectCommand
      const data = await s3.send(command); // Send the command using the S3 client

      // Return the URL of the uploaded PDF
      const pdfUrl = `https://${AWS_BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/pdfs/${fileName}`;
      console.log(`File uploaded successfully at ${pdfUrl}`);

      // Respond with the S3 URL (or redirect to it)
      res.redirect(pdfUrl);
    } catch (err) {
      console.error("Error uploading file to S3:", err);
      return res.status(500).send("Error uploading PDF to S3.");
    }
  } catch (error) {
    console.error("Error during PDF generation:", error);
    res.status(500).send("Error generating PDF.");
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
