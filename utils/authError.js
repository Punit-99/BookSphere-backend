// src/utils/authError.js

import { GraphQLError } from "graphql";

export const AuthenticationError = (message = "Not authenticated") => {
  throw new GraphQLError(message, {
    extensions: {
      code: "UNAUTHENTICATED",
    },
  });
};