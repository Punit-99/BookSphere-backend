import User from "../../models/user.model.js";
import Venue from "../../models/venue.model.js";
import Event from "../../models/event.model.js";
import Show from "../../models/show.model.js";
import Booking from "../../models/booking.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { GraphQLContext } from "../index.graphql.js";

const resolvers = {
  Query: {
    me: async (_: any, __: any, { user }: GraphQLContext) => {
      if (!user) return null;
      return await User.findById(user.id);
    },

    events: async (_: any, { category, city }: { category?: string; city?: string }) => {
      const filter: any = {};
      if (category) filter.category = category;
      // Filter by city if venue matches city
      if (city) {
        const venues = await Venue.find({ city }).select("_id");
        filter.venue = { $in: venues.map((v) => v._id) };
      }
      return await Event.find(filter).populate("organizer").populate("venue");
    },

    event: async (_: any, { id }: { id: string }) => {
      return await Event.findById(id).populate("organizer").populate("venue");
    },

    shows: async (_: any, { eventId }: { eventId: string }) => {
      return await Show.find({ event: eventId }).populate("event").populate("venue");
    },

    seats: async (_: any, { showId }: { showId: string }) => {
      const show = await Show.findById(showId);
      if (!show) return [];
      return show.seats || [];
    },

    myBookings: async (_: any, __: any, { user }: GraphQLContext) => {
      if (!user) throw new Error("Unauthorized");
      return await Booking.find({ user: user.id }).populate("user").populate({
        path: "show",
        populate: [{ path: "event" }, { path: "venue" }],
      });
    },

    booking: async (_: any, { id }: { id: string }, { user }: GraphQLContext) => {
      if (!user) throw new Error("Unauthorized");
      return await Booking.findById(id).populate("user").populate({
        path: "show",
        populate: [{ path: "event" }, { path: "venue" }],
      });
    },

    venues: async () => {
      return await Venue.find();
    },
  },

  Mutation: {
    signup: async (_: any, { name, email, password, role }: any, { res }: GraphQLContext) => {
      const existing = await User.findOne({ email });
      if (existing) throw new Error("Email already registered");

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await User.create({
        name,
        email,
        password: hashedPassword,
        role: role || "USER",
      });

      const accessToken = jwt.sign(
        { id: user._id, role: user.role, email: user.email },
        process.env.JWT_ACCESS_SECRET as string,
        { expiresIn: Math.floor(Number(process.env.ACCESS_TOKEN_EXPIRE || 900000) / 1000) }
      );

      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.COOKIE_SECURE === "true",
        sameSite: "none",
      });

      return { user };
    },

    login: async (_: any, { email, password }: any, { res }: GraphQLContext) => {
      const user = await User.findOne({ email }).select("+password");
      if (!user) throw new Error("Invalid credentials");

      const isMatch = await bcrypt.compare(password, user.password || "");
      if (!isMatch) throw new Error("Invalid credentials");

      const accessToken = jwt.sign(
        { id: user._id, role: user.role, email: user.email },
        process.env.JWT_ACCESS_SECRET as string,
        { expiresIn: Math.floor(Number(process.env.ACCESS_TOKEN_EXPIRE || 900000) / 1000) }
      );

      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.COOKIE_SECURE === "true",
        sameSite: "none",
      });

      return { user };
    },

    logout: (_: any, __: any, { res }: GraphQLContext) => {
      res.clearCookie("accessToken");
      return true;
    },

    createVenue: async (_: any, args: any, { user }: GraphQLContext) => {
      if (!user || user.role !== "ADMIN") throw new Error("Unauthorized");
      return await Venue.create(args);
    },

    createEvent: async (_: any, args: any, { user }: GraphQLContext) => {
      if (!user || user.role !== "ADMIN") throw new Error("Unauthorized");
      return await Event.create({
        ...args,
        organizer: user.id,
        venue: args.venueId,
      });
    },

    createShow: async (_: any, args: any, { user }: GraphQLContext) => {
      if (!user || user.role !== "ADMIN") throw new Error("Unauthorized");
      
      const venue = await Venue.findById(args.venueId);
      if (!venue) throw new Error("Venue not found");

      // Initialize empty seat layouts based on rows/cols capacity
      const seats = [];
      const rows = venue.rows || 10;
      const cols = venue.cols || 10;
      const rowLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      
      for (let r = 0; r < rows; r++) {
        const letter = rowLetters.charAt(r) || `R${r}`;
        for (let c = 1; c <= cols; c++) {
          seats.push({
            number: `${letter}${c}`,
            tier: r < 3 ? "VIP" : r < 7 ? "Premium" : "Standard",
            status: "Available",
          });
        }
      }

      return await Show.create({
        event: args.eventId,
        venue: args.venueId,
        showTime: args.showTime,
        price: args.price,
        totalSeats: seats.length,
        availableSeats: seats.length,
        seats,
      });
    },

    lockSeat: async (_: any, { showId, seatNumber }: any, { user, redis }: GraphQLContext) => {
      if (!user) throw new Error("Unauthorized");
      const show = await Show.findById(showId);
      if (!show) throw new Error("Show not found");

      const seat = show.seats.find((s: any) => s.number === seatNumber);
      if (!seat) throw new Error("Seat not found");

      if (seat.status !== "Available") {
        throw new Error("Seat is already locked or sold");
      }

      // Redis lock key setup
      const lockKey = `show:${showId}:seat:${seatNumber}`;
      const isLocked = await redis.safeSet(lockKey, user.id, 600); // 10-min lock TTL

      seat.status = "Locked";
      seat.lockedBy = user.id;
      seat.lockExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
      await show.save();

      return show;
    },

    unlockSeat: async (_: any, { showId, seatNumber }: any, { user, redis }: GraphQLContext) => {
      if (!user) throw new Error("Unauthorized");
      const show = await Show.findById(showId);
      if (!show) throw new Error("Show not found");

      const seat = show.seats.find((s: any) => s.number === seatNumber);
      if (!seat) throw new Error("Seat not found");

      if (seat.status === "Locked" && seat.lockedBy?.toString() === user.id) {
        const lockKey = `show:${showId}:seat:${seatNumber}`;
        await redis.safeDel(lockKey);

        seat.status = "Available";
        seat.lockedBy = null;
        seat.lockExpiresAt = null;
        await show.save();
      }

      return show;
    },
  },
};

export default resolvers;
