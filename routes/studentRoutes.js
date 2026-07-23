const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware=require("../middleware/adminMiddleware");

const {
    getStudents,
    getStudentById,
    createStudent,
    updateStudent,
    deleteStudent,
    loginStudent
} = require("../controllers/studentController");

router.post("/login", loginStudent);

router.get("/", authMiddleware, getStudents);

router.get("/:id", getStudentById);

router.post("/", createStudent);

router.put("/:id", updateStudent);

router.delete("/:id", authMiddleware, adminMiddleware, deleteStudent);

module.exports = router;