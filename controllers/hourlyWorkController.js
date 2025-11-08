import HourlyWork from "../models/HourlyWork.js";

/**
 * ✅ Save a new hourly record (Planning or Actual)
 */
export const saveHourlyWork = async (req, res) => {
  try {
    const newWork = new HourlyWork(req.body);
    await newWork.save();
    res.status(201).json(newWork);
  } catch (err) {
    console.error("❌ Error saving hourly work:", err);
    res.status(500).json({ message: "Error saving hourly work" });
  }
};

/**
 * ✅ Fetch all hourly work records
 * - Merges Planning + Actual side by side
 * - Supports optional filters:
 *   ?date=YYYY-MM-DD
 *   ?studentId=RK23CSE001
 */
export const getAllHourlyWork = async (req, res) => {
  try {
    const { date, studentId } = req.query;

    // Build filters dynamically
    const filter = {};
    if (date) filter.date = date;
    if (studentId) filter.studentId = studentId;

    // Fetch records (filtered or all)
    const allRecords = await HourlyWork.find(filter).sort({
      date: -1,
      hour: 1,
    });

    // Merge Planning & Actual into one row
    const mergedRecords = {};

    for (const rec of allRecords) {
      const key = `${rec.studentId}_${rec.date}_${rec.hour}`;

      if (!mergedRecords[key]) {
        mergedRecords[key] = {
          studentId: rec.studentId,
          name: rec.name,
          date: rec.date,
          hour: rec.hour,
          planned: "",
          actual: "",
        };
      }

      if (rec.type === "Planning") {
        mergedRecords[key].planned = rec.description;
      } else if (rec.type === "Actual") {
        mergedRecords[key].actual = rec.description;
      }
    }

    const mergedArray = Object.values(mergedRecords);
    res.json(mergedArray);
  } catch (err) {
    console.error("❌ Error fetching hourly work:", err);
    res.status(500).json({ message: "Error fetching hourly work" });
  }
};
