import React from "react";

const CertificatePreview = () => {
  return (
    <div
      style={{
        fontFamily: "'Times New Roman', Times, serif",
        margin: 0,
        padding: "20px",
        backgroundColor: "#f5f5f5",
        minHeight: "100vh",
      }}
    >
      <div
        style={{
          maxWidth: "800px",
          margin: "0 auto",
          padding: "40px",
          backgroundColor: "#fff",
          border: "20px solid #234567",
          position: "relative",
          boxShadow: "0 0 10px rgba(0,0,0,0.1)",
        }}
      >
        <div
          style={{
            textAlign: "center",
            marginBottom: "30px",
          }}
        >
          <div
            style={{
              fontSize: "36px",
              color: "#234567",
              marginBottom: "10px",
              fontWeight: "bold",
              textTransform: "uppercase",
              letterSpacing: "2px",
            }}
          >
            Certificate of Authentication
          </div>
          <div
            style={{
              fontSize: "18px",
              color: "#666",
              marginBottom: "20px",
            }}
          >
            Residential Property Verification
          </div>
        </div>

        <div
          style={{
            margin: "20px 0",
            padding: "20px",
            border: "2px solid #ddd",
          }}
        >
          <div
            style={{
              fontSize: "24px",
              color: "#234567",
              margin: "0 0 10px 0",
              borderBottom: "2px solid #234567",
              paddingBottom: "5px",
            }}
          >
            Property Details
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "15px",
              margin: "15px 0",
            }}
          >
            <div>
              <span style={{ fontWeight: "bold", color: "#555" }}>
                Property Address:
              </span>
              <div>123 Example Street, City, State 12345</div>
            </div>
            <div>
              <span style={{ fontWeight: "bold", color: "#555" }}>
                Year Built:
              </span>
              <div>2010</div>
            </div>
            <div>
              <span style={{ fontWeight: "bold", color: "#555" }}>
                Square Footage:
              </span>
              <div>2,500 sq ft</div>
            </div>
            <div>
              <span style={{ fontWeight: "bold", color: "#555" }}>
                Lot Size:
              </span>
              <div>0.25 acres</div>
            </div>
          </div>
        </div>

        <div
          style={{
            fontSize: "24px",
            color: "#234567",
            margin: "20px 0 10px 0",
            borderBottom: "2px solid #234567",
            paddingBottom: "5px",
          }}
        >
          Authentication Details
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "15px",
            margin: "15px 0",
          }}
        >
          <div>
            <span style={{ fontWeight: "bold", color: "#555" }}>
              Inspection Date:
            </span>
            <div>February 13, 2025</div>
          </div>
          <div>
            <span style={{ fontWeight: "bold", color: "#555" }}>
              Authentication Number:
            </span>
            <div>AUTH-2025-0213</div>
          </div>
          <div>
            <span style={{ fontWeight: "bold", color: "#555" }}>
              Registry Reference:
            </span>
            <div>REF-123456</div>
          </div>
        </div>

        <div
          style={{
            margin: "30px 0",
            lineHeight: "1.6",
            textAlign: "justify",
          }}
        >
          I, John Smith, holding certification number CERT-789, hereby verify
          that I have personally inspected the above-mentioned property and
          confirm its authenticity according to National Property Standards.
          This certificate is valid for one year from the date of issuance.
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "40px",
            marginTop: "50px",
          }}
        >
          <div
            style={{
              borderTop: "2px solid #000",
              marginTop: "50px",
              paddingTop: "5px",
              textAlign: "center",
              fontWeight: "bold",
            }}
          >
            Authenticator's Signature
          </div>
          <div
            style={{
              borderTop: "2px solid #000",
              marginTop: "50px",
              paddingTop: "5px",
              textAlign: "center",
              fontWeight: "bold",
            }}
          >
            Official Representative
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            bottom: "70px",
            right: "40px",
            width: "120px",
            height: "120px",
            border: "2px solid #234567",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "12px",
            color: "#234567",
            textAlign: "center",
            transform: "rotate(-15deg)",
          }}
        >
          OFFICIAL SEAL
          <br />
          Property Auth Co.
          <br />
          2025
        </div>

        <div
          style={{
            textAlign: "center",
            marginTop: "30px",
            fontSize: "14px",
            color: "#666",
          }}
        >
          This document is not valid if altered in any way
          <br />
          Property Authentication Company • 456 Business Ave, City, State 12345
          • (555) 123-4567
        </div>
      </div>
    </div>
  );
};

export default CertificatePreview;
