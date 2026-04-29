const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const bcrypt = require("bcryptjs");

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

// MongoDB connection
const https = require('https');
const crypto = require('crypto');
const start = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/pet_Care");
    console.log("✅ MongoDB Connected");

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

// ========== PAYMENT (Stub) ROUTES ==========
// These stubs let frontend proceed without Razorpay SDK on the server.
// If you add Razorpay later, replace logic here accordingly.

// Create order (stub returns a pseudo order)
app.post("/api/payments/create-order", async (req, res) => {
  try {
    const { amount = 0, currency = "INR", bookingId, receipt } = req.body || {};
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) {
      return res.status(400).json({ message: "Razorpay keys not configured" });
    }

    const payload = JSON.stringify({
      amount: Math.max(1, Number(amount)),
      currency: currency || "INR",
      receipt: receipt || `booking_${bookingId || Date.now()}`,
      payment_capture: 1
    });

    const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
    const options = {
      hostname: 'api.razorpay.com',
      path: '/v1/orders',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
        'Authorization': `Basic ${auth}`
      }
    };

    const order = await new Promise((resolve, reject) => {
      const rq = https.request(options, (rp) => {
        let data = '';
        rp.on('data', (chunk) => data += chunk);
        rp.on('end', () => {
          try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
        });
      });
      rq.on('error', reject);
      rq.write(payload);
      rq.end();
    });

    if (bookingId && order?.id) {
      await Booking.findByIdAndUpdate(bookingId, { paymentOrderId: order.id, paymentProvider: "razorpay" });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Verify payment (stub marks booking as paid)
app.post("/api/payments/verify", async (req, res) => {
  try {
    const { bookingId, razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body || {};
    if (!bookingId || !razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return res.status(400).json({ message: "bookingId, payment_id, order_id, signature required" });
    }
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) return res.status(400).json({ message: "Razorpay keys not configured" });

    const hmac = crypto.createHmac('sha256', keySecret);
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const expected = hmac.digest('hex');
    const valid = expected === razorpay_signature;
    if (!valid) return res.status(400).json({ message: "Invalid payment signature" });

    const updated = await Booking.findByIdAndUpdate(
      bookingId,
      {
        paymentStatus: "paid",
        paymentId: razorpay_payment_id,
        paymentOrderId: razorpay_order_id,
        paymentSignature: razorpay_signature,
        adminSeen: false
      },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Booking not found" });
    res.json({ message: "Payment verified", booking: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ========== ADMIN ROUTES ==========

// Seed an admin account (idempotent by email)
app.post("/api/admin/seed", async (req, res) => {
  try {
    const { fullName = "Admin", email = "admin@petcare.com", password = "admin123", mobile = "9999999999" } = req.body || {};
    let admin = await User.findOne({ email });
    if (!admin) {
      const hashedPassword = await bcrypt.hash(password, 10);
      admin = await new User({ fullName, email, password: hashedPassword, mobile, role: "admin" }).save();
    } else if (admin.role !== "admin") {
      admin.role = "admin";
      await admin.save();
    }
    res.json({ message: "Admin ensured", admin: { id: admin._id, email: admin.email } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Convenience GET route to allow seeding from the browser
app.get("/api/admin/seed", async (_req, res) => {
  try {
    const email = "admin@petcare.com";
    let admin = await User.findOne({ email });
    if (!admin) {
      const hashedPassword = await bcrypt.hash("admin123", 10);
      admin = await new User({ fullName: "Admin", email, password: hashedPassword, mobile: "9999999999", role: "admin" }).save();
    } else if (admin.role !== "admin") {
      admin.role = "admin";
      await admin.save();
    }
    res.json({ message: "Admin ensured via GET", admin: { id: admin._id, email: admin.email } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all bookings (admin)
app.get("/api/admin/bookings", async (_req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('userId', 'fullName email')
      .populate('petId', 'petName')
      .populate('trainingId', 'title price')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update booking status (admin)
app.patch("/api/admin/bookings/:id/status", async (req, res) => {
  try {
    const { status } = req.body || {};
    const updated = await Booking.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!updated) return res.status(404).json({ message: "Booking not found" });
    res.json({ message: "Status updated", booking: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update payment status (admin)
app.patch("/api/admin/bookings/:id/payment", async (req, res) => {
  try {
    const { paymentStatus } = req.body || {};
    const updated = await Booking.findByIdAndUpdate(req.params.id, { paymentStatus }, { new: true });
    if (!updated) return res.status(404).json({ message: "Booking not found" });
    res.json({ message: "Payment status updated", booking: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mark booking as seen by admin
app.patch("/api/admin/bookings/:id/seen", async (req, res) => {
  try {
    const updated = await Booking.findByIdAndUpdate(req.params.id, { adminSeen: true }, { new: true });
    if (!updated) return res.status(404).json({ message: "Booking not found" });
    res.json({ message: "Marked as seen", booking: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin notifications (new bookings not yet seen)
app.get("/api/admin/notifications", async (_req, res) => {
  try {
    const unseen = await Booking.find({ adminSeen: false }).select('_id serviceType bookingDate createdAt');
    res.json({ count: unseen.length, items: unseen });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  }
};
start();

// ========== MODELS ==========

// User Schema
const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  mobile: { type: String, required: true },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  createdAt: { type: Date, default: Date.now }
});
const User = mongoose.model("User", userSchema);

// Pet Schema
const petSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  petName: { type: String, required: true },
  petType: { type: String, required: true }, // Dog, Cat, Bird, etc.
  breed: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { type: String, required: true }, // Male, Female
  // Vaccination records (optional)
  lastVaccinationDate: { type: Date },
  lastVaccineName: { type: String },
  nextVaccinationDate: { type: Date },
  nextVaccineName: { type: String },
  createdAt: { type: Date, default: Date.now }
});
const Pet = mongoose.model("Pet", petSchema);

// Training Schema
const trainingSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  videoUrl: { type: String, required: true },
  duration: { type: String, required: true },
  difficulty: { type: String, required: true }, // Beginner, Intermediate, Advanced
  price: { type: Number, required: true },
  image: { type: String, required: true },
  sessions: [
    {
      date: { type: Date, required: true },
      title: { type: String, default: "Online Session" },
      url: { type: String, default: "" },
    },
  ],
  createdAt: { type: Date, default: Date.now }
});
const Training = mongoose.model("Training", trainingSchema);

// Booking Schema
const bookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  petId: { type: mongoose.Schema.Types.ObjectId, ref: "Pet", required: false },
  // trainingId is optional when booking a general service
  trainingId: { type: mongoose.Schema.Types.ObjectId, ref: "Training", required: false },
  // serviceType is used for non-training bookings (e.g., grooming, boarding, etc.)
  serviceType: { type: String, required: false },
  // Optional booking time string from client (e.g., "10:30")
  bookingTime: { type: String },
  // Contact details captured from the booking form
  contact: {
    name: { type: String },
    email: { type: String },
    phone: { type: String },
  },
  // service-specific extra details (free-form JSON)
  details: { type: mongoose.Schema.Types.Mixed },
  bookingDate: { type: Date, required: true },
  amount: { type: Number, default: 0 },
  status: { type: String, default: "Confirmed" }, // Confirmed, Completed, Cancelled
  paymentStatus: { type: String, enum: ["pending", "paid", "failed", "skipped"], default: "pending" },
  paymentProvider: { type: String },
  paymentOrderId: { type: String },
  paymentId: { type: String },
  paymentSignature: { type: String },
  adminSeen: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});
const Booking = mongoose.model("Booking", bookingSchema);

// Adoption Schema
const adoptionSchema = new mongoose.Schema({
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  petName: { type: String, required: true },
  breed: { type: String, required: true },
  age: { type: Number, required: true },
  price: { type: Number, required: true },
  location: { type: String, required: true },
  contact: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, default: "" },
  status: { type: String, default: "Available" }, // Available, Sold
  createdAt: { type: Date, default: Date.now }
});
const Adoption = mongoose.model("Adoption", adoptionSchema);

// CommunityPost Schema
const communityPostSchema = new mongoose.Schema({
  userName: { type: String, required: true },
  imageUrl: { type: String, required: true },
  description: { type: String, required: true },
  contact: { type: String, required: true }, // email or any contact text
  mobile: { type: String, required: true },  // explicit mobile number
  petName: { type: String, required: true },
  petType: { type: String, required: true }, // Dog, Cat, etc.
  seenLocation: { type: String, required: true }, // where the pet was seen
  createdAt: { type: Date, default: Date.now },
});
const CommunityPost = mongoose.model("CommunityPost", communityPostSchema);

// TrainingResource Schema
const trainingResourceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  emoji: { type: String },
  description: { type: String, required: true },
  link: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});
const TrainingResource = mongoose.model("TrainingResource", trainingResourceSchema);

// ========== AUTH ROUTES ==========

// Signup Route
app.post("/api/auth/signup", async (req, res) => {
  try {
    const { fullName, email, password, mobile, petName, petType, breed, age, gender, role, adminCode } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

 

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    let newRole = "user";
    if (role === "admin" && adminCode && adminCode === (process.env.ADMIN_CODE || "")) {
      newRole = "admin";
    }
    const newUser = new User({ fullName, email, password: hashedPassword, mobile, role: newRole });
    const savedUser = await newUser.save();

    // Create pet if details provided
    if (petName && petType && breed && age && gender) {
      const newPet = new Pet({
        userId: savedUser._id,
        petName,
        petType,
        breed,
        age: parseInt(age),
        gender
      });
      await newPet.save();
    }

    res.status(201).json({ 
      message: "Signup successful", 
      user: { id: savedUser._id, fullName: savedUser.fullName, email: savedUser.email, role: savedUser.role }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ========== VACCINATION ROUTES ==========

// Get vaccination records for all pets of a user
app.get("/api/pets/vaccinations/:userId", async (req, res) => {
  try {
    const pets = await Pet.find({ userId: req.params.userId }).select(
      "petName lastVaccinationDate lastVaccineName nextVaccinationDate nextVaccineName"
    );
    res.json(pets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update vaccination records for a specific pet
app.put("/api/pets/:petId/vaccination", async (req, res) => {
  try {
    const { lastVaccinationDate, lastVaccineName, nextVaccinationDate, nextVaccineName } = req.body;
    const updated = await Pet.findByIdAndUpdate(
      req.params.petId,
      { lastVaccinationDate, lastVaccineName, nextVaccinationDate, nextVaccineName },
      { new: true }
    ).select("petName lastVaccinationDate lastVaccineName nextVaccinationDate nextVaccineName");
    if (!updated) return res.status(404).json({ message: "Pet not found" });
    res.json({ message: "Vaccination record updated", pet: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Login Route
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check user
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    // Get user's pets
    const pets = await Pet.find({ userId: user._id });

    res.json({ 
      message: "Login successful",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        mobile: user.mobile,
        role: user.role
      },
      pets
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ========== PET ROUTES ==========

// Add Pet
app.post("/api/pets/add", async (req, res) => {
  try {
    const { userId, petName, petType, breed, age, gender } = req.body;
    
    const newPet = new Pet({
      userId,
      petName,
      petType,
      breed,
      age: parseInt(age),
      gender
    });
    
    const savedPet = await newPet.save();
    res.status(201).json({ message: "Pet added successfully", pet: savedPet });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get User's Pets
app.get("/api/pets/:userId", async (req, res) => {
  try {
    const pets = await Pet.find({ userId: req.params.userId });
    res.json(pets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ========== TRAINING ROUTES ==========

// Seed Training Data (Run once)
app.post("/api/trainings/seed", async (req, res) => {
  try {
    const existingTrainings = await Training.countDocuments();
    // Utility to generate upcoming session dates (next 3 weekends)
    const upcoming = () => {
      const out = [];
      const now = new Date();
      for (let i = 1; i <= 3; i++) {
        const d = new Date(now);
        d.setDate(now.getDate() + i * 7);
        d.setHours(10, 0, 0, 0);
        out.push({ date: d, title: "Online Session", url: "" });
      }
      return out;
    };

    const sampleTrainings = [
      {
        title: "Basic Obedience Training",
        description: "Learn fundamental commands like sit, stay, come, and down. Perfect for puppies and new dog owners.",
        videoUrl: "https://www.youtube.com/embed/4dbzPoB7AKE",
        duration: "4 weeks",
        difficulty: "Beginner",
        price: 150,
        image: "/images/basic-obedience.jpg",
        sessions: upcoming()
      },
      {
        title: "Advanced Agility Training",
        description: "High-level agility training including jumps, tunnels, and complex obstacle courses.",
        videoUrl: "https://www.youtube.com/embed/8m2oGWQbscc",
        duration: "8 weeks",
        difficulty: "Advanced",
        price: 300,
        image: "/images/agility-training.jpg",
        sessions: upcoming()
      },
      {
        title: "Puppy Socialization",
        description: "Essential socialization skills for puppies to interact safely with other dogs and people.",
        videoUrl: "https://www.youtube.com/embed/TG6_5m8VmPE",
        duration: "6 weeks",
        difficulty: "Beginner",
        price: 200,
        image: "/images/puppy-socialization.jpg",
        sessions: upcoming()
      },
      {
        title: "Behavioral Correction",
        description: "Address common behavioral issues like excessive barking, jumping, and leash pulling.",
        videoUrl: "https://www.youtube.com/embed/3dWw9GLcOeA",
        duration: "6 weeks",
        difficulty: "Intermediate",
        price: 250,
        image: "/images/behavioral-correction.jpg",
        sessions: upcoming()
      },
      {
        title: "Cat Litter Training",
        description: "Comprehensive guide to litter box training for cats and kittens.",
        videoUrl: "https://www.youtube.com/embed/2XiYUYcpsT8",
        duration: "2 weeks",
        difficulty: "Beginner",
        price: 100,
        image: "/images/cat-litter-training.jpg",
        sessions: upcoming()
      },
      {
        title: "Service Dog Training",
        description: "Professional service dog training for specific tasks and disabilities.",
        videoUrl: "https://www.youtube.com/embed/O7VaXlMvAvk",
        duration: "12 weeks",
        difficulty: "Advanced",
        price: 500,
        image: "/images/service-dog-training.jpg",
        sessions: upcoming()
      }
    ];

    if (existingTrainings === 0) {
      await Training.insertMany(sampleTrainings);
      return res.json({ message: "Sample training data seeded successfully" });
    }

    // Trainings exist: ensure each has sessions
    const trainings = await Training.find();
    for (const t of trainings) {
      if (!t.sessions || t.sessions.length === 0) {
        t.sessions = upcoming();
        await t.save();
      }
    }
    return res.json({ message: "Training sessions ensured for existing records" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get All Trainings
app.get("/api/trainings", async (req, res) => {
  try {
    const trainings = await Training.find();
    res.json(trainings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get Training by ID
app.get("/api/trainings/:id", async (req, res) => {
  try {
    const training = await Training.findById(req.params.id);
    if (!training) return res.status(404).json({ message: "Training not found" });
    res.json(training);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ========== BOOKING ROUTES ==========

// Create Booking
app.post("/api/bookings", async (req, res) => {
  try {
    let { userId, petId, trainingId, serviceType, bookingDate, bookingTime, contact, details, amount } = req.body;

    if (!userId || !bookingDate) {
      return res.status(400).json({ message: "userId and bookingDate are required" });
    }

    // Normalize empty trainingId
    if (typeof trainingId === 'string' && trainingId.trim() === '') {
      trainingId = undefined;
    }

    // Require either a trainingId or a serviceType
    if (!trainingId && !serviceType) {
      return res.status(400).json({ message: "Provide either trainingId or serviceType" });
    }

    const payload = {
      userId,
      bookingDate: new Date(bookingDate),
    };
    if (petId) payload.petId = petId;
    if (trainingId) payload.trainingId = trainingId;
    if (serviceType) payload.serviceType = serviceType;
    if (bookingTime) payload.bookingTime = bookingTime;
    if (contact) payload.contact = contact;
    if (details) payload.details = details;

    if (amount != null) payload.amount = Number(amount) || 0;
    const savedBooking = await new Booking(payload).save();
    const populatedBooking = await Booking.findById(savedBooking._id)
      .populate('petId', 'petName')
      .populate('trainingId', 'title');
    
    res.status(201).json({ message: "Booking created successfully", booking: populatedBooking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get User's Bookings
app.get("/api/bookings/:userId", async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.params.userId })
      .populate('petId', 'petName')
      .populate('trainingId', 'title price')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ========== ADOPTION ROUTES ==========

// Sell Pet (Create Adoption Listing)
app.post("/api/adoptions", async (req, res) => {
  try {
    const { sellerId, petName, breed, age, price, location, contact, description, image } = req.body;
    
    const newAdoption = new Adoption({
      sellerId,
      petName,
      breed,
      age: parseInt(age),
      price: parseFloat(price),
      location,
      contact,
      description,
      image
    });
    
    const savedAdoption = await newAdoption.save();
    res.status(201).json({ message: "Pet listed for adoption successfully", adoption: savedAdoption });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Search Adoptions
app.get("/api/adoptions", async (req, res) => {
  try {
    const { breed, location, minPrice, maxPrice } = req.query;
    let filter = { status: "Available" };
    
    if (breed) filter.breed = new RegExp(breed, 'i');
    if (location) filter.location = new RegExp(location, 'i');
    if (minPrice) filter.price = { ...filter.price, $gte: parseFloat(minPrice) };
    if (maxPrice) filter.price = { ...filter.price, $lte: parseFloat(maxPrice) };
    
    const adoptions = await Adoption.find(filter)
      .populate('sellerId', 'fullName')
      .sort({ createdAt: -1 });
    res.json(adoptions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ========== COMMUNITY ROUTES ==========

// Join Community (basic simulation)
app.post("/api/community/join", async (req, res) => {
  try {
    const { userName } = req.body || {};
    // In a real app, we'd mark the user as joined in DB. Here, we simulate success.
    return res.json({ message: `Welcome to the community${userName ? ", " + userName : ""}!` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create Community Post
app.post("/api/community/posts", async (req, res) => {
  try {
    const { userName, imageUrl, description, contact, mobile, petName, petType, seenLocation } = req.body;
    if (!userName || !imageUrl || !description || !contact || !mobile || !petName || !petType || !seenLocation) {
      return res.status(400).json({ message: "userName, imageUrl, description, contact, mobile, petName, petType, and seenLocation are required" });
    }

    const post = new CommunityPost({ userName, imageUrl, description, contact, mobile, petName, petType, seenLocation });
    const saved = await post.save();
    res.status(201).json({ message: "Post created", post: saved });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get All Community Posts
app.get("/api/community/posts", async (req, res) => {
  try {
    const posts = await CommunityPost.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Send message to post owner (simulation)
app.post("/api/community/message/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { fromUserName, message } = req.body || {};

    const post = await CommunityPost.findById(id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    // Simulate notifying the owner (e.g., via email or push). Here we log and return success.
    console.log(`Community message to ${post.userName} (${post.contact}) from ${fromUserName || 'Anonymous'}: ${message || 'Interested!'}`);
    return res.json({ message: "Owner notified (simulation)", to: post.contact });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ========== FREE TRAINING RESOURCES ROUTES ==========

// Create Resource
app.post("/api/resources", async (req, res) => {
  try {
    const { title, emoji, description, link } = req.body;
    if (!title || !description || !link) {
      return res.status(400).json({ message: "title, description and link are required" });
    }
    const saved = await new TrainingResource({ title, emoji, description, link }).save();
    res.status(201).json({ message: "Resource created", resource: saved });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all resources
app.get("/api/resources", async (req, res) => {
  try {
    const resources = await TrainingResource.find().sort({ createdAt: -1 });
    res.json(resources);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Search resources (DB + Wikipedia) without API keys
app.get("/api/resources/search", async (req, res) => {
  try {
    const q = (req.query.q || "").trim();
    if (!q) return res.json({ query: q, db: [], wiki: [] });

    // Search DB (title or description contains q, case-insensitive)
    const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    const dbMatches = await TrainingResource.find({
      $or: [{ title: rx }, { description: rx }]
    }).sort({ createdAt: -1 }).limit(10);

    // Search Wikipedia (no API key)
    const wikiUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&format=json&origin=*&srlimit=5&srsearch=${encodeURIComponent(q)}`;
    let wikiItems = [];
    try {
      const resp = await fetch(wikiUrl);
      const data = await resp.json();
      const searches = data?.query?.search || [];
      wikiItems = searches.map((s) => ({
        title: s.title,
        snippet: (s.snippet || '').replace(/<[^>]+>/g, ''),
        link: `https://en.wikipedia.org/wiki/${encodeURIComponent(s.title.replace(/\s/g, '_'))}`,
      }));
    } catch (e) {
      console.error('Wikipedia fetch failed:', e.message);
    }

    return res.json({ query: q, db: dbMatches, wiki: wikiItems });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Optional: seed example resources
app.post("/api/resources/seed", async (req, res) => {
  try {
    const count = await TrainingResource.countDocuments();
    if (count > 0) {
      return res.json({ message: "Resources already exist" });
    }
    await TrainingResource.insertMany([
      { title: "How to potty train a puppy in 7 days", emoji: "🐶", description: "A simple, effective 7-day routine to house-train your puppy.", link: "https://www.akc.org/expert-advice/training/how-to-potty-train-a-puppy/" },
      { title: "Basic leash training techniques", emoji: "🐕", description: "Teach your dog to walk nicely on a leash with positive reinforcement.", link: "https://www.aspca.org/pet-care/dog-care/virtual-behavior-resources/leash-walking" },
      { title: "Best ways to teach your dog to sit/stay", emoji: "🐾", description: "Step-by-step guide to teaching sit and stay reliably.", link: "https://www.humanesociety.org/resources/how-train-your-dog" },
    ]);
    res.json({ message: "Resources seeded" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/", (req, res) => {
  res.send("🚀 Pet Care Backend is running fine!");
});

