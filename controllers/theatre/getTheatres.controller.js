import Theatre from "../../models/theatre.model.js";

export const getTheatresController = async (user) => {
  try {
    if (!user) throw new Error("Unauthorized");

    if (user.role !== "admin") {
      return [];
    }

    const theatres = await Theatre.find().populate("owner");

    const filtered = theatres.filter((theatre) => {
      return theatre.owner?._id?.toString() === user.id;
    });

    return filtered;
  } catch (err) {
    console.error("GET THEATRES ERROR:", err);
    throw new Error("Failed to fetch theatres");
  }
};
