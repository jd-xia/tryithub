// --- React entry point: this file runs first and "mounts" the app into the HTML ---

import React from 'react' // Core React library (needed for JSX)
import ReactDOM from 'react-dom/client' // React 18 API: renders React into the real DOM
import { ErrorBoundary } from './components/ErrorBoundary' // Catches JS errors so the whole app doesn't crash
import App from './App' // Root component of your app
import './index.css' // Global styles

// createRoot: gets the DOM element with id "root" (from index.html)
// The "!" is TypeScript "non-null assertion" = we promise this element exists
// .render(): draws the React tree into that DOM node
ReactDOM.createRoot(document.getElementById('root')!).render(
  // StrictMode: development-only helper that double-invokes some code to find bugs
  <React.StrictMode>
    {/* ErrorBoundary wraps the app: if any child throws, it shows a fallback UI instead of a blank screen */}
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)
