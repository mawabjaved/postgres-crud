const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const pool = require("../config/db");

const getStudents = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 100;
    const offset = (page - 1) * limit;

 const name = req.query.name || "";
const email = req.query.email || "";

    // Production-safe sorting
    const allowedSort = ["id", "name", "email"];
    const sort = allowedSort.includes(req.query.sort)
        ? req.query.sort
        : "id";

    const order = req.query.order === "desc" ? "DESC" : "ASC";

    try {
        // Total records count
      const totalResult = await pool.query(
    `SELECT COUNT(*) FROM students
     WHERE name ILIKE $1
     AND email ILIKE $2`,
    [`%${name}%`, `%${email}%`]
);


        const totalRecords = parseInt(totalResult.rows[0].count);

        // Fetch paginated data
        const result = await pool.query(
    `SELECT * FROM students
     WHERE name ILIKE $1
     AND email ILIKE $2
     ORDER BY ${sort} ${order}
     LIMIT $3 OFFSET $4`,
    [`%${name}%`, `%${email}%`, limit, offset]
);

        res.status(200).json({
            page,
            limit,
            totalRecords,
            totalPages: Math.ceil(totalRecords / limit),
            data: result.rows,
        });

    } catch (error) {
        if (error.code === "23505") {
            return res.status(400).json({
                message: "Email already exists",
            });
        }

        if (error.code === "23502") {
            return res.status(400).json({
                message: "Required field missing",
            });
        }

        res.status(500).json({
            message: error.message,
        });
    }
};

const getStudentById = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            "SELECT * FROM students WHERE id = $1",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Student not found",
            });
        }

        res.json(result.rows[0]);

    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};


const createStudent = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await pool.query(
            `INSERT INTO students(name, email, password)
             VALUES($1, $2, $3)
             RETURNING id, name, email`,
            [name, email, hashedPassword]
        );

        res.status(201).json({
            message: "Student Registered Successfully",
            student: result.rows[0]
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

const loginStudent = async (req, res) => {
    const { email, password } = req.body;

    try {
        const result = await pool.query(
            "SELECT * FROM students WHERE email = $1",
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Invalid Email or Password"
            });
        }

        const student = result.rows[0];

        const isMatch = await bcrypt.compare(password, student.password);

        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid Email or Password"
            });
        }

       const token = jwt.sign(
{
    id: student.id,
    email: student.email,
    role: student.role
},
process.env.JWT_SECRET,
{
    expiresIn:"1h"
});

        res.status(200).json({
            message: "Login Successful",
            token
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

const updateStudent = async (req, res) => {
    const { id } = req.params;
    const { name, email } = req.body;

    try {
        const result = await pool.query(
            "UPDATE students SET name = $1, email = $2 WHERE id = $3 RETURNING *",
            [name, email, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Student not found",
            });
        }

        res.json(result.rows[0]);

    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

const deleteStudent = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            "DELETE FROM students WHERE id = $1 RETURNING *",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Student not found",
            });
        }

        res.json({
            message: "Student Deleted Successfully",
        });

    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

module.exports = {
    getStudents,
    getStudentById,
    createStudent,
    updateStudent,
    deleteStudent,
    loginStudent
};