import { asyncHandler } from "../utils/asyncHandler.js";

const registerUser = asyncHandler(async (req, res) => {
  try {
    res.status(200).json({
      message: "OK",
    });
  } catch (error) {
    console.log("Path connection faield", error);
  }
});

export { registerUser };
