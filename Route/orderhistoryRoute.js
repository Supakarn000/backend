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

router.get('/', (req, res) => {
    const userId = req.headers.authorization;

    if (!userId) {
        return res.status(401).json({ error: 'Authorization token not provided' });
    }
    const userID = userId;

    const selectOrdersQuery = 'SELECT * FROM orders WHERE userID = ?';

    db.query(selectOrdersQuery, [userID], (err, results) => {
        if (err) {
            console.error('Error fetching order history:', err);
            res.status(500).json({ error: 'Internal server error' });
        } else {
            res.status(200).json(results);
        }
    });
});



export default router;
