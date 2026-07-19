import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import User from "../models/user.model";
import Venue from "../models/venue.model";
import Event from "../models/event.model";
import Show from "../models/show.model";
import bcrypt from "bcryptjs";

const seed = async () => {
  try {
    console.log("Connecting database...");
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log("Connected successfully.");

    // Clear existing data
    console.log("Cleaning collections...");
    await User.deleteMany({});
    await Venue.deleteMany({});
    await Event.deleteMany({});
    await Show.deleteMany({});
    console.log("Cleaned collections successfully.");

    // 1. Create Test Users
    console.log("Creating default users...");
    const hashedPassword = await bcrypt.hash("admin123", 10);
    const admin = await User.create({
      name: "Admin User",
      email: "admin@booksphere.com",
      password: hashedPassword,
      role: "ADMIN",
      isApproved: true,
    });

    const userPassword = await bcrypt.hash("user123", 10);
    const regularUser = await User.create({
      name: "Regular User",
      email: "user@booksphere.com",
      password: userPassword,
      role: "USER",
      isApproved: true,
    });
    console.log("Users created successfully.");

    // 2. Create Venues
    console.log("Creating venues...");
    const venue1 = await Venue.create({
      name: "Grand Cineplex Arena",
      address: "CG Road, Navrangpura",
      city: "Ahmedabad",
      state: "Gujarat",
      capacity: 100,
      rows: 10,
      cols: 10,
    });

    const venue2 = await Venue.create({
      name: "Indira Gandhi Indoor Stadium",
      address: "IP Estate, Grand Trunk Rd",
      city: "New Delhi",
      state: "Delhi",
      capacity: 150,
      rows: 10,
      cols: 15,
    });

    const venue3 = await Venue.create({
      name: "Rajhans Multiplex",
      address: "Pal Village, Adajan",
      city: "Surat",
      state: "Gujarat",
      capacity: 80,
      rows: 8,
      cols: 10,
    });
    console.log("Venues created successfully.");

    // 3. Create Events
    console.log("Creating events...");
    const event1 = await Event.create({
      title: "Diljit Dosanjh - Dil-Luminati Tour",
      description: "Experience the magic of Diljit Dosanjh performing live in your city with an energetic performance, premium lighting, and outstanding sound.",
      category: "Music",
      poster: ["https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=500&q=80"],
      duration: 180,
      organizer: admin._id,
      venue: venue2._id,
    });

    const event2 = await Event.create({
      title: "Standup Comedy Night with Zakir Khan",
      description: "Get ready for a night of pure laughter with the king of storytelling and comedy, Zakir Khan. Hahahaha guaranteed!",
      category: "Comedy",
      poster: ["https://images.unsplash.com/photo-1585699324551-f6c309eed262?w=500&q=80"],
      duration: 120,
      organizer: admin._id,
      venue: venue1._id,
    });

    const event3 = await Event.create({
      title: "Marvels Avengers - Cine Premiere",
      description: "Exclusive premiere of the latest Marvel saga in the ultra premium IMAX 3D screens of Grand Cineplex.",
      category: "Movie",
      poster: ["https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&q=80"],
      duration: 150,
      organizer: admin._id,
      venue: venue3._id,
    });
    console.log("Events created successfully.");

    // 4. Create Shows (Instances of Events with times)
    console.log("Creating shows...");
    
    // helper function to build seats layout
    const buildSeats = (rows: number, cols: number) => {
      const seats = [];
      const rowLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      for (let r = 0; r < rows; r++) {
        const letter = rowLetters.charAt(r) || `R${r}`;
        for (let c = 1; c <= cols; c++) {
          seats.push({
            number: `${letter}${c}`,
            tier: r < 2 ? "VIP" : r < 5 ? "Premium" : "Standard",
            status: "Available",
          });
        }
      }
      return seats;
    };

    // Show 1
    const seats1 = buildSeats(venue2.rows, venue2.cols);
    await Show.create({
      event: event1._id,
      venue: venue2._id,
      showTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days later
      price: 250,
      totalSeats: seats1.length,
      availableSeats: seats1.length,
      seats: seats1,
    });

    // Show 2
    const seats2 = buildSeats(venue1.rows, venue1.cols);
    await Show.create({
      event: event2._id,
      venue: venue1._id,
      showTime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day later
      price: 150,
      totalSeats: seats2.length,
      availableSeats: seats2.length,
      seats: seats2,
    });

    // Show 3
    const seats3 = buildSeats(venue3.rows, venue3.cols);
    await Show.create({
      event: event3._id,
      venue: venue3._id,
      showTime: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(), // 12 hours later
      price: 120,
      totalSeats: seats3.length,
      availableSeats: seats3.length,
      seats: seats3,
    });
    console.log("Shows created successfully.");

    console.log("Database seeded successfully! 🌱");
    process.exit(0);
  } catch (err: any) {
    console.error("Seeding failed:", err.message);
    process.exit(1);
  }
};

seed();
