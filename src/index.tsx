import React from "react"
import ReactDOM from "react-dom/client"
import "./index.css"
// import App from "./App"
import ServiceWorkerApp from "./ServiceWorkerApp"

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement)
root.render(
  <React.StrictMode>
    <ServiceWorkerApp />
  </React.StrictMode>
)
