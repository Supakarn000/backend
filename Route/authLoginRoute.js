import express from "express";
import mysql from "mysql";
import dotenv from 'dotenv';
import session from 'express-session';
import cookieParser from 'cookie-parser';
dotenv.config();

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
        const isAdmin = selectData[0].isAdmin;

        if (password !== storedPassword) {
            return res.status(401).json({ error: "Incorrect password" });
        }
        const userId = selectData[0].userID;

        req.session.userID = userId;
        req.session.isAdmin = isAdmin;

        res.cookie("userID", userId);
        res.cookie("isAdmin", isAdmin);
        console.log('Session userID:', req.session.userID);
        console.log('Session isAdmin:', req.session.isAdmin);

        const updateTimestampQuery = "UPDATE users SET last_login = NOW() WHERE userID = ?";
        db.query(updateTimestampQuery, [userId], (updateErr, updateResult) => {
            if (updateErr) {
                console.error("Error updating last_login timestamp: " + updateErr);
                return res.status(500).json({ error: "Failed to update login timestamp" });
            }

            return res.status(200).json({ message: "Login successful", userId, isAdmin });
        });
    });
});


router.post('/order', async (req, res) => {
    try {
        console.log('Session userID:', req.session.userID);
        const { userID, cartItems, totalPrice } = req.body;
        if (!req.session.userID) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const order = {
            userID,
            cartItems,
            totalPrice,
            orderDate: new Date(),
        };

        const insertQuery = "INSERT INTO orders (userID, cartItems, totalPrice, orderDate) VALUES (?, ?, ?, ?)";
        const decrement = "UPDATE products SET instock = instock - 1 WHERE productID = ?";
        const increment = "UPDATE products SET sold = sold + 1 WHERE productID = ?";

        const connection = await pool.getConnection();

        try {
            await connection.beginTransaction();

            const [orderResult] = await connection.query(insertQuery, [order.userID, JSON.stringify(order.cartItems), order.totalPrice, order.orderDate]);

            for (const cartItem of order.cartItems) {
                await connection.query(decrement, [cartItem.productID]);
                await connection.query(increment, [cartItem.productID]);
            }

            await connection.commit();
            connection.release();

            return res.status(201).json({ message: 'Order created successfully', order: orderResult });
        } catch (error) {
            await connection.rollback();
            connection.release();
            throw error;
        }
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ message: 'Error creating order' });
    }
});

export default router;
