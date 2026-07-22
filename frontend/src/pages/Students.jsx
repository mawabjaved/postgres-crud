import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Students() {
    const navigate = useNavigate();

    const [students, setStudents] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [userRole, setUserRole] = useState("");

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: ""
    });

    async function fetchStudents() {
        try {
            const token = localStorage.getItem("token");

            const response = await api.get("/students", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setStudents(response.data.data);

        } catch (error) {
            console.log(error.response?.data || error.message);

            localStorage.removeItem("token");
            navigate("/login");
        }
    }

    useEffect(() => {

        const token = localStorage.getItem("token");

        if (token) {
            try {
                const payload = JSON.parse(atob(token.split(".")[1]));
                setUserRole(payload.role);
            } catch (error) {
                console.log("Invalid Token");
            }
        }

        fetchStudents();

    }, []);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const saveStudent = async (e) => {
        e.preventDefault();

        try {

            if (editingId) {

                await api.put(`/students/${editingId}`, {
                    name: formData.name,
                    email: formData.email
                });

                alert("Student Updated Successfully");

                setEditingId(null);

            } else {

                await api.post("/students", formData);

                alert("Student Added Successfully");
            }

            setFormData({
                name: "",
                email: "",
                password: ""
            });

            fetchStudents();

        } catch (error) {
            alert(error.response?.data?.message || "Operation Failed");
        }
    };

    const editStudent = (student) => {
        setEditingId(student.id);

        setFormData({
            name: student.name,
            email: student.email,
            password: ""
        });
    };

    const deleteStudent = async (id) => {

        const confirmDelete = window.confirm(
            "Are you sure you want to delete this student?"
        );

        if (!confirmDelete) return;

        try {

            const token = localStorage.getItem("token");

            await api.delete(`/students/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            alert("Student Deleted Successfully");

            fetchStudents();

        } catch (error) {
            alert(error.response?.data?.message || "Delete Failed");
        }
    };

    const logout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    return (
        <div className="container mt-5">

            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Student Management</h2>

                <button
                    className="btn btn-danger"
                    onClick={logout}
                >
                    Logout
                </button>
            </div>

            <div className="card shadow p-4 mb-4">

                <h4 className="mb-3">
                    {editingId ? "Update Student" : "Add Student"}
                </h4>

                <form onSubmit={saveStudent}>

                    <div className="mb-3">
                        <input
                            type="text"
                            className="form-control"
                            name="name"
                            placeholder="Enter Name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <input
                            type="email"
                            className="form-control"
                            name="email"
                            placeholder="Enter Email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {!editingId && (
                        <div className="mb-3">
                            <input
                                type="password"
                                className="form-control"
                                name="password"
                                placeholder="Enter Password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    )}

                    <button
                        className={`btn ${
                            editingId ? "btn-warning" : "btn-primary"
                        }`}
                        type="submit"
                    >
                        {editingId ? "Update Student" : "Add Student"}
                    </button>

                </form>

            </div>

            <div className="card shadow p-3">

                <h4 className="mb-3">Students List</h4>

                <table className="table table-bordered table-hover">

                    <thead className="table-dark">

                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th width="180">Action</th>
                        </tr>

                    </thead>

                    <tbody>

                        {students.map((student) => (

                            <tr key={student.id}>

                                <td>{student.id}</td>
                                <td>{student.name}</td>
                                <td>{student.email}</td>

                                <td>

                                    <button
                                        className="btn btn-warning btn-sm me-2"
                                        onClick={() => editStudent(student)}
                                    >
                                        Edit
                                    </button>

                                    {userRole === "admin" && (

                                        <button
                                            className="btn btn-danger btn-sm"
                                            onClick={() => deleteStudent(student.id)}
                                        >
                                            Delete
                                        </button>

                                    )}

                                </td>

                            </tr>

                        ))}

                    </tbody>

                </table>

            </div>

        </div>
    );
}

export default Students;