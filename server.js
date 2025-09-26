const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
require('dotenv').config()
console.log("DEBUG MONGO_URI:", process.env.MONGO_URI); 
const app = express()
const PORT = process.env.PORT || 5001

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://healthcare-frontend-dun.vercel.app/' 
  ],
  credentials: true
}))
app.use(express.json({ limit: '10mb' }))

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})

// User Data Schema
const userDataSchema = new mongoose.Schema({
  practice: {
    name: { type: String, default: 'Your Practice' },
    tagline: { type: String, default: 'Your Tagline' },
    description: { type: String, default: 'Your Description' }
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
    yearsExperience: { type: String, default: '0' },
    patientsServed: { type: String, default: '0' },
    successRate: { type: String, default: '0' },
    doctorsCount: { type: String, default: '0' }
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
  team: [{
    id: String,
    name: String,
    title: String,
    specialty: String,
    credentials: [String],
    bio: String,
    specialties: [String],
    languages: [String]
  }],
  blogPosts: [{
    id: Number,
    title: String,
    slug: String,
    excerpt: String,
    content: String,
    publishDate: String,
    author: {
      name: String,
      id: String
    },
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
  ui: {
    homepage: {
      primaryButtonText: { type: String, default: 'Get Started' },
      primaryButtonLink: { type: String, default: '/contact' },
      secondaryButtonText: { type: String, default: 'Learn More' },
      secondaryButtonLink: { type: String, default: '/services' }
    },
    services: {
      consultationButtonText: { type: String, default: 'Schedule Consultation' },
      consultationAction: { type: String, default: 'phone' },
      customLink: String
    },
    blog: {
      readMoreText: { type: String, default: 'Read More' },
      linkTarget: { type: String, default: '_self' }
    },
    gallery: {
      viewAllText: { type: String, default: 'View Full Gallery' },
      viewAllLink: { type: String, default: '/gallery' }
    },
    navigation: {
      home: {
        text: { type: String, default: 'Home' },
        link: { type: String, default: '/' }
      },
      services: {
        text: { type: String, default: 'Services' },
        link: { type: String, default: '/services' }
      },
      blog: {
        text: { type: String, default: 'Blog' },
        link: { type: String, default: '/blog' }
      },
      contact: {
        text: { type: String, default: 'Contact' },
        link: { type: String, default: '/contact' }
      }
    }
  },
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
    const existingData = await UserData.findOne()
    if (!existingData) {
      const defaultData = new UserData({
        practice: {
          name: "Elite Medical Center",
          tagline: "Your Health, Our Priority",
          description: "Providing exceptional healthcare services with state-of-the-art technology."
        },
        contact: {
          phone: "+1 (555) 123-4567",
          whatsapp: "+1 (555) 123-4567",
          email: "info@elitemedicalcenter.com",
          address: {
            street: "123 Healthcare Blvd, Suite 200",
            city: "Austin",
            state: "TX",
            zip: "78701"
          }
        },
        hours: {
          weekdays: "Mon-Fri: 8:00 AM - 6:00 PM",
          saturday: "Sat: 9:00 AM - 2:00 PM",
          sunday: "Sun: Closed"
        },
        stats: {
          yearsExperience: "15",
          patientsServed: "5,000",
          successRate: "98",
          doctorsCount: "8"
        },
        services: [{
          id: "primary-care",
          title: "Primary Care",
          description: "Comprehensive healthcare services for all ages including annual checkups, preventive care, and chronic disease management.",
          icon: "user-md",
          price: "$150",
          duration: "45 minutes",
          features: [
            "Comprehensive health examination",
            "Preventive care screening", 
            "Chronic disease management",
            "Health education and counseling"
          ]
        }],
        blogPosts: [{
          id: 1,
          title: "10 Essential Health Tips for 2024",
          slug: "health-tips-2024",
          excerpt: "Discover the latest evidence-based strategies to maintain optimal health and prevent common illnesses.",
          content: "<h2>Introduction</h2><p>Maintaining good health requires a comprehensive approach...</p>",
          publishDate: "2024-03-15",
          author: { name: "Dr. Sarah Johnson" },
          category: "Health Tips",
          tags: ["health", "prevention", "wellness"],
          readTime: "5 min read",
          featured: true
        }],
        gallery: {
          facilityImages: [{
            url: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800",
            caption: "Modern Reception Area",
            description: "Our welcoming reception area designed for patient comfort"
          }],
          beforeAfterCases: [{
            title: "Complete Smile Makeover",
            treatment: "Dental Veneers & Whitening",
            duration: "6 weeks",
            description: "Patient received comprehensive cosmetic dental treatment including porcelain veneers.",
            beforeImage: "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=400",
            afterImage: "https://images.unsplash.com/photo-1609840114035-3c981b782dfe?w=400"
          }]
        },
        seo: {
          siteTitle: "Elite Medical Center - Comprehensive Healthcare Services",
          metaDescription: "Leading medical center providing comprehensive healthcare services with experienced doctors.",
          keywords: "medical center, healthcare, doctors"
        }
      })
      await defaultData.save()
      console.log('Default data initialized')
    }
  } catch (error) {
    console.error('Error initializing data:', error)
  }
}

// Routes
app.get('/api/user-data', async (req, res) => {
  try {
    const userData = await UserData.findOne()
    res.json(userData || {})
  } catch (error) {
    res.status(500).json({ message: 'Error fetching data', error: error.message })
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
  const authHeader = req.headers.authorization
  if (!authHeader) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  try {
    const userData = await UserData.findOne()
    res.json(userData || {})
  } catch (error) {
    res.status(500).json({ message: 'Error fetching data', error: error.message })
  }
})

app.post('/api/admin/data', async (req, res) => {
  const authHeader = req.headers.authorization
  if (!authHeader) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  try {
    const updatedData = { ...req.body, lastModified: new Date() }
    
    const userData = await UserData.findOneAndUpdate(
      {},
      updatedData,
      { upsert: true, new: true }
    )
    
    res.json({ 
      success: true, 
      message: 'Data saved successfully',
      timestamp: userData.lastModified
    })
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error saving data', 
      error: error.message 
    })
  }
})

app.get('/health', (req, res) => {
  res.json({ status: 'Backend is running', timestamp: new Date() })
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app