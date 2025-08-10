import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initializeSystem } from './config/apiConfig'

// Initialize system with appropriate configuration
initializeSystem()

createRoot(document.getElementById("root")!).render(<App />);
