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

router.get("/", (req, res) => {
    const q = "SELECT * FROM users";
    db.query(q, (err, data) => {
        if (err) return res.json(err);
        return res.json(data);
    });
});


router.post("/", (req, res) => {
    const user = req.body;

    if (typeof user === 'object') {
        insertSingleUser(user, res);
    } else {
        res.status(400).json({ error: "Invalid data format" });
    }

    function insertSingleUser(user, res) {
        const q = "INSERT INTO users (`username`, `email`, `password`, `isAdmin`) VALUES (?, ?, ?, ?)";
        const values = [
            user.username,
            user.email,
            user.password,
            user.isAdmin
        ];

        db.query(q, values, (err, data) => {
            if (err) {
                console.error(err);
                return res.status(500).json(err);
            }
            return res.status(201).json("User created");
        });
    }
});

router.get("/:id", (req, res) => {
    const userId = req.params.id;
    const q = "SELECT * FROM users WHERE id = ?";
    db.query(q, [userId], (err, data) => {
        if (err) return res.json(err);
        if (data.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }
        return res.json(data[0]);
    });
});



router.delete("/:id", (req, res) => {
    const userId = req.params.id;
  
    const q = "DELETE FROM users WHERE id = ?";
    
    db.query(q, [userId], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Failed to delete user" });
      }
      if (result.affectedRows > 0) {
        return res.status(200).json({ message: "User deleted successfully" });
      } else {
        return res.status(404).json({ error: "User not found" });
      }
    });
  });



  


export default router;