# ParkNova Frontend 🖥️

The frontend for ParkNova is a modern, responsive Single Page Application (SPA) built using React and Vite. It features a stunning, premium dark-mode aesthetic with dynamic micro-animations, built to provide an incredible user experience for both administrators and on-the-ground workers.

## 🛠️ Tech Stack

- **Framework**: React 18
- **Build Tool**: Vite
- **Routing**: React Router DOM (v6)
- **Styling**: Vanilla CSS (Custom Design System with CSS Variables)
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **Charting**: Recharts
- **API Communication**: Axios
- **Real-Time WebSockets**: Socket.io-client

## 📂 Directory Structure

```text
/src
  /api          # Axios instances and API interceptors
  /assets       # Global CSS stylesheets, images, and fonts
  /components   # Reusable UI components (buttons, modals, charts)
  /context      # React Contexts (AuthContext for global user state)
  /layouts      # Master layout wrappers (AdminLayout)
  /pages        # Route-level components
    /admin      # Admin-specific pages (Enterprise Analytics, Pricing, Workers)
    /worker     # Worker-specific pages (Terminal Dashboard)
  App.jsx       # Main application router and lazy-loading boundaries
```

## 🚀 Development Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Environment Configuration**:
   We have provided a `.env.example` file. Copy it to create your own `.env` file:
   ```bash
   cp .env.example .env
   ```
   Open the `.env` file and verify the `VITE_API_BASE_URL` matches your running backend.

3. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:5173`.

4. **Build for Production**:
   ```bash
   npm run build
   ```
   The compiled assets will be generated in the `/dist` directory, ready to be deployed to Vercel, Netlify, or any static hosting provider.

## 🎨 Design Philosophy

The ParkNova frontend avoids bloated CSS frameworks in favor of a strictly controlled Vanilla CSS design system (`AdminCommon.css`, `index.css`). It prioritizes:
- **Glassmorphism & Depth**: Subtle shadows, semi-transparent backgrounds, and blurred overlays.
- **Data Density**: Complex data is structured into highly readable data tables, grids, and visual charts.
- **Feedback**: Every interactive element features micro-animations and hover states. Form submissions use non-blocking toast notifications.
