# StryDash

A modern Next.js dashboard to visualize your Stryd running activities from a SQLite database.

![Next.js](https://img.shields.io/badge/Next.js-16.1.1-black)
![React](https://img.shields.io/badge/React-19.0.0-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7.3-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Features

### 🏃 Activity Management
- **Activity List** - Browse all your activities with key statistics (distance, duration, pace, power, heart rate)
- **Detailed View** - Complete activity breakdown with all metrics and statistics
- **Filtering** - Multi-select filter by activity type (easy, tempo, interval, etc.)
- **Tag-based Filtering** - Click on tags to filter activities
- **Calendar View** - Weekly calendar showing activities with navigation for multiple activities per day

### 📊 Data Visualization
- **Interactive Charts** - Time series visualization for power, heart rate, speed, cadence, stride length, and elevation
- **Power Zones** - Visual power zone distribution
- **Lap/Split Filtering** - Zoom into specific segments of your activity
- **GPS Route Display** - View your route on an interactive map with power-based color gradient

### 🤖 StrAId - AI Assistant
- **Intelligent Chat** - Ask questions about your training data and get insights
- **Context-Aware** - AI understands your activity history and provides personalized advice
- **Powered by Ollama** - Local LLM integration (Mistral) for privacy-focused AI interactions
- **Training Analysis** - Get recommendations, analyze patterns, and understand your performance

### 📈 Trends & Analytics
- **Performance Trends** - Visualize your progress over time
- **Statistics Dashboard** - Key metrics and performance indicators
- **Historical Comparison** - Track improvements and identify patterns

### 🗺️ Maps
- **Dual Map Providers** - Choose between OpenStreetMap (Leaflet) or MapLibre GL JS
- **Power Gradient** - Route colored by power output (green → yellow → red)
- **Start/Finish Markers** - Clear visual indicators for route beginning and end

### 🌐 Internationalization
- **Multi-language Support** - Full English and French translations
- **Easy Language Switching** - Change language from settings page

### 🎨 Customization
- **Dark Mode** - Toggle between light and dark themes
- **Responsive Design** - Optimized for desktop and mobile devices
- **Modern UI** - Clean, gradient-based design with smooth animations

## 🛠️ Technologies

- **[Next.js 16.1.1](https://nextjs.org/)** - React framework with App Router and Server Components
- **[React 19.0.0](https://react.dev/)** - UI library
- **[TypeScript 5.7.3](https://www.typescriptlang.org/)** - Type-safe JavaScript
- **[Tailwind CSS 3.4.15](https://tailwindcss.com/)** - Utility-first CSS framework
- **[better-sqlite3](https://github.com/WiseLibs/better-sqlite3)** - Synchronous SQLite database
- **[Recharts 2.13.3](https://recharts.org/)** - Charting library
- **[Leaflet 1.9.4](https://leafletjs.com/)** - Interactive maps (OpenStreetMap)
- **[MapLibre GL JS 5.15.0](https://maplibre.org/)** - Vector map rendering
- **[Lucide React](https://lucide.dev/)** - Beautiful icon set
- **[Ollama](https://ollama.ai/)** - Local LLM integration for AI features

## 📦 Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd strydash
```

2. **Install dependencies**
```bash
pnpm install
```

3. **Setup Ollama (optional, for AI features)**
   - Install [Ollama](https://ollama.ai/)
   - Pull the Mistral model: `ollama pull mistral`
   - Ensure Ollama is running: `ollama serve`

4. **Ensure the database file is present**
   - Place your `stryd_activities.db` file in the project root

5. **Start the development server**
```bash
pnpm dev
```

6. **Open your browser**
   - Navigate to [http://localhost:3000](http://localhost:3000)

## 🗄️ Database Schema

The project expects the following SQLite tables:

- **`activities`** - General activity information (name, date, distance, duration, type, tags, etc.)
- **`gps_data`** - GPS coordinates with timestamps and power values
- **`timeseries_power`** - Power data over time
- **`timeseries_cardio`** - Heart rate data
- **`timeseries_kinematics`** - Speed, cadence, stride length
- **`timeseries_elevation`** - Elevation data
- **`laps`** - Activity splits/laps

## 📁 Project Structure

```
strydash/
├── app/
│   ├── activities/[id]/
│   │   └── page.tsx           # Activity detail page
│   ├── api/
│   │   ├── chat/
│   │   │   └── route.ts       # AI chat API endpoint
│   │   └── models/
│   │       └── route.ts       # Ollama models API endpoint
│   ├── calendar/
│   │   └── page.tsx           # Calendar view page
│   ├── overview/
│   │   └── page.tsx           # Overview/dashboard page
│   ├── settings/
│   │   └── page.tsx           # Settings page
│   ├── straid/
│   │   └── page.tsx           # StrAId AI assistant page
│   ├── trends/
│   │   └── page.tsx           # Trends and analytics page
│   ├── layout.tsx             # Root layout with theme provider
│   ├── page.tsx               # Home page (activity list)
│   └── globals.css            # Global styles
│
├── components/
│   ├── ActivityDetailClient.tsx  # Client-side activity detail
│   ├── ActivityList.tsx          # Activity list with stats
│   ├── CalendarClient.tsx        # Weekly calendar view
│   ├── ChatButton.tsx            # AI chat interface button
│   ├── FilterBar.tsx             # Activity filtering UI
│   ├── HomeClient.tsx            # Home page client wrapper
│   ├── MapLibreMap.tsx           # MapLibre GL JS implementation
│   ├── PowerZones.tsx            # Power zone visualization
│   ├── PreferencesProvider.tsx   # User preferences context
│   ├── RouteMap.tsx              # GPS route display
│   ├── Sidebar.tsx               # Navigation sidebar
│   ├── TimeseriesChart.tsx       # Interactive time series chart
│   └── TrendsClient.tsx          # Trends page client component
│
├── lib/
│   ├── db.ts                  # SQLite database functions
│   ├── preferences.ts         # User preferences management
│   └── translations.ts        # i18n translations (EN/FR)
│
├── stryd_activities.db        # SQLite database (not in repo)
└── package.json               # Project dependencies
```

## 🎯 Usage

### Activity List
- View all activities with key metrics
- Use the **Select Type** dropdown to filter by activity type (multiple selection)
- Click on **tags** to add them to filters
- Click on any activity card to view details

### Activity Detail
- Complete statistics breakdown
- Interactive time series chart with metric selection
- Power zone distribution
- GPS route with power gradient coloring
- Filter by laps/splits to focus on specific segments

### Calendar View
- Weekly layout (Monday to Sunday)
- Activities displayed per day with name, type, distance, and duration
- Weekly summary showing total distance and time
- Navigate between multiple activities on the same day

### Settings
- **Language** - Switch between English and French
- **Theme** - Toggle between light and dark mode
- **Map Provider** - Choose between Leaflet (OpenStreetMap) or MapLibre GL JS

### StrAId (AI Assistant)
- Ask questions about your training in natural language
- Get personalized insights and recommendations
- Analyze patterns in your activity data
- Requires Ollama with Mistral model installed and running

### Trends
- View performance trends over time
- Analyze training load and progression
- Track key metrics evolution

## 🚀 Build for Production

```bash
# Create optimized production build
pnpm build

# Start production server
pnpm start
```

## ⚙️ Configuration

### User Preferences
Preferences are stored in localStorage and include:
- **Language** (`en` | `fr`)
- **Theme** (`light` | `dark`)
- **Map Provider** (`leaflet` | `maplibre`)

### Environment
The application uses Node.js with Corepack enabled. Ensure your PATH includes:
```bash
export PATH="/usr/share/nodejs/corepack/shims:$PATH"
```

## 📝 License

MIT

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

**Note**: This project requires a Stryd activities database (`stryd_activities.db`). The database structure should match the schema described above.
