const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
require('dotenv').config()

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://healthcare-frontend-dun.vercel.app', 
    process.env.FRONTEND_URL
  ],
  credentials: true
}))
app.use(express.json({ limit: '10mb' }))

app.get('/', (req, res) => {
  res.json({ 
    status: 'Healthcare Backend API is running',
    timestamp: new Date(),
    endpoints: [
      'GET /health',
      'GET /api/user-data',
      'POST /api/admin/login',
      'GET /api/admin/data',
      'POST /api/admin/data'
    ]
  })
})

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB')
}).catch((err) => {
  console.error('MongoDB connection error:', err)
})

// Schema
const userDataSchema = new mongoose.Schema({
  practice: { name: String, tagline: String, description: String },
  contact: {
    phone: String,
    whatsapp: String,
    email: String,
    address: { street: String, city: String, state: String, zip: String }
  },
  hours: { weekdays: String, saturday: String, sunday: String },
  stats: {
    yearsExperience: String,
    patientsServed: String,
    successRate: String,
    doctorsCount: String
  },
  services: [{
    id: String,
    title: String,
    description: String,
    icon: String,
    price: String,
    duration: String,
    features: [String]
  }],
  blogPosts: [{
    id: Number,
    title: String,
    slug: String,
    excerpt: String,
    content: String,
    publishDate: String,
    author: { name: String, id: String },
    category: String,
    tags: [String],
    readTime: String,
    featured: Boolean
  }],
  gallery: {
    facilityImages: [{
      url: String,
      caption: String,
      description: String
    }],
    beforeAfterCases: [{
      title: String,
      treatment: String,
      duration: String,
      description: String,
      beforeImage: String,
      afterImage: String
    }]
  },
  ui: mongoose.Schema.Types.Mixed,
  seo: {
    siteTitle: String,
    metaDescription: String,
    keywords: String
  },
  lastModified: { type: Date, default: Date.now }
})

const UserData = mongoose.model('UserData', userDataSchema)

// Initialize with default data
const initializeData = async () => {
  try {
    const count = await UserData.countDocuments()
    if (count === 0) {
      await UserData.create({
        practice: {
          name: "Elite Medical Center",
          tagline: "Your Health, Our Priority",
          description: "Providing exceptional healthcare services."
        },
        contact: {
          phone: "+1 (555) 123-4567",
          email: "info@elitemedicalcenter.com",
          address: { street: "123 Healthcare Blvd", city: "Austin", state: "TX", zip: "78701" }
        },
        stats: { yearsExperience: "15", patientsServed: "5,000", successRate: "98", doctorsCount: "8" },
        services: [],
        blogPosts: [],
        gallery: { facilityImages: [], beforeAfterCases: [] }
      })
      console.log('Default data initialized')
    }
  } catch (error) {
    console.error('Init error:', error)
  }
}

// Routes
app.get('/api/user-data', async (req, res) => {
  try {
    const data = await UserData.findOne()
    res.json(data || {})
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body
  if (username === 'admin' && password === 'password123') {
    res.json({ success: true, token: Buffer.from(`${username}:${Date.now()}`).toString('base64') })
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' })
  }
})

app.get('/api/admin/data', async (req, res) => {
  if (!req.headers.authorization) return res.status(401).json({ message: 'Unauthorized' })
  try {
    const data = await UserData.findOne()
    res.json(data || {})
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.post('/api/admin/data', async (req, res) => {
  if (!req.headers.authorization) return res.status(401).json({ message: 'Unauthorized' })
  try {
    req.body.lastModified = new Date()
    const data = await UserData.findOneAndUpdate({}, req.body, { upsert: true, new: true })
    res.json({ success: true, timestamp: data.lastModified })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() })
})

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`)
  await initializeData()
})