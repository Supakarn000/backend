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
  const q = "SELECT DISTINCT userID, orderDate FROM orders";
  db.query(q, (err, data) => {
      if (err){
        return res.json(err);
      }
      return res.json(data);
  });
});

router.get("/2", (req, res) => {
  const q = `
    SELECT u.userID, u.username, COUNT(o.orderID) AS total_orders, SUM(o.totalPrice) AS total_amount_spent
    FROM users u
    LEFT JOIN orders o ON u.userID = o.userID
    GROUP BY u.userID, u.username
    ORDER BY total_amount_spent DESC
  `;
  db.query(q, (err, data) => {
    if (err) {
      return err
    }
    return res.status(200).json(data);
  });
});
  



export default router;