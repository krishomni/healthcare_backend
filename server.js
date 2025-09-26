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
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB Error:', err))

// Schema
const userDataSchema = new mongoose.Schema({
  practice: {
    name: String,
    tagline: String,
    description: String
  },
  contact: {
    phone: String,
    whatsapp: String,
    email: String,
    address: {
      street: String,
      city: String,
      state: String,
      zip: String
    }
  },
  hours: {
    weekdays: String,
    saturday: String,
    sunday: String
  },
  stats: {
    yearsExperience: String,
    patientsServed: String,
    successRate: String,
    doctorsCount: String
  },
  services: [mongoose.Schema.Types.Mixed],
  blogPosts: [mongoose.Schema.Types.Mixed],
  gallery: {
    facilityImages: [mongoose.Schema.Types.Mixed],
    beforeAfterCases: [mongoose.Schema.Types.Mixed]
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

// Initialize default data
const initializeData = async () => {
  try {
    const count = await UserData.countDocuments()
    if (count === 0) {
      const defaultData = new UserData({
        practice: {
          name: "Elite Medical Center",
          tagline: "Your Health, Our Priority",
          description: "Providing exceptional healthcare services."
        },
        contact: {
          phone: "+1 (555) 123-4567",
          email: "info@elitemedicalcenter.com",
          address: {
            street: "123 Healthcare Blvd",
            city: "Austin",
            state: "TX",
            zip: "78701"
          }
        },
        stats: {
          yearsExperience: "15",
          patientsServed: "5,000",
          successRate: "98",
          doctorsCount: "8"
        },
        gallery: { facilityImages: [], beforeAfterCases: [] },
        ui: {
          homepage: {
            primaryButtonText: "Get Started",
            primaryButtonLink: "/contact",
            secondaryButtonText: "Learn More",
            secondaryButtonLink: "/services"
          },
          services: {
            consultationButtonText: "Schedule Consultation",
            consultationAction: "phone"
          },
          blog: { readMoreText: "Read More", linkTarget: "_self" },
          navigation: {
            home: { text: "Home", link: "/" },
            services: { text: "Services", link: "/services" },
            blog: { text: "Blog", link: "/blog" },
            contact: { text: "Contact", link: "/contact" }
          }
        }
      })
      await defaultData.save()
      console.log('Default data initialized')
    }
  } catch (error) {
    console.error('Init error:', error)
  }
}

// Routes
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() })
})

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
    const token = Buffer.from(`${username}:${Date.now()}`).toString('base64')
    res.json({ success: true, token })
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' })
  }
})

app.get('/api/admin/data', async (req, res) => {
  if (!req.headers.authorization) {
    return res.status(401).json({ message: 'Unauthorized' })
  }
  try {
    const data = await UserData.findOne()
    res.json(data || {})
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.post('/api/admin/data', async (req, res) => {
  if (!req.headers.authorization) {
    return res.status(401).json({ message: 'Unauthorized' })
  }
  try {
    const updatedData = { ...req.body, lastModified: new Date() }
    await UserData.findOneAndUpdate({}, updatedData, { upsert: true })
    res.json({ success: true, message: 'Data saved' })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`)
  await initializeData()
})