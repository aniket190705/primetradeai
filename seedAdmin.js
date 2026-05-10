require("dotenv").config();
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const User = require("./src/models/User");

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const email = process.env.ADMIN_EMAIL || "admin@example.com";
    const password = process.env.ADMIN_PASSWORD || "admin1234";

    const existingAdmin = await User.findOne({ email });

    if (existingAdmin) {
      console.log("Admin user already exists");
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      name: "Admin User",
      email,
      password: hashedPassword,
      role: "admin",
    });

    console.log("Admin user created successfully");
    process.exit(0);
  } catch (error) {
    console.log("Failed to seed admin user:", error.message);
    process.exit(1);
  }
};

seedAdmin();
