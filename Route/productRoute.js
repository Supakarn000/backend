import express from "express";
import mysql from "mysql";
import dotenv from 'dotenv';


const db = mysql.createConnection({
    host:"localhost",
    user:"root",
    password:"",
    database:"fullstock"
})

dotenv.config();
const router = express.Router();
//const db = mysql.createConnection(process.env.DATABASE_URL);

router.get("/", (req, res) => {
    const productType = req.query.type;
    let q = "SELECT * FROM products";

    if (productType) {
        q += ` WHERE type = ?`;
    }

    db.query(q, [productType], (err, data) => {
        if (err) {
            return err;
        }
        return res.json(data);
    });
});

router.get("/random", (req, res) => {
    const productType = req.query.type;
    let q = "SELECT * FROM products";

    if (productType) {
        q += ` WHERE type = ?`;
    }
    q += " ORDER BY RAND() LIMIT 1";

    db.query(q, [productType], (err, data) => {
        if (err) {
            return res.status(500).json(err);
        }
        return res.json(data);
    });
});

router.get('/best', (req, res) => {
    const q = 'SELECT * FROM products ORDER BY sold DESC LIMIT 1';
    db.query(q, (error, results) => {
      if (error) {
        res.status(500);
      } else {
        if (results.length > 0) {
          const bestProduct = results[0];
          res.json(bestProduct);
        } else {
          res.status(404);
        }
      }
    });
  });

  router.post("/add", (req, res) => {
    const product = req.body;

    if (typeof product === 'object') {
        insertproduct(product, res);
    } else {
        res.status(500)
    }

    function insertproduct(product, res) {
        const q = "INSERT INTO products (`name`, `image`, `description`, `type`, `price`, `instock`) VALUES (?, ?, ?, ?, ?, ?)";
        const values = [
            product.name,
            product.image,
            product.description,
            product.type,
            product.price,
            product.instock
        ];
    
        db.query(q, values, (err, data) => {
            if (err) {
                console.error(err);
                return res.status(500).json(err);
            }
            return res.status(200).json("Product created");
        });
    }
});

router.delete("/delete/:id", (req, res) => {
    const productId = req.params.id;
    
    const q = "DELETE FROM products WHERE productID = ?";

    db.query(q, [productId], (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).json(err);
        }
        return res.status(200).json("Product deleted");
    });
});

router.get("/count", (req, res) => {
    const q = "SELECT COUNT(*) AS productCount FROM products";

    db.query(q, (err, data) => {
        if (err) {
            return res.status(500).json(err);
        }

        const productCount = data[0].productCount;
        return res.json({ productCount });
    });
});

router.get("/search", (req, res) => {
    const searchQuery = req.query.query;

    const q = "SELECT * FROM products WHERE name LIKE ?";

    const searchValue = `%${searchQuery}%`;

    db.query(q, [searchValue], (err, data) => {
        if (err) {
            return res.status(500).json(err);
        }
        return res.json(data);
    });
});

router.put("/update/:id", (req, res) => {
    const productId = req.params.id;
    const updatedProduct = req.body;

    const q = "UPDATE products SET name = ?, image = ?, description = ?, type = ?, price = ?, instock = ? WHERE productID = ?";

    const values = [
        updatedProduct.name,
        updatedProduct.image,
        updatedProduct.description,
        updatedProduct.type,
        updatedProduct.price,
        updatedProduct.instock,
        productId
    ];

    db.query(q, values, (err, data) => {
        if (err) {
            return err;
        }
        return res.status(200).json("Product updated");
    });
});

export default router;
