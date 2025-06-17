# Sales Chat Assistant

A specialized AI-powered sales assistant built with [assistant-ui](https://www.assistant-ui.com/), Next.js, and Claude. This application provides intelligent customer support for auto parts sales, delivery tracking, and vehicle fleet management with real-time data integration.

## ✨ Features

- **🚗 Auto Parts Database**: Query auto parts inventory from MySQL database
- **📦 Delivery Tracking**: Real-time delivery status via Detrack API integration
- **🚛 Vehicle Fleet Tracking**: Live GPS tracking of delivery vehicles with Google Maps
- **🤖 AI-Powered Chat**: Natural language interface for customer inquiries
- **⚡ Real-time Streaming**: Live streaming responses from OpenAI
- **🎨 Beautiful UI**: Modern design with custom tool visualizations
- **📱 Responsive Design**: Perfect on desktop and mobile
- **🔍 Rich Tool Display**: Visual feedback for database queries and tracking results

## 🚀 Quick Start

1. **Clone the repository**:
   ```bash
   git clone <your-repo-url>
   cd sales_chat/frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.example .env.local
   ```
   
   Add your API keys to `.env.local`:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   DETRACK_API_KEY=your_detrack_api_key_here
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```

5. **Open your browser** to [http://localhost:3000](http://localhost:3000)

## 🛠️ Available Tools

The sales assistant comes with specialized business tools:

### 🗄️ Auto Parts Database Query
Search and retrieve auto parts information from the MySQL database
```
"Find brake pads for Toyota Camry 2018"
"Show me all oil filters in stock"
"What's the price for part number ABC123?"
```

### 📦 Delivery Tracking
Track customer deliveries using Detrack API integration
```
"Track delivery order DO-12345"
"What's the status of my delivery?"
"Show me proof of delivery for order 67890"
```

### 🚛 Vehicle Fleet Tracking
Monitor delivery vehicles with real-time GPS tracking and Google Maps
```
"Where is driver Anthony right now?"
"Track vehicle fleet status"
"Show me the location of delivery truck 5"
```

## 📡 API Integrations

### Detrack API
- **Delivery Tracking**: Real-time delivery status and proof of delivery
- **Vehicle Tracking**: Live GPS coordinates and vehicle metrics
- **Features**: Photos, signatures, delivery history, battery levels, speed monitoring

### Google Maps API
- **Embedded Maps**: Vehicle location visualization
- **External Links**: Direct Google Maps navigation
- **Requirements**: Google Cloud Console setup with Maps Embed API

## 📁 Project Structure

```
frontend/
├── app/
│   ├── api/chat/route.ts        # Chat API with OpenAI integration
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Main chat interface
├── components/
│   ├── assistant-ui/
│   │   ├── thread.tsx           # Chat interface
│   │   ├── track-delivery-fallback.tsx    # Delivery tracking UI
│   │   ├── track-vehicle-fallback.tsx     # Vehicle tracking UI
│   │   └── markdown-text.tsx    # Message rendering
│   ├── ui/                      # shadcn/ui components
│   └── MyAssistant.tsx          # Main assistant wrapper
├── lib/
│   ├── tools.ts                 # Business tool definitions
│   └── utils.ts                 # Utility functions
└── .env.local                   # Environment variables
```

## 🎨 Tool Visualizations

### Delivery Tracking Display
- **Status Indicators**: Color-coded delivery status
- **Proof of Delivery**: Photo gallery and signature display
- **Delivery Details**: Recipient, address, ETA information
- **Modal Views**: Full-size image viewing

### Vehicle Tracking Display
- **Live Location**: Embedded Google Maps with vehicle position
- **Vehicle Metrics**: Battery level, speed, connection status
- **Fleet Overview**: Multiple vehicle tracking support
- **Interactive Maps**: Click to open full Google Maps

### Database Query Results
- **Structured Data**: Clean table display of auto parts
- **Result Limiting**: Maximum 20 results for performance
- **Field Information**: Column names and data types
- **Error Handling**: Clear error messages for failed queries

## 🚀 Deployment

Deploy to any platform supporting Next.js:

### Vercel (Recommended)
```bash
npx vercel deploy
```

### Railway
```bash
railway login && railway deploy
```

## 🔐 Security Features

- **SQL Injection Protection**: Only SELECT queries allowed
- **API Key Security**: Environment variable protection
- **Database Access**: Read-only database user
- **Result Limiting**: Maximum 20 rows per query
- **Error Sanitization**: Safe error message display

## 🔧 Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **UI**: assistant-ui, Tailwind CSS, shadcn/ui  
- **AI**: OpenAI API via AI SDK by Vercel
- **Database**: MySQL with mysql2 driver
- **APIs**: Detrack API, Google Maps Embed API
- **Tools**: Custom tool system with Zod validation

## 📚 API Documentation

- [Detrack API Documentation](https://www.detrack.com/api-documentation/)
- [Google Maps Embed API](https://developers.google.com/maps/documentation/embed)
- [assistant-ui Documentation](https://www.assistant-ui.com/docs)
- [AI SDK Documentation](https://sdk.vercel.ai/docs)

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.
