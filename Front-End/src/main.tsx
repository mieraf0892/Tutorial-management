import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// ✅ PDF.js worker — local, bundled, CORS-proof
import { pdfjs } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

createRoot(document.getElementById("root")!).render(<App />);
