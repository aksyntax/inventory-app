const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const upload = require("../utils/multer");

// Get all products with filters
router.get("/", productController.getProducts);

// Get single product
router.get("/:id", productController.getProduct);

// Create product with up to 4 images
router.post("/", upload.array("images", 4), productController.createProduct);

// Update product
router.put("/:id", upload.array("images", 4), productController.updateProduct);

// Delete product
router.delete("/:id", productController.deleteProduct);

module.exports = router;