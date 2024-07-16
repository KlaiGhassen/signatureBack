import express from "express";
import {
  getAllUsers,
  getLastUpdatedUsers,
  addUser,
  getNumberOfConnectedUser,
  getNumberOfSignedUser,
  getDashboardData,
  teachersListPdf,
} from "../controllers/UserController.js";
//declaration express router
const router = express.Router();

router.get("/all-teachers", getAllUsers);
router.get("/last-updated-teachers", getLastUpdatedUsers);
router.get("/connected-user-count", getNumberOfConnectedUser);
router.get("/signed-user-count", getNumberOfSignedUser);
router.get("/all-users-count", getNumberOfSignedUser);
router.get("/all-dashboard", getDashboardData);
router.post("/add-teacher", addUser);
router.get("/pdf-all-teachers", teachersListPdf);

export default router;
