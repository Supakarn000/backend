import express from "express";
import mysql from "mysql";
import dotenv from 'dotenv';
import gentoken from '../utils/gentoken.js'
import session from 'express-session';
import cookieParser from 'cookie-parser';
dotenv.config();


// const db = mysql.createConnection({
//     host:"localhost",
//     user:"root",
//     password:"",
//     database:"fullstock"
// })

const router = express.Router();
const db = mysql.createConnection(process.env.DATABASE_URL);

router.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: true,
    })
  );


router.use(cookieParser());

router.post("/", (req, res) => {
    const { username, password } = req.body;

    db.query("SELECT * FROM users WHERE username = ?", [username], (selectErr, selectData) => {
        if (selectErr) {
            console.error("Error checking username: " + selectErr);
            return res.status(500).json({ error: "Failed to check username" });
        }
        if (selectData.length === 0) {
            return res.status(401).json({ error: "Username not found" });
        }
        const storedPassword = selectData[0].password;
        if (password !== storedPassword) {
            return res.status(401).json({ error: "Incorrect password" });
        }
        const userId = selectData[0].userID;
        const updateTimestampQuery = "UPDATE users SET last_login = NOW() WHERE userID = ?";
        
        db.query(updateTimestampQuery, [userId], (updateErr, updateResult) => {
            if (updateErr) {
                console.error("Error updating last_login timestamp: " + updateErr);
                return res.status(500).json({ error: "Failed to update login timestamp" });
            }
            const token = gentoken(userId);
            req.session.userID = userId;
            
            return res.status(200).json({ message: "Login successful", userId ,token});
        });
    });
});


router.get("/:id", (req, res) => {

    const userId = req.cookies.userID;
    if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const q = "SELECT * FROM users WHERE userID = ?";
    db.query(q, [userId], (err, data) => {
        if (err) return res.json(err);
        if (data.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }
        return res.json(data[0]);
    });
});

export default router;
