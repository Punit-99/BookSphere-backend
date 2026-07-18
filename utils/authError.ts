import { GraphQLError } from "graphql";

export class AuthenticationError extends GraphQLError {
  constructor(message = "Not authenticated") {
    super(message, {
      extensions: {
        code: "UNAUTHENTICATED",
      },
    });
  }
}
