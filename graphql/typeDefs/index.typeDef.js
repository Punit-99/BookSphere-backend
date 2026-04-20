const typeDefs = `#graphql

scalar JSON

type User {
  id: ID!
  name: String!
  email: String!
  role: String!
  isApproved: Boolean!
}

type Movie {
  id: ID!
  title: String!
  description: String
  duration: Int!
  language: [String!]!
  genre: [String!]!
  releaseDate: String
  poster: [String]
}

type Theatre {
  id: ID!
  name: String!
  state: String!
  city: String!
  address: String
  screens: Int!
  owner: User!
}

type Show {
  id: ID!
  movie: Movie!
  theatre: Theatre!
  showTime: String!
  totalSeats: Int!
  availableSeats: Int!
  price: Float!
}

type Booking {
  id: ID!
  user: User!
  show: Show!
  seatsBooked: Int!
  seatNumbers: [String]
  totalPrice: Float!
  status: String!
  paymentStatus: String!
  bookingReference: String!
  createdAt: String!
}

type AuthPayload {
  user: User!
}

type RefreshResponse {
  success: Boolean!
}

type Constants {
  genres: [String!]!
  languages: [String!]!
  locations: JSON!
}

type TheatreWithShows {
  theatre: Theatre!
  shows: [Show!]!
}

type BookingPageResponse {
  movie: Movie!
  theatres: [TheatreWithShows!]!
}

input TheatreInput {
  name: String
  state: String
  city: String
  address: String
  screens: Int
}

input MovieInput {
  title: String
  description: String
  duration: Int
  language: [String]
  genre: [String]
  releaseDate: String
  poster: [String]
}

input ShowInput {
  movie: ID
  theatre: ID
  showTime: String
  totalSeats: Int
  price: Float
}

type Query {
  # ---------- PUBLIC ----------
  publicMovies: [Movie!]!
  publicTheatres: [Theatre!]!
  publicShows(movieId: ID): [Show!]!

  homeMovies: [Movie!]!
  latestMovies: [Movie!]!
  movie(id: ID!): Movie
  bookingPage(movieId: ID!): BookingPageResponse!

  # ---------- ADMIN ----------
  adminMovies: [Movie!]!
  adminTheatres: [Theatre!]!
  adminShows(movieId: ID): [Show!]!

  # ---------- COMMON ----------
  myBookings: [Booking!]!
  me: User
  admins: [User!]!
  constants: Constants!
}

type Mutation {
  register(name: String!, email: String!, password: String!): AuthPayload
  login(email: String!, password: String!): AuthPayload

  refreshToken: RefreshResponse
  logout: RefreshResponse

  createMovie(
    title: String!
    description: String
    duration: Int!
    language: [String!]!
    genre: [String!]!
    releaseDate: String
    poster: [String]
  ): Movie

  updateMovie(id: ID!, input: MovieInput!): Movie
  deleteMovie(id: ID!): Boolean!

  createTheatre(
    name: String!
    state: String!
    city: String!
    address: String
    screens: Int!
  ): Theatre

  updateTheatre(id: ID!, input: TheatreInput!): Theatre
  deleteTheatre(id: ID!): Boolean!

  createShow(
    movie: ID!
    theatre: ID!
    showTime: String!
    totalSeats: Int!
    price: Float!
  ): Show

  updateShow(id: ID!, input: ShowInput!): Show
  deleteShow(id: ID!): Boolean!

  createBooking(
    showId: ID!
    seatsBooked: Int!
    seatNumbers: [String]
  ): Booking

  cancelBooking(bookingId: ID!): Booking
  toggleAdminApproval(userId: ID!): User
}
`;

export default typeDefs;
