import { ImageResponse } from "next/og";

export const alt = "TestBench selector playground";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        alignItems: "center",
        background: "#151a1c",
        color: "#f5f7f5",
        display: "flex",
        height: "100%",
        justifyContent: "center",
        padding: "76px",
        width: "100%",
      }}
    >
      <div
        style={{
          border: "1px solid rgba(255,255,255,.12)",
          borderRadius: "28px",
          display: "flex",
          flexDirection: "column",
          height: "100%",
          justifyContent: "space-between",
          padding: "56px",
          width: "100%",
        }}
      >
        <div
          style={{
            alignItems: "center",
            color: "#b8ef6a",
            display: "flex",
            fontSize: "28px",
            fontWeight: 700,
          }}
        >
          <span style={{ marginRight: "18px" }}>{"{ }"}</span>
          TestBench
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: "78px",
              fontWeight: 700,
              letterSpacing: "-4px",
              lineHeight: 1,
            }}
          >
            Selectors, inspected.
          </div>
          <div
            style={{
              color: "#a8b0aa",
              fontSize: "30px",
              marginTop: "24px",
            }}
          >
            A private CSS and XPath playground for test automation developers.
          </div>
        </div>
      </div>
    </div>,
    size,
  );
}
