import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import { initNativeApp } from "./lib/initNative";
import { ErrorBoundary } from "./app/components/ErrorBoundary";
import { initMusicSettings } from "./app/components/audio/useMusicSettings";
import "./styles/index.css";

// Load persisted mute/volume before any screen mounts background music.
initMusicSettings();

initNativeApp().finally(() => {
  const root = document.getElementById("root");
  if (!root) {
    console.error("Root element #root not found");
    return;
  }
  createRoot(root).render(
    <ErrorBoundary>
      <App />
    </ErrorBoundary>,
  );
});