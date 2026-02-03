
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import ImagePreloader from './components/ImagePreloader.tsx'

createRoot(document.getElementById('root')!).render(
    <>
        <ImagePreloader />
        <App />
    </>
)
