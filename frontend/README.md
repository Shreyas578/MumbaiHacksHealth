# Health Fact Guardian - Frontend

React frontend for the Health Fact Guardian AI health crisis agent.

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure API endpoint:**
   Create a `.env` file in the frontend directory:
   ```
   VITE_API_URL=http://localhost:8000
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   ```

## Tech Stack

- **React** - UI framework
- **Vite** - Build tool and dev server
- **Material-UI (MUI)** - Component library for modern, beautiful UI
- **Axios** - HTTP client for API calls
- **Emotion** - CSS-in-JS styling (required by MUI)

## Project Structure

```
frontend/
├── src/
│   ├── components/     # Reusable React components
│   ├── pages/          # Page components
│   ├── api/            # API client utilities
│   ├── hooks/          # Custom React hooks
│   ├── App.jsx         # Main application component
│   └── main.jsx        # Application entry point
├── public/             # Static assets
└── package.json        # Dependencies and scripts
```

## Available Scripts

- `npm run dev` - Start development server (http://localhost:5173)
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

## Development

The app will hot-reload as you make changes. Visit http://localhost:5173 to see your app.
