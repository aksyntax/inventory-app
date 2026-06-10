const Product = require("../models/Product");
const cloudinary = require("../config/cloudinary");

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Get all products with filters
exports.getProducts = async (req, res) => {
  try {
    const { search, minPrice, maxPrice, startDate, endDate, page = 1 } = req.query;
    const limit = 10;
    const skip = (page - 1) * limit;

    let filter = {};

    // Search by product name
    if (search) {
      const escapedSearch = escapeRegex(search.trim());
      filter.productName = { $regex: `\\b${escapedSearch}\\b`, $options: "i" };
    }

    // Price range filter
    if (minPrice !== undefined && minPrice !== "" || maxPrice !== undefined && maxPrice !== "") {
      filter.price = {};
      if (minPrice !== undefined && minPrice !== "") filter.price.$gte = parseFloat(minPrice);
      if (maxPrice !== undefined && maxPrice !== "") filter.price.$lte = parseFloat(maxPrice);
    }

    // Date range filter
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }

    const products = await Product.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    const total = await Product.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    res.json({
      products,
      pagination: {
        current: page,
        total: totalPages,
        totalItems: total,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single product
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create product
exports.createProduct = async (req, res) => {
  try {
    const { productName, price } = req.body;

    if (!productName || !price) {
      return res.status(400).json({ message: "Product name and price are required" });
    }

    const images = [];

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        images.push({
          url: file.path,
          publicId: file.filename,
        });
      }
    }

    const product = new Product({
      productName,
      price: parseFloat(price),
      images,
    });

    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update product
exports.updateProduct = async (req, res) => {
  try {
    const { productName, price } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) return res.status(404).json({ message: "Product not found" });

    if (productName) product.productName = productName;
    if (price) product.price = parseFloat(price);

    // Handle new images
    if (req.files && req.files.length > 0) {
      // Delete old images from Cloudinary
      for (const image of product.images) {
        if (image.publicId) {
          await cloudinary.uploader.destroy(image.publicId);
        }
      }

      // Add new images
      product.images = [];
      for (const file of req.files) {
        product.images.push({
          url: file.path,
          publicId: file.filename,
        });
      }
    }

    await product.save();
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) return res.status(404).json({ message: "Product not found" });

    // Delete images from Cloudinary
    for (const image of product.images) {
      if (image.publicId) {
        await cloudinary.uploader.destroy(image.publicId);
      }
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
