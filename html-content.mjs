const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Certificate of Authentication - Republic of Niger</title>
    <style>
        body {
            font-family: 'Times New Roman', Times, serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }

        .certificate {
            max-width: 800px;
            margin: 0 auto;
            padding: 50px 80px;
            background-color: #fff;
            position: relative;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }

        .republic-header {
            display: flex;
            align-items: flex-start;
            gap: 15px;
            margin-bottom: 40px;
        }

        .flag {
            width: 60px;
            height: 40px;
            background: linear-gradient(
                to bottom,
                #E05206 33%, /* Orange */
                #fff 33% 66%,
                #0DB02B 66% /* Green */
            );
            border: 1px solid #ddd;
        }

        .republic-info {
            text-align: left;
            font-size: 14px;
            line-height: 1.4;
            color: #000;
        }

        .republic-info div:first-child {
            font-weight: bold;
            font-size: 16px;
        }

        .title {
            text-align: center;
            font-size: 36px;
            color: #E05206; /* Niger flag orange */
            margin: 20px 0 10px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 2px;
        }

        .subtitle {
            text-align: center;
            font-size: 18px;
            color: #666;
            margin-bottom: 30px;
        }

        .property-info {
            margin: 20px 0;
            padding: 20px;
            border: 2px solid #ddd;
        }

        .section-title {
            font-size: 24px;
            color: #0DB02B; /* Niger flag green */
            margin: 0 0 10px 0;
            border-bottom: 2px solid #0DB02B;
            padding-bottom: 5px;
        }

        .details-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
            margin: 15px 0;
        }

        .label {
            font-weight: bold;
            color: #555;
        }

        .signature-section {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 40px;
            margin-top: 50px;
        }

        .signature-line {
            border-top: 2px solid #000;
            margin-top: 50px;
            padding-top: 5px;
            text-align: center;
            font-weight: bold;
        }

        .seal {
            position: absolute;
            bottom: 70px;
            right: 40px;
            width: 120px;
            height: 120px;
            border: 2px solid #E05206;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            color: #E05206;
            text-align: center;
            transform: rotate(-15deg);
        }

        .qr-section {
            display: flex;
            align-items: center;
            justify-content: center;
            margin-top: 40px;
            margin-bottom: 20px;
            gap: 20px;
        }

        .qr-code {
            width: 100px;
            height: 100px;
            border: 1px solid #E05206;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: #f5f5f5;
        }

        .qr-text {
            font-size: 12px;
            color: #666;
            max-width: 200px;
        }

        .footer {
            text-align: center;
            margin-top: 30px;
            font-size: 14px;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="certificate">
        <div class="republic-header">
            <div class="republic-info">
                <div>RÉPUBLIQUE DU NIGER</div>
                <div>MINISTÈRE DE L'URBANISME</div>
                <div>DÉPARTEMENT D'AUTHENTIFICATION DES PROPRIÉTÉS</div>
                <div>Document Officiel</div>
            </div>
        </div>

        <div class="title">Certificate of Authentication</div>
        <div class="subtitle">Residential Property Verification</div>

        <div class="property-info">
            <div class="section-title">Property Details</div>
            <div class="details-grid">
                <div>
                    <span class="label">Property Address:</span>
                    <div>123 Example Street, Niamey, Niger</div>
                </div>
                <div>
                    <span class="label">Year Built:</span>
                    <div>2010</div>
                </div>
                <div>
                    <span class="label">Square Footage:</span>
                    <div>2,500 sq ft</div>
                </div>
                <div>
                    <span class="label">Lot Size:</span>
                    <div>0.25 acres</div>
                </div>
            </div>
        </div>

        <div class="section-title">Authentication Details</div>
        <div class="details-grid">
            <div>
                <span class="label">Inspection Date:</span>
                <div>February 14, 2025</div>
            </div>
            <div>
                <span class="label">Authentication Number:</span>
                <div>AUTH-2025-0214</div>
            </div>
            <div>
                <span class="label">Registry Reference:</span>
                <div>REF-123456</div>
            </div>
        </div>

        <div style="margin: 30px 0; line-height: 1.6; text-align: justify;">
            I, John Smith, holding certification number CERT-789, hereby verify that I have personally inspected the above-mentioned property and confirm its authenticity according to National Property Standards. This certificate is valid for one year from the date of issuance.
        </div>

        <div class="signature-section">
            <div class="signature-line">Authenticator's Signature</div>
            <div class="signature-line">Official Representative</div>
        </div>

        <div class="seal">
            OFFICIAL SEAL<br>
            Property Auth Dept.<br>
            2025
        </div>

        <div class="qr-section">
            <div class="qr-code">[QR Code]</div>
            <div class="qr-text">
                Scan this QR code to verify the authenticity of this certificate online at verify.niger-propertyauth.gov
            </div>
        </div>

        <div class="footer">
            This document is not valid if altered in any way<br>
            Department of Property Authentication • Niamey, Niger • (+227) 20-XX-XX-XX
        </div>
    </div>
</body>
</html>
`;

export default htmlContent;
