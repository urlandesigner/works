import { ImageResponse } from "next/og";

// Card social (Open Graph / Twitter) gerado em build/runtime — sem binário.
export const alt =
  "Mensageiro do Bem — receba uma mensagem que chega bem na hora em que você precisava";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f1e8db",
          backgroundImage:
            "radial-gradient(circle at 50% 20%, rgba(232,205,180,0.8), rgba(241,232,219,0) 55%), radial-gradient(circle at 86% 82%, rgba(198,94,82,0.16), rgba(241,232,219,0) 45%)",
          padding: "60px",
        }}
      >
        {/* Carta lacrada — âncora visual da marca */}
        <svg width="340" height="243" viewBox="0 0 420 300" fill="none">
          <defs>
            <linearGradient id="body" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#fdf9f3" />
              <stop offset="1" stopColor="#f3e8da" />
            </linearGradient>
            <linearGradient id="seal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#d6786c" />
              <stop offset="1" stopColor="#b54d42" />
            </linearGradient>
          </defs>
          {/* Papel espiando por cima */}
          <rect
            x="120"
            y="36"
            width="180"
            height="120"
            rx="10"
            fill="#ffffff"
            stroke="#e0d5c8"
            strokeWidth="2"
          />
          <rect x="150" y="72" width="120" height="7" rx="3.5" fill="#4a433c" opacity="0.12" />
          <rect x="150" y="92" width="140" height="7" rx="3.5" fill="#4a433c" opacity="0.10" />
          <rect x="150" y="112" width="92" height="7" rx="3.5" fill="#4a433c" opacity="0.10" />
          {/* Corpo do envelope */}
          <rect
            x="40"
            y="108"
            width="340"
            height="172"
            rx="20"
            fill="url(#body)"
            stroke="#e0d5c8"
            strokeWidth="2"
          />
          {/* Vinco em V */}
          <path
            d="M46 120 L210 226 L374 120"
            stroke="#d8cabb"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Lacre de cera */}
          <circle cx="210" cy="198" r="40" fill="url(#seal)" stroke="#a8443a" strokeWidth="2" />
          <path
            transform="translate(193,183)"
            d="M17 30 L5 19 C-1 13.5 2 4 9 4 C12.6 4 15.4 6.6 17 8.8 C18.6 6.6 21.4 4 25 4 C32 4 35 13.5 29 19 Z"
            fill="#fff9f6"
          />
        </svg>

        <div
          style={{
            fontSize: 26,
            letterSpacing: 8,
            textTransform: "uppercase",
            color: "#b54d42",
            fontWeight: 600,
            marginTop: 28,
          }}
        >
          Uma mensagem no momento certo
        </div>
        <div
          style={{
            fontSize: 84,
            fontWeight: 700,
            color: "#46403a",
            letterSpacing: -2,
            marginTop: 12,
          }}
        >
          Mensageiro do Bem
        </div>
        <div
          style={{
            textAlign: "center",
            fontSize: 33,
            color: "#7d7268",
            marginTop: 20,
            maxWidth: 840,
            lineHeight: 1.3,
          }}
        >
          Receba uma mensagem que chega bem na hora em que você precisava.
        </div>
      </div>
    ),
    { ...size },
  );
}
