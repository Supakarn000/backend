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
router.post("/", (req,res) => {
    const { username, email, password } = req.body;
  
    if (typeof req.body !== 'object') {
      return res.status(400).json({ error: "Invalid request data" });
    }

    db.query("SELECT * FROM users WHERE email = ? OR username = ?", [email, username], (err, results) => {
      if (err) {
        return json({ error: "Database error" });
      }
      if (results.length > 0) {
        return json({ error: "Email or username already in use" });
      }
  
      const isAdmin = false;
      const insertQuery = "INSERT INTO users (username, email, password, isAdmin) VALUES (?, ?, ?, ?)";
      const values = [username, email, password, isAdmin];
  
      db.query(insertQuery, values, (err) => {
        if (err) {
          return json(err);
        }
  
        res.status(200).json({ message: "User registered successful" });
      });
    });
  });


export default router;
