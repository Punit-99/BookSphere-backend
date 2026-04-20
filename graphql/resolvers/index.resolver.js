import { registerUser } from "../../controllers/auth/register.controller.js";
import { loginUser } from "../../controllers/auth/login.controller.js";

import { createMovieController } from "../../controllers/movie/createMovie.controller.js";
import { getMoviesController } from "../../controllers/movie/getMovies.controller.js";
import { updateMovieController } from "../../controllers/movie/updateMovie.controller.js";
import { deleteMovieController } from "../../controllers/movie/deleteMovie.controller.js";

import { createTheatreController } from "../../controllers/theatre/createTheatre.controller.js";
import { getTheatresController } from "../../controllers/theatre/getTheatres.controller.js";
import { updateTheatreController } from "../../controllers/theatre/updateTheatre.controller.js";
import { deleteTheatreController } from "../../controllers/theatre/deleteTheatre.controller.js";

import { createShowController } from "../../controllers/show/createShow.controller.js";
import { getShowsController } from "../../controllers/show/getShows.controller.js";
import { updateShowController } from "../../controllers/show/updateShow.controller.js";
import { deleteShowController } from "../../controllers/show/deleteShow.controller.js";

import { getMyBookingsController } from "../../controllers/booking/getMyBookings.controller.js";
import { getBookingPageController } from "../../controllers/booking/getBookingPage.controller.js";
import { cancelBookingController } from "../../controllers/booking/cancelBooking.controller.js";

import { toggleAdminApprovalController } from "../../controllers/admin/approveAdmin.controller.js";
import { refreshTokenController } from "../../controllers/auth/refreshToken.controller.js";
import { logoutController } from "../../controllers/auth/logout.controller.js";

import User from "../../models/user.model.js";
import { requireAuth } from "../../utils/requireAuth.js";
import { ROLES } from "../../utils/constant.js";

import {
  MOVIE_GENRES,
  LANGUAGES,
  LOCATION_DATA,
} from "../../utils/constant.js";

import { getAllMoviesController } from "../../controllers/public/getAllMovies.controller.js";

import { getAllTheatresController } from "../../controllers/public/getAllTheatres.controller.js";

import { getAllShowsController } from "../../controllers/public/getAllShows.controller.js";

import GraphQLJSON from "graphql-type-json";
import { getHomeMoviesController } from "../../controllers/public/getHomeMovies.controller.js";
import { getLatestMoviesController } from "../../controllers/public/getLatestMovies.controller.js";

import { getMovieByIdController } from "../../controllers/public/getMovieById.controller.js";
const resolvers = {
  JSON: GraphQLJSON,

  Query: {
    publicMovies: () => getAllMoviesController(),
    publicTheatres: () => getAllTheatresController(),
    publicShows: (_, args) => getAllShowsController(args),

    homeMovies: () => getHomeMoviesController(),
    latestMovies: () => getLatestMoviesController(),
    movie: (_, args) => getMovieByIdController(args),

    bookingPage: (_, { movieId }) => getBookingPageController(movieId),

    adminMovies: (_, __, { user }) => {
      requireAuth(user);
      return getMoviesController(user);
    },

    adminTheatres: (_, __, { user }) => {
      requireAuth(user);
      return getTheatresController(user);
    },

    adminShows: (_, args, { user }) => {
      requireAuth(user);
      return getShowsController(args, user);
    },

    myBookings: (_, __, { user, redis }) => {
      requireAuth(user);
      return getMyBookingsController(user, redis);
    },

    me: async (_, __, { user }) => {
      requireAuth(user);
      return await User.findById(user.id);
    },

    admins: async (_, __, { user }) => {
      requireAuth(user);

      if (user.role !== ROLES.SUPERADMIN) {
        throw new Error("Not allowed");
      }

      return await User.find({ role: ROLES.ADMIN });
    },

    constants: () => ({
      genres: MOVIE_GENRES,
      languages: LANGUAGES,
      locations: LOCATION_DATA,
    }),
  },

  Show: {
    id: (parent) => parent._id?.toString() || parent.id,
  },

  Movie: {
    id: (parent) => parent._id?.toString() || parent.id,
  },

  Theatre: {
    id: (parent) => parent._id?.toString() || parent.id,
  },

  Booking: {
    id: (parent) => parent._id?.toString() || parent.id,
  },

  Mutation: {
    register: (_, args, ctx) => registerUser(args, ctx),
    login: (_, args, ctx) => loginUser(args, ctx),

    refreshToken: (_, __, ctx) => refreshTokenController(_, __, ctx),
    logout: (_, __, ctx) => logoutController(_, __, ctx),

    createMovie: (_, args, { user }) => {
      requireAuth(user);
      return createMovieController(args, user);
    },

    updateMovie: (_, args, { user }) => {
      requireAuth(user);
      return updateMovieController(args, user);
    },

    deleteMovie: (_, args, { user }) => {
      requireAuth(user);
      return deleteMovieController(args, user);
    },

    createTheatre: (_, args, { user }) => {
      requireAuth(user);
      return createTheatreController(args, user);
    },

    updateTheatre: (_, args, { user }) => {
      requireAuth(user);
      return updateTheatreController(args, user);
    },

    deleteTheatre: (_, args, { user }) => {
      requireAuth(user);
      return deleteTheatreController(args, user);
    },

    createShow: (_, args, { user }) => {
      requireAuth(user);
      return createShowController(args, user);
    },

    updateShow: (_, args, { user }) => {
      requireAuth(user);
      return updateShowController(args, user);
    },

    deleteShow: (_, args, { user }) => {
      requireAuth(user);
      return deleteShowController(args, user);
    },

    cancelBooking: (_, args, { user }) => {
      requireAuth(user);
      return cancelBookingController(args, user);
    },

    toggleAdminApproval: async (_, args, { user }) => {
      requireAuth(user);
      return await toggleAdminApprovalController(args, user);
    },
  },
};

export default resolvers;
