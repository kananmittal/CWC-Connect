# CWC Connect - Visitor Enquiry System

CWC Connect is a web application designed to reduce reception workload at the Central Water Commission (CWC) office by providing visitors with an intelligent enquiry agent. The system helps visitors search for employee information and browse the organizational structure.

## 🎯 Purpose

This application serves as an automated enquiry agent for CWC office visitors, allowing them to:
- Search for employees by name, designation, or department
- Browse the organizational hierarchy
- Access contact information and office locations
- Reduce load on reception staff

## 🏗️ Architecture

### Frontend (Next.js)
- **Port**: 3000
- **Framework**: Next.js 15 with React 18
- **Styling**: Tailwind CSS
- **Components**: 
  - Main page with logo and search interface
  - Hamburger menu with organizational hierarchy
  - Responsive search bar with real-time feedback

### Backend (Node.js/Express)
- **Port**: 5001
- **Database**: MongoDB (Employee data sync)
- **AI Integration**: Ollama/Llama3 (optional, with fallback)
- **API Endpoints**:
  - `/api/health` - Server health check
  - `/api/chatbot` - Employee search and query processing
  - `/api/employees` - Employee data management

### Key Features
- **Graceful Degradation**: Works even when database or AI services are unavailable
- **Real-time Search**: Instant employee lookup with intelligent matching
- **Organizational Browser**: Interactive hierarchy navigation
- **Responsive Design**: Works on desktop and mobile devices

## 🚀 Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (optional - app works without it)
- Ollama/Llama3 (optional - for enhanced responses)

### 1. Backend Setup
```bash
cd backend
npm install
```

Create `.env` file in backend directory:
```env
MONGO_URI=mongodb://localhost:27017/cwc-connect
PORT=5001
NODE_ENV=development
```

Start the backend:
```bash
npm start
# or for development with auto-restart:
npm run dev
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 3. Access the Application
- **Frontend**: http://localhost:3000
- **Backend Health Check**: http://localhost:5001/api/health

## 📊 Application Flow

1. **Visitor arrives** → Opens CWC Connect on a tablet/kiosk
2. **Search Query** → Types employee name, designation, or department
3. **Backend Processing**:
   - Extracts entities from query
   - Searches MongoDB for matching employees
   - Optionally enhances response with Llama3
   - Returns formatted employee information
4. **Results Display** → Shows employee details, contact info, and location
5. **Organizational Browse** → Can explore hierarchy via hamburger menu

## 🛠️ Technical Implementation

### Search Algorithm
- **Entity Extraction**: Identifies names, departments, and designations
- **Multi-field Search**: Searches across employee name, designation, department, and organizational unit
- **Fuzzy Matching**: Uses case-insensitive regex patterns
- **Duplicate Removal**: Ensures unique results

### Error Handling
- **Database Unavailable**: Graceful fallback with helpful messaging
- **Network Issues**: Clear error messages with troubleshooting suggestions
- **AI Service Down**: Direct database responses without AI enhancement

### Database Schema
```javascript
{
  OrganisationUnit: String,
  EmpName: String,
  Designation: String,
  Email: String,
  Floor: String,
  RoomNo: String,
  Landline: String,
  Department: String,
  Unit: String,
  Mobile: String (private, not exposed)
}
```

## 🔧 Configuration

### Backend Configuration
- **CORS**: Configured for frontend communication
- **MongoDB**: Auto-reconnection with graceful fallback
- **Employee Sync**: Automatic data synchronization from e-office API
- **Port Configuration**: Environment-based port setting

### Frontend Configuration
- **API Endpoint**: Configurable backend URL
- **Responsive Design**: Mobile-first approach
- **Error Boundaries**: Comprehensive error handling
- **Accessibility**: Screen reader friendly with proper ARIA labels

## 📱 User Interface

### Main Page
- **Header**: CWC Connect branding with hamburger menu
- **Logo**: Semi-transparent central logo (20% opacity)
- **Search Bar**: Bottom-positioned search interface
- **Status Indicators**: Database connectivity and search results

### Hamburger Menu
- **Organizational Structure**: Collapsible tree view
- **Search Filter**: Real-time filtering of positions
- **Responsive**: Overlay with backdrop click to close

## 🔄 Development Workflow

### Running in Development
```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend  
cd frontend && npm run dev
```

### Testing the System
```bash
# Test backend health
curl http://localhost:5001/api/health

# Test search functionality
curl -X POST http://localhost:5001/api/chatbot \
  -H "Content-Type: application/json" \
  -d '{"message":"who is the director of hydrology"}'
```

## 🚨 Troubleshooting

### Common Issues

1. **"Search Failed" Error**
   - Check if backend is running on port 5001
   - Verify network connectivity
   - Check browser console for detailed errors

2. **Database Not Connected**
   - MongoDB not running or not accessible
   - App continues to work with organizational structure
   - Check MongoDB connection string in .env

3. **Port Conflicts**
   - Frontend default: 3000
   - Backend default: 5001
   - Change ports in respective configurations if needed

### Status Indicators
- **Green Dot**: Database connected, full functionality
- **Yellow Dot**: Limited mode, organizational structure only
- **Red Error**: Server connectivity issues

## 🔮 Future Enhancements

- **Multi-language Support**: Hindi and English interface
- **Voice Search**: Speech-to-text functionality
- **QR Code Integration**: Quick access for mobile devices
- **Analytics Dashboard**: Usage statistics and popular queries
- **Push Notifications**: Updates on employee changes
- **Advanced AI**: Natural language understanding improvements

## 📞 Support

For technical support or feature requests, please contact the development team or create an issue in the project repository.

---

**CWC Connect** - Making visitor interactions more efficient and self-service friendly. 