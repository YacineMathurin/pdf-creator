const express = require("express");
const puppeteer = require("puppeteer");
const os = require("os");
const AWS = require("aws-sdk");
require("dotenv").config();

const {
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
  AWS_REGION,
  AWS_BUCKET_NAME,
} = process.env;
const app = express();
const port = 3000;

// Set up AWS S3 configuration
AWS.config.update({
  accessKeyId: AWS_ACCESS_KEY_ID, // replace with your access key
  secretAccessKey: AWS_SECRET_ACCESS_KEY, // replace with your secret key
  region: AWS_REGION, // e.g., 'us-east-1'
});

const s3 = new AWS.S3();

// Function to generate the PDF using Puppeteer
async function generatePDF(htmlContent) {
  try {
    // Launch the browser (in headless mode)
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    // Set HTML content in the page
    await page.setContent(htmlContent, { waitUntil: "domcontentloaded" });

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

app.get("/generate-pdf", async (req, res) => {
  try {
    const { title, content } = req.query;

    if (!title || !content) {
      return res
        .status(400)
        .send('Missing "title" or "content" query parameter.');
    }

    const htmlContent = `
      <html>
        <body>
          <h1>Test PDF</h1>
          <p>This is a test PDF generated by Puppeteer!</p>
          <h1>${title}</h1>
          <p>${content}</p>
        </body>
      </html>
    `;

    // Generate the PDF buffer
    const pdfBuffer = await generatePDF(htmlContent);

    const hostname = os.hostname(); // e.g., "Johns-MacBook"

    // Define the S3 file path
    const fileName = `${hostname}_generated.pdf`;
    const s3Params = {
      Bucket: AWS_BUCKET_NAME,
      Key: `pdfs/${fileName}`, // Store PDFs in a 'pdfs' folder
      Body: pdfBuffer,
      ContentType: "application/pdf",
    };

    // Upload PDF to S3
    s3.upload(s3Params, (err, data) => {
      if (err) {
        console.error("Error uploading file to S3:", err);
        return res.status(500).send("Error uploading PDF to S3.");
      }

      // Return the URL of the uploaded PDF
      const pdfUrl = data.Location; // The URL of the uploaded file on S3
      console.log(`File uploaded successfully at ${pdfUrl}`);

      // Respond with the S3 URL (or redirect to it)
      res.redirect(pdfUrl);
    });
  } catch (error) {
    console.error("Error during PDF generation:", error);
    res.status(500).send("Error generating PDF.");
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
