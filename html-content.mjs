const htmlContent = (qrCodeDataUrl) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Certificate of Authentication - Republic of Niger</title>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/tailwindcss/2.2.19/tailwind.min.css" rel="stylesheet">
</head>
<body>
    <div class="max-w-4xl mx-auto  pt-12 px-16 ">
        <!-- Republic Header -->
        <div class="mb-6">  
            <div class="text-left">
                <div class="font-bold text-lg text-gray-900">RÉPUBLIQUE DU NIGER</div>
                <div class="text-gray-800">MINISTÈRE DE L'URBANISME</div>
                <div class="text-gray-800">DÉPARTEMENT D'AUTHENTIFICATION DES PROPRIÉTÉS</div>
            </div>
        </div>

        <!-- Certificate Title -->
        <div class="text-center mb-6">
            <h1 class="text-lg font-bold text-orange-600 uppercase tracking-wider">Certificate of Authentication</h1>
            <div class="text-gray-600">Residential Property Verification</div>
        </div>

        <!-- Property Details -->
        <div class="mb-6 border border-gray-200 rounded-lg p-6">
            <h2 class="text-2xl font-semibold text-green-600 border-b border-green-600 pb-2 mb-4">Property Details</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <span class="font-semibold text-gray-700">Property Address:</span>
                    <div class="text-gray-800">123 Example Street, Niamey, Niger</div>
                </div>
                <div>
                    <span class="font-semibold text-gray-700">Year Built:</span>
                    <div class="text-gray-800">2010</div>
                </div>
                <div>
                    <span class="font-semibold text-gray-700">Square Footage:</span>
                    <div class="text-gray-800">2,500 sq ft</div>
                </div>
                <div>
                    <span class="font-semibold text-gray-700">Lot Size:</span>
                    <div class="text-gray-800">0.25 acres</div>
                </div>
            </div>
        </div>

        <!-- Authentication Details -->
        <div class="mb-4">
            <h2 class="text-2xl font-semibold text-green-600 border-b border-green-600 pb-2 mb-4">Authentication Details</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <span class="font-semibold text-gray-700">Inspection Date:</span>
                    <div class="text-gray-800">February 14, 2025</div>
                </div>
                <div>
                    <span class="font-semibold text-gray-700">Authentication Number:</span>
                    <div class="text-gray-800">AUTH-2025-0214</div>
                </div>
                <div>
                    <span class="font-semibold text-gray-700">Registry Reference:</span>
                    <div class="text-gray-800">REF-123456</div>
                </div>
            </div>
        </div>

        <!-- Certification Text -->
        <div class="my-2 text-gray-800 text-justify leading-relaxed">
            I, John Smith, holding certification number CERT-789, hereby verify that I have personally inspected the above-mentioned property and confirm its authenticity according to National Property Standards.
        </div>

        <!-- QR Code Section - Moved above signatures -->
        <div class="flex items-center justify-center gap-6">
            <img src="${qrCodeDataUrl}" alt="QR Code" />
            <div class="text-sm text-gray-600 max-w-xs">
                Scan this QR code to verify the authenticity of this certificate online at verify.niger-propertyauth.gov
            </div>
        </div>

        <!-- Signatures -->
        <div class="grid grid-cols-2 gap-12 mt-2 mb-16">
            <div class="text-center">
                <div class="border-t-2 border-gray-400 pt-2 font-semibold text-gray-700">Authenticator's Signature</div>
            </div>
            <div class="text-center">
                <div class="border-t-2 border-gray-400 pt-2 font-semibold text-gray-700">Official Representative</div>
            </div>
        </div>

        <!-- Official Seal -->
        <div class="absolute bottom-24 right-12 w-32 h-32 border-2 border-orange-600 rounded-full flex items-center justify-center text-center text-orange-600 text-sm transform -rotate-12">
            <div>
                OFFICIAL SEAL<br>
                Property Auth Dept.<br>
                2025
            </div>
        </div>

        <!-- Footer -->
        <div class="text-center text-sm text-gray-600 mt-20">
            <div>This document is not valid if altered in any way</div>
            <div class="mt-1">Department of Property Authentication • Niamey, Niger • (+227) 20-XX-XX-XX</div>
        </div>
    </div>
</body>
</html>
`;

export default htmlContent;
