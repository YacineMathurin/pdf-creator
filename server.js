const express = require("express");
const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");
const os = require("os");

const app = express();
const port = 3000;

const folderPath = path.join(__dirname, "gen");

// Ensure the 'gen' folder exists, create it if it doesn't
if (!fs.existsSync(folderPath)) {
  fs.mkdirSync(folderPath);
}
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
    const pdfBuffer = await generatePDF(htmlContent);

    const hostname = os.hostname(); // e.g., "Johns-MacBook"

    // Use the hostname to generate a unique file name in the 'gen' folder
    const filePath = path.join(folderPath, `${hostname}_generated.pdf`);
    fs.writeFileSync(filePath, pdfBuffer);

    // Serve the PDF file
    res.sendFile(filePath, (err) => {
      if (err) {
        console.error("Error sending file:", err);
        res.status(500).send("Error serving the PDF file.");
      }
    });
  } catch (error) {
    console.error("Error during PDF generation:", error);
    res.status(500).send("Error generating PDF.");
  }
});

// Start the Express server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
