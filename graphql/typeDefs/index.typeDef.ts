const typeDefs = `#graphql

scalar JSON

type User {
  id: ID!
  name: String!
  email: String!
  role: String!
  isApproved: Boolean!
}

type Venue {
  id: ID!
  name: String!
  address: String!
  city: String!
  state: String!
  capacity: Int!
  rows: Int!
  cols: Int!
}

type Event {
  id: ID!
  title: String!
  description: String!
  category: String!
  poster: [String!]!
  duration: Int!
  organizer: User!
  venue: Venue!
}

type Seat {
  number: String!
  tier: String!
  status: String!
  lockedBy: User
  lockExpiresAt: String
}

type Show {
  id: ID!
  event: Event!
  venue: Venue!
  showTime: String!
  totalSeats: Int!
  availableSeats: Int!
  price: Float!
  seats: [Seat!]!
}

type Booking {
  id: ID!
  user: User!
  show: Show!
  seatsBooked: Int!
  seatNumbers: [String!]!
  totalPrice: Float!
  status: String!
  paymentStatus: String!
  bookingReference: String
  createdAt: String!
}

type PromoCode {
  code: String!
  discountPercent: Float!
  expiresAt: String!
  isActive: Boolean!
}

type AuthPayload {
  user: User!
}

type RefreshResponse {
  success: Boolean!
}

type Query {
  me: User
  events(category: String, city: String): [Event!]!
  event(id: ID!): Event
  shows(eventId: ID!): [Show!]!
  seats(showId: ID!): [Seat!]!
  myBookings: [Booking!]!
  booking(id: ID!): Booking
  venues: [Venue!]!
}

type Mutation {
  signup(name: String!, email: String!, password: String!, role: String): AuthPayload!
  login(email: String!, password: String!): AuthPayload!
  logout: Boolean!
  refreshToken: RefreshResponse!
  
  createVenue(name: String!, address: String!, city: String!, state: String!, capacity: Int!, rows: Int, cols: Int): Venue!
  createEvent(title: String!, description: String!, category: String!, poster: [String!], duration: Int!, venueId: ID!): Event!
  createShow(eventId: ID!, venueId: ID!, showTime: String!, price: Float!, totalSeats: Int!): Show!
  
  lockSeat(showId: ID!, seatNumber: String!): Show!
  unlockSeat(showId: ID!, seatNumber: String!): Show!
  
  createBooking(showId: ID!, seatNumbers: [String!]!, promoCode: String): Booking!
  applyPromoCode(code: String!): PromoCode!
}

type Subscription {
  seatStatusChanged(showId: ID!): Show!
}
`;

export default typeDefs;
