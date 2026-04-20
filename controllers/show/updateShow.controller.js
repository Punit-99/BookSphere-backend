import Show from "../../models/show.model.js";

export const updateShowController = async ({ id, input }) => {
  try {
    const show = await Show.findById(id);

    if (!show) {
      throw new Error("Show not found");
    }

    // ✅ update fields safely
    if (input.movie) show.movie = input.movie;
    if (input.theatre) show.theatre = input.theatre;
    if (input.showTime) show.showTime = new Date(input.showTime);
    if (input.totalSeats !== undefined) {
      show.totalSeats = input.totalSeats;

      // 🔥 keep availableSeats in sync
      show.availableSeats = input.totalSeats;
    }
    if (input.price !== undefined) show.price = input.price;

    await show.save();

    return show;
  } catch (error) {
    console.error("Update Show Error:", error);
    throw new Error("Failed to update show");
  }
};
