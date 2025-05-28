import express from "express";
import {
  createAddress,
  getUserAddresses,
  getAddressById,
  updateAddressById,
  deleteAddress,
} from "../controllers/addressController.js";

import { authenticate} from "../middlewares/authMiddleware.js";

const router = express.Router();
router.use(authenticate);

router.route("/").post(createAddress).get(getUserAddresses);
router
  .route("/:id")
  .get(getAddressById)
  .put(updateAddressById)
  .delete(deleteAddress);
  
export default router;
// import express from "express";