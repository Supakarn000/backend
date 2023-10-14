import express from "express";
import mysql from "mysql";
import dotenv from 'dotenv';


// const db = mysql.createConnection({
//     host:"localhost",
//     user:"root",
//     password:"",
//     database:"fullstock"
// })

dotenv.config();
const router = express.Router();
const db = mysql.createConnection(process.env.DATABASE_URL);

db.connect((err) => {
    if (err) {
        console.error("Error connecting to the database: " + err.stack);
        return;
    }
});


//register
router.post("/", (req, res) => {
    const { username, email, password } = req.body;

    function insertSingleUser(username, email, password, res) {
        const isAdmin = false;

        const q = "INSERT INTO users (`username`, `email`, `password`, `isAdmin`) VALUES (?, ?, ?, ?)";
        const values = [username, email, password, isAdmin];

        db.query(q, values, (insertErr, insertResult) => {
            if (insertErr) {
                console.error("Error inserting user: " + insertErr);
                return res.status(500).json({ error: "Failed to register user" });
            }
            console.log("User registered successfully");
            res.status(200).json({ message: "User registered successfully" });
        });
    }

    if (typeof req.body === 'object') {
        db.query("SELECT * FROM users WHERE email = ?", [email], (selectEmailErr, selectEmailData) => {
            if (selectEmailErr) {
                console.error("Error checking email: " + selectEmailErr);
                return res.status(500).json({ error: "Failed to check email" });
            }
            if (selectEmailData.length > 0) {
                return res.status(400).json({ error: "Email already in use" });
            }
            db.query("SELECT * FROM users WHERE username = ?", [username], (selectUsernameErr, selectUsernameData) => {
                if (selectUsernameErr) {
                    console.error("Error checking username: " + selectUsernameErr);
                    return res.status(500).json({ error: "Failed to check username" });
                }
                if (selectUsernameData.length > 0) {
                    return res.status(400).json({ error: "Username already in use" });
                }
                insertSingleUser(username, email, password, res);
            });
        });
    } else {
        res.status(400).json({ error: "Invalid data format" });
    }
});


export default router;
