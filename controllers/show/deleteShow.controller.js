import Show from "../../models/show.model.js";

export const deleteShowController = async ({ id }) => {
  try {
    const show = await Show.findById(id);

    if (!show) {
      throw new Error("Show not found");
    }

    await show.deleteOne();

    return true;
  } catch (error) {
    console.error("Delete Show Error:", error);
    throw new Error("Failed to delete show");
  }
};
