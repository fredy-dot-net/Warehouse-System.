// Vite is the tool that runs and builds our React website.
// This file only tells Vite: "this project uses React".
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
});
