# 🌤️ ATMOS — Interactive Weather Website

An interactive, responsive weather dashboard built with **React** and **Vite**. ATMOS provides live forecasts, detailed meteorological cards, dynamic animated scenes based on current weather conditions, air quality monitoring, and astronomical data.

---

## ✨ Features

* **Dynamic Weather Scenes:** Interactive visual effects matching live conditions (sunny, rainy, cloudy, stormy, etc.).
* **Detailed Metrics:** Real-time temperature, humidity, wind speed, pressure, and visibility.
* **Air Quality Index (AQI):** Comprehensive particulate and pollutant monitoring.
* **Moon & Sun Tracking:** Accurate sunrise, sunset, and lunar phase calculations.
* **Location Search & Geolocation:** Search for global cities or auto-detect current location.

---

## 🛠️ Tech Stack

* **Framework:** [React](https://react.dev/)
* **Build Tool:** [Vite](https://vitejs.dev/)
* **Styling:** CSS3 
* **Icons & Assets:** Custom SVG / Weather icons

---

## 📁 Project Structure

```text
ATMOS/
├── .github/              # GitHub Actions workflows
├── src/
│   ├── assets/           # Icons, images, and animations
│   ├── components/       # UI components (WeatherScene, WeatherCards, etc.)
│   ├── data/             # Mock datasets and fallbacks
│   ├── services/         # API & utility functions (weather, AQI, moon, location)
│   ├── styles/           # Global and modular stylesheets
│   ├── App.jsx           # Main application shell
│   └── main.jsx          # Entry point
├── index.html            # HTML template
├── package.json          # Dependencies and scripts
└── vite.config.js        # Vite configuration
```

## 🚀 Getting Started

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) (v16+ recommended)

### Installation

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/Priyansh2811/ATMOS-Weather.git]
   cd ATMOS-Weather
   ```
   
 2. **Install dependencies:**

    ```bash
    npm install
    ```
    
 3. **Start the local development server:**
  
    ```bash
    npm run dev
    ```
    
 4. **Open in browser:**
     
    Navigate to ```http://localhost:5173```
