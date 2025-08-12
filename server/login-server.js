const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Mock user database with role-based access
const users = {
  'ahmed': {
    password: 'ahmed',
    role: 'admin',
    permissions: ['all'] // Full access
  },
  'hussein': {
    password: 'hussein', 
    role: 'technician',
    permissions: ['live_readings', 'alerts_monitoring', 'reports', 'maintenance'] // All except Settings
  },
  'bashar': {
    password: 'bashar',
    role: 'operator', 
    permissions: ['live_readings', 'alerts_monitoring', 'reports'] // All except Maintenance and Settings
  }
};

// Login endpoint
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Validate request body
  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: 'Username and password are required'
    });
  }

  // Check if user exists and password matches
  const user = users[username.toLowerCase()];
  if (!user || user.password !== password) {
    return res.status(401).json({
      success: false,
      message: 'Invalid username or password'
    });
  }

  // Generate a simple JWT-like token (for demo purposes)
  const token = Buffer.from(JSON.stringify({
    username: username,
    role: user.role,
    permissions: user.permissions,
    exp: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
  })).toString('base64');

  // Successful login
  res.json({
    success: true,
    message: 'Login successful',
    data: {
      token: token,
      user: {
        username: username,
        role: user.role,
        permissions: user.permissions
      }
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`Login API server running on http://localhost:${PORT}`);
  console.log('Available endpoints:');
  console.log('  POST /login - User authentication');
  console.log('  GET /health - Health check');
  console.log('\nTest users:');
  Object.entries(users).forEach(([username, user]) => {
    console.log(`  ${username}/${user.password} - ${user.role} (${user.permissions.join(', ')})`);
  });
});

module.exports = app;
