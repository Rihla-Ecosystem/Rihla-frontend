# Rihla - AI Travel Companion (Frontend)

Rihla is an AI-powered travel companion designed for international tourists exploring Egypt. It offers personalized itineraries, cultural storytelling, real-time safety intelligence across 27 governorates, and local insights to enhance your Egyptian journey.

## 🚀 Getting Started

### Prerequisites

Make sure you have [Node.js](https://nodejs.org/) (v18 or higher recommended) and npm installed.

### Installation

1. Clone the repository and navigate to the project folder.
2. Install the dependencies:
   ```bash
   npm install
   ```

### Running the Development Server

Start the local development server:
```bash
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser to see the application. (Note: The port may vary depending on your local setup, typically `3000` or `3001`).

## 🛠️ Built With

- **[Next.js](https://nextjs.org/)** - React framework (App Router)
- **[React](https://reactjs.org/)** - UI library
- **Custom Design System** - Themed with unique design tokens inspired by Egyptian aesthetics (limestone, basalt, solar, nile, etc.)
- **[Lucide React](https://lucide.dev/)** - Iconography

## 📂 Project Structure

- `src/app/` - Next.js App Router pages (landing page, authentication, main app routes like `/explore`, `/history`, `/safety`, etc.)
- `src/app/components/` - Reusable UI components including foundational atoms (`Glyph`, `Geom`), layout shells, and domain-specific components.
- `src/app/data/` - Shared static data for sites, safety guidelines, and journeys.
- `src/lib/` - Constants (theme tokens), API client setup, and authentication context.

## 📝 License

This project is proprietary and all rights are reserved.