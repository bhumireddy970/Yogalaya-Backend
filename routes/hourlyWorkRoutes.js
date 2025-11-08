import express from "express";
import {
  saveHourlyWork,
  getAllHourlyWork,
} from "../controllers/hourlyWorkController.js";

const router = express.Router();

router.post("/", saveHourlyWork);
router.get("/all", getAllHourlyWork);

export default router;
