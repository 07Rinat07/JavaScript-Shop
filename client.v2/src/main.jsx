import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { AppContextProvider } from './components/AppContext.js'

const root = createRoot(document.getElementById('root'))

root.render(
    <React.StrictMode>
        <AppContextProvider>
            <App />
        </AppContextProvider>
    </React.StrictMode>
)
