# Replica View Studio - Silo Monitoring System

## 🏭 Project Overview

**Replica View Studio** is an advanced industrial silo monitoring and visualization system that provides real-time sensor data display and interactive control interfaces for silo management operations.

### 🌟 Key Features

- **Real-time Sensor Monitoring**: Live temperature readings from 8 sensor positions (S1-S8)
- **Interactive 3D Cylinder Visualization**: Dynamic cylindrical display showing sensor data
- **Hover Tooltips**: Detailed information display on silo interaction
- **Selection-based Control**: Click to select and monitor specific silos
- **Responsive Design**: Optimized for desktop and mobile interfaces
- **Performance Optimized**: React.memo implementation for smooth interactions

## 👨‍💻 Developer Information

**Developer:** Eng. Bashar Zabadani  
**Project:** Replica View Studio  
**Technology Stack:** React, TypeScript, Vite, Tailwind CSS, shadcn/ui

## 🚀 Live Demo

**Production Site:** https://replica-view-studio.netlify.app

## 🛠️ Technology Stack

### Frontend Framework
- **React 18** - Modern UI library with hooks and functional components
- **TypeScript** - Type-safe development with enhanced IDE support
- **Vite** - Fast build tool and development server

### UI/UX Components
- **Tailwind CSS** - Utility-first CSS framework for rapid styling
- **shadcn/ui** - High-quality React components built on Radix UI
- **Radix UI** - Accessible component primitives

### Development Tools
- **ESLint** - Code linting and quality assurance
- **Playwright** - End-to-end testing framework
- **PostCSS** - CSS processing and optimization

## 📁 Project Structure

```
replica-view-studio/
├── src/
│   ├── components/
│   │   ├── LabCylinder.tsx      # 3D cylinder visualization
│   │   ├── LabInterface.tsx      # Main interface component
│   │   ├── LabCircle.tsx         # Circular silo representations
│   │   ├── LabGroup.tsx          # Grouped silo components
│   │   └── LabNumberSquare.tsx   # Numbered square components
│   ├── hooks/
│   │   ├── useSiloSystem.ts      # Core silo state management
│   │   └── use-mobile.tsx        # Mobile responsiveness hook
│   ├── services/
│   │   └── siloData.ts           # Silo data and sensor logic
│   ├── types/
│   │   └── silo.ts               # TypeScript type definitions
│   └── pages/
│       ├── Index.tsx             # Main application page
│       └── NotFound.tsx          # 404 error page
├── public/                       # Static assets
├── tests/                        # Playwright test files
└── netlify.toml                 # Netlify deployment configuration
```

## 🎯 Core Features Explained

### 1. Silo Monitoring System
- **8 Sensor Positions**: S1 through S8 with temperature readings
- **Real-time Updates**: Dynamic sensor data visualization
- **Selection Control**: Click to select and monitor specific silos

### 2. Interactive Cylinder Display
- **3D Visualization**: Cylindrical representation of silo data
- **Sensor Readings**: Temperature values displayed in organized columns
- **Hover Isolation**: Stable readings that only change on selection (not hover)

### 3. Performance Optimizations
- **React.memo**: Prevents unnecessary re-renders
- **Component Isolation**: Cylinder component isolated from hover state
- **Debug Logging**: Console logs for performance monitoring

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager

### Installation

```bash
# Clone the repository
git clone https://github.com/basharagb/replica-view-studio.git

# Navigate to project directory
cd replica-view-studio

# Install dependencies
npm install

# Start development server
npm run dev
```

### Available Scripts

```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm run test

# Lint code
npm run lint
```

## 🌐 Deployment

### Netlify Deployment
The project is configured for automatic deployment on Netlify:

1. **Build Command**: `npm run build`
2. **Publish Directory**: `dist`
3. **Node Version**: 18.x

### Manual Deployment
```bash
# Build the project
npm run build

# Deploy to Netlify
netlify deploy --prod
```

## 🧪 Testing

### Playwright Tests
```bash
# Run tests
npm run test

# Run tests with UI
npm run test:ui

# Generate test report
npm run test:report
```

## 📊 Performance Features

### React.memo Implementation
- **LabCylinder Component**: Wrapped with React.memo for performance
- **Stable Props**: Only re-renders when selectedSilo or readingSilo change
- **Hover Isolation**: Complete separation from hover state

### Debug Logging
- **Console Logs**: Track component re-renders
- **Performance Monitoring**: Identify unnecessary updates
- **State Tracking**: Monitor prop changes

## 🔧 Configuration Files

### Vite Configuration (`vite.config.ts`)
- Base path configuration for deployment
- Build optimization settings
- Development server configuration

### Netlify Configuration (`netlify.toml`)
- Build settings for Netlify deployment
- Redirect rules for SPA routing
- Environment configuration

### Tailwind Configuration (`tailwind.config.ts`)
- Custom color schemes
- Component styling
- Responsive design breakpoints

## 🎨 UI/UX Design

### Color Scheme
- **Primary**: Modern blue gradients
- **Secondary**: Neutral grays and whites
- **Accent**: Highlight colors for interactive elements

### Responsive Design
- **Desktop**: Full-featured interface
- **Mobile**: Optimized touch interactions
- **Tablet**: Adaptive layout scaling

## 🔍 Troubleshooting

### Common Issues

1. **White Screen on Deploy**
   - Check base path configuration in `vite.config.ts`
   - Verify redirect rules in `netlify.toml`

2. **Component Re-rendering Issues**
   - Check React.memo implementation
   - Verify prop stability
   - Monitor console logs for debugging

3. **Build Failures**
   - Ensure all dependencies are installed
   - Check TypeScript compilation errors
   - Verify Node.js version compatibility

## 📈 Future Enhancements

### Planned Features
- **Real-time Data Integration**: Connect to actual sensor systems
- **Historical Data**: Time-series data visualization
- **Alert System**: Temperature threshold notifications
- **Multi-silo Support**: Expand to multiple silo monitoring
- **Mobile App**: Native mobile application

### Technical Improvements
- **WebSocket Integration**: Real-time data streaming
- **Database Integration**: Persistent data storage
- **Authentication**: User management system
- **API Development**: RESTful API for data access

## 📄 License

This project is developed by Eng. Bashar Zabadani for industrial silo monitoring applications.

## 🤝 Contributing

For contributions or questions, please contact:
- **Developer**: Eng. Bashar Zabadani
- **Email**: basharagb@gmail.com
- **GitHub**: https://github.com/basharagb

---

**Last Updated**: January 2025  
**Version**: 1.0.0  
**Status**: Production Ready ✅
