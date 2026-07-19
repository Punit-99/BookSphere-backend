import User from "../../models/user.model";
import Venue from "../../models/venue.model";
import Event from "../../models/event.model";
import Show from "../../models/show.model";
import Booking from "../../models/booking.model";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { GraphQLContext } from "../index.graphql";
import { generateTokens } from "../../utils/generateTokens";
import { MOVIE_GENRES, LANGUAGES, LOCATION_DATA } from "../../utils/constant";

const mapEventToMovie = (event: any) => {
  if (!event) return null;
  return {
    id: event._id,
    title: event.title,
    description: event.description,
    duration: event.duration || 120,
    language: ["Hindi", "English"],
    genre: [event.category || "Movie"],
    releaseDate: event.createdAt ? new Date(event.createdAt).toISOString() : new Date().toISOString(),
    poster: event.poster || [],
    organizer: event.organizer,
    venue: event.venue,
  };
};

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

    // Backwards compatibility resolvers for existing frontend
    movie: async (_: any, { id }: { id: string }) => {
      const event = await Event.findById(id).populate("organizer").populate("venue");
      return mapEventToMovie(event);
    },

    bookingPage: async (_: any, { movieId }: { movieId: string }) => {
      const event = await Event.findById(movieId).populate("organizer").populate("venue");
      if (!event) throw new Error("Event not found");

      const movie = mapEventToMovie(event);

      // Find all shows for this event
      const shows = await Show.find({ event: event._id }).populate("venue");

      // Group shows by venue (theatre)
      const venueMap = new Map<string, any>();
      for (const show of shows) {
        const venue = show.venue as any;
        if (!venue) continue;
        const venueId = venue._id.toString();

        if (!venueMap.has(venueId)) {
          venueMap.set(venueId, {
            theatre: {
              id: venue._id,
              name: venue.name,
              city: venue.city,
              state: venue.state,
              address: venue.address,
              screens: venue.screens || 1,
              owner: event.organizer,
            },
            shows: [],
          });
        }

        venueMap.get(venueId).shows.push({
          id: show._id,
          showTime: show.showTime,
          price: show.price,
          availableSeats: show.availableSeats,
        });
      }

      return {
        movie,
        theatres: Array.from(venueMap.values()),
      };
    },

    constants: () => ({
      genres: MOVIE_GENRES,
      languages: LANGUAGES,
      locations: LOCATION_DATA,
    }),

    homeMovies: async () => {
      const events = await Event.find().populate("organizer").populate("venue");
      return events.map(mapEventToMovie);
    },

    latestMovies: async () => {
      const events = await Event.find().sort({ createdAt: -1 }).limit(5).populate("organizer").populate("venue");
      return events.map(mapEventToMovie);
    },
  },

  Mutation: {
    register: async (_: any, { name, email, password, role }: any, { res }: GraphQLContext) => {
      const existing = await User.findOne({ email });
      if (existing) throw new Error("Email already registered");

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await User.create({
        name,
        email,
        password: hashedPassword,
        role: role || "user",
      });

      const { accessToken, refreshToken } = generateTokens(user);

      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.COOKIE_SECURE === "true",
        sameSite: "none",
      });

      res.cookie("refreshToken", refreshToken, {
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

      const { accessToken, refreshToken } = generateTokens(user);

      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.COOKIE_SECURE === "true",
        sameSite: "none",
      });

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.COOKIE_SECURE === "true",
        sameSite: "none",
      });

      return { user };
    },

    logout: (_: any, __: any, { res }: GraphQLContext) => {
      res.clearCookie("accessToken");
      res.clearCookie("refreshToken");
      return { success: true };
    },

    refreshToken: async (_: any, __: any, { req, res }: GraphQLContext) => {
      const token = req.cookies?.refreshToken;
      if (!token) throw new Error("No refresh token");

      try {
        const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET as string) as any;
        const user = await User.findById(decoded.id);
        if (!user) throw new Error("User not found");

        const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);

        res.cookie("accessToken", accessToken, {
          httpOnly: true,
          secure: process.env.COOKIE_SECURE === "true",
          sameSite: "none",
        });

        res.cookie("refreshToken", newRefreshToken, {
          httpOnly: true,
          secure: process.env.COOKIE_SECURE === "true",
          sameSite: "none",
        });

        return { success: true };
      } catch (err) {
        throw new Error("Invalid or expired refresh token");
      }
    },

    createVenue: async (_: any, args: any, { user }: GraphQLContext) => {
      if (!user || user.role !== "admin") throw new Error("Unauthorized");
      return await Venue.create(args);
    },

    createEvent: async (_: any, args: any, { user }: GraphQLContext) => {
      if (!user || user.role !== "admin") throw new Error("Unauthorized");
      return await Event.create({
        ...args,
        organizer: user.id,
        venue: args.venueId,
      });
    },

    createShow: async (_: any, args: any, { user }: GraphQLContext) => {
      if (!user || user.role !== "admin") throw new Error("Unauthorized");
      
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
