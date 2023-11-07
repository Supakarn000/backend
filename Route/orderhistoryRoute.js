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
        return res.status(404)
    }
    const userID = userId;

    const orderhistory = 'SELECT * FROM orders WHERE userID = ?';

    db.query(orderhistory, [userID], (err, results) => {
        if (err) {
            res.status(500)
        } else {
            res.status(200).json(results);
        }
    });
});



export default router;
