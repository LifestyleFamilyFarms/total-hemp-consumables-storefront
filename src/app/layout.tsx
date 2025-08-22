import { getBaseURL } from "@lib/util/env"
import { Metadata } from "next"
import "styles/globals.css"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

const ComingSoon: React.FC = () => {
  return (
    <main
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundColor: "#f8f8f8",
        color: "#333",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <h1 style={{ fontSize: "3rem", marginBottom: "1rem" }}>
          Coming Soon – Fall&nbsp;2025
        </h1>
        <p style={{ fontSize: "1.25rem" }}>
          We're working on something exciting. Check back soon to see what's
          growing at Total Hemp.
        </p>
      </div>
    </main>
  );
};

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en" data-mode="light">
      <body>
        
        {/* uncomment to reactivate store */}
        {/* <main className="relative">{props.children}</main> */}
        <ComingSoon />
      </body>
    </html>
  )
}



