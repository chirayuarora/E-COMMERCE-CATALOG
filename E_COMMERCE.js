// ========================================
// E-COMMERCE CATALOG - MONGODB IMPLEMENTATION
// ========================================

// Connect to MongoDB (uncomment if running standalone)
// const { MongoClient } = require('mongodb');
// const uri = 'mongodb://localhost:27017';
// const client = new MongoClient(uri);

// ========================================
// 1. SCHEMA DESIGN
// ========================================

/*
Product Document Structure:
{
  _id: ObjectId,
  name: String,
  price: Number,
  category: String,
  description: String (optional),
  variants: [
    {
      _id: String,
      color: String,
      size: String,
      stock: Number
    }
  ],
  __v: Number (version key for Mongoose)
}
*/

// ========================================
// 2. CREATE COLLECTION AND INSERT SAMPLE DATA
// ========================================

// MongoDB Shell Commands:
// Use the 'ecommerce' database
use ecommerce

// Drop collection if it exists (for clean start)
db.products.drop()

// Insert sample products with nested variants
db.products.insertMany([
  {
    name: "Winter Jacket",
    price: 200,
    category: "Apparel",
    description: "Warm and stylish winter jacket for cold weather",
    variants: [
      {
        _id: "686f68ed2bf5384209b236b2",
        color: "Black",
        size: "S",
        stock: 8
      },
      {
        _id: "686f68ed2bf5384209b236b3",
        color: "Gray",
        size: "M",
        stock: 12
      }
    ]
  },
  {
    name: "Smartphone",
    price: 699,
    category: "Electronics",
    description: "Latest model smartphone with advanced features",
    variants: []
  },
  {
    name: "Running Shoes",
    price: 120,
    category: "Footwear",
    description: "Comfortable running shoes for daily exercise",
    variants: [
      {
        _id: "686f68ed2bf5384209b236af",
        color: "Red",
        size: "M",
        stock: 10
      },
      {
        _id: "686f68ed2bf5384209b236b1",
        color: "Blue",
        size: "L",
        stock: 5
      }
    ]
  },
  {
    name: "Laptop",
    price: 1299,
    category: "Electronics",
    description: "High-performance laptop for work and gaming",
    variants: [
      {
        _id: "686f68ed2bf5384209b236c1",
        color: "Silver",
        size: "15-inch",
        stock: 3
      },
      {
        _id: "686f68ed2bf5384209b236c2",
        color: "Space Gray",
        size: "13-inch",
        stock: 7
      }
    ]
  },
  {
    name: "Yoga Mat",
    price: 45,
    category: "Fitness",
    description: "Non-slip yoga mat for comfortable practice",
    variants: [
      {
        _id: "686f68ed2bf5384209b236d1",
        color: "Purple",
        size: "Standard",
        stock: 20
      },
      {
        _id: "686f68ed2bf5384209b236d2",
        color: "Green",
        size: "Extra Thick",
        stock: 15
      }
    ]
  }
])

// ========================================
// 3. QUERY OPERATIONS
// ========================================

// 3.1 Retrieve ALL products
print("\n=== All Products ===")
db.products.find().pretty()

// 3.2 Filter products by category
print("\n=== Electronics Products ===")
db.products.find({ category: "Electronics" }).pretty()

print("\n=== Apparel Products ===")
db.products.find({ category: "Apparel" }).pretty()

// 3.3 Find products with price range
print("\n=== Products under $150 ===")
db.products.find({ price: { $lt: 150 } }).pretty()

// 3.4 Project specific fields (name, price, and category only)
print("\n=== Product Names and Prices ===")
db.products.find({}, { name: 1, price: 1, category: 1, _id: 0 })

// 3.5 Access nested variant details - products with specific color
print("\n=== Products with Blue variants ===")
db.products.find({ "variants.color": "Blue" }).pretty()

// 3.6 Find products by variant size
print("\n=== Products with size M variants ===")
db.products.find({ "variants.size": "M" }).pretty()

// 3.7 Products with low stock (any variant with stock < 10)
print("\n=== Products with Low Stock Variants ===")
db.products.find({ "variants.stock": { $lt: 10 } }).pretty()

// 3.8 Project only specific variant fields
print("\n=== Products with Variant Colors Only ===")
db.products.find(
  {},
  { 
    name: 1, 
    "variants.color": 1,
    "variants.stock": 1,
    _id: 0 
  }
)

// 3.9 Count products by category
print("\n=== Product Count by Category ===")
db.products.aggregate([
  { $group: { _id: "$category", count: { $sum: 1 } } },
  { $sort: { count: -1 } }
])

// 3.10 Find products with variants and calculate total stock
print("\n=== Products with Total Stock ===")
db.products.aggregate([
  {
    $project: {
      name: 1,
      price: 1,
      category: 1,
      totalStock: { $sum: "$variants.stock" },
      variantCount: { $size: "$variants" }
    }
  }
])

// ========================================
// 4. UPDATE OPERATIONS
// ========================================

// 4.1 Update product price
print("\n=== Updating Smartphone Price ===")
db.products.updateOne(
  { name: "Smartphone" },
  { $set: { price: 649 } }
)

// 4.2 Add a new variant to existing product
print("\n=== Adding new variant to Winter Jacket ===")
db.products.updateOne(
  { name: "Winter Jacket" },
  { 
    $push: { 
      variants: {
        _id: "686f68ed2bf5384209b236b4",
        color: "Navy Blue",
        size: "L",
        stock: 6
      }
    }
  }
)

// 4.3 Update stock for a specific variant
print("\n=== Updating stock for specific variant ===")
db.products.updateOne(
  { 
    name: "Running Shoes",
    "variants._id": "686f68ed2bf5384209b236b1"
  },
  { 
    $set: { "variants.$.stock": 8 }
  }
)

// 4.4 Remove a variant
print("\n=== Removing a variant ===")
db.products.updateOne(
  { name: "Laptop" },
  { 
    $pull: { 
      variants: { _id: "686f68ed2bf5384209b236c2" }
    }
  }
)

// ========================================
// 5. MONGOOSE IMPLEMENTATION
// ========================================

/*
// Mongoose Schema Definition
const mongoose = require('mongoose');

// Variant Schema (nested)
const variantSchema = new mongoose.Schema({
  color: {
    type: String,
    required: true
  },
  size: {
    type: String,
    required: true
  },
  stock: {
    type: Number,
    required: true,
    min: 0
  }
});

// Product Schema
const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true,
    enum: ['Electronics', 'Apparel', 'Footwear', 'Fitness', 'Accessories']
  },
  description: {
    type: String,
    trim: true
  },
  variants: [variantSchema]
}, {
  timestamps: true // Adds createdAt and updatedAt
});

// Create Model
const Product = mongoose.model('Product', productSchema);

// ========================================
// MONGOOSE QUERY EXAMPLES
// ========================================

// Find all products
async function getAllProducts() {
  return await Product.find();
}

// Find products by category
async function getProductsByCategory(category) {
  return await Product.find({ category });
}

// Find product with specific variant color
async function getProductsByColor(color) {
  return await Product.find({ 'variants.color': color });
}

// Create new product
async function createProduct(productData) {
  const product = new Product(productData);
  return await product.save();
}

// Add variant to existing product
async function addVariant(productId, variantData) {
  return await Product.findByIdAndUpdate(
    productId,
    { $push: { variants: variantData } },
    { new: true }
  );
}

// Update variant stock
async function updateVariantStock(productId, variantId, newStock) {
  return await Product.findOneAndUpdate(
    { _id: productId, 'variants._id': variantId },
    { $set: { 'variants.$.stock': newStock } },
    { new: true }
  );
}

// Get products with aggregation
async function getProductStats() {
  return await Product.aggregate([
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        avgPrice: { $avg: '$price' }
      }
    },
    { $sort: { count: -1 } }
  ]);
}

// Export model
module.exports = Product;
*/

// ========================================
// 6. CREATE INDEXES FOR BETTER PERFORMANCE
// ========================================

print("\n=== Creating Indexes ===")
db.products.createIndex({ category: 1 })
db.products.createIndex({ price: 1 })
db.products.createIndex({ "variants.color": 1 })
db.products.createIndex({ name: "text", description: "text" })

// View all indexes
print("\n=== Indexes on Products Collection ===")
db.products.getIndexes()

print("\n=== Implementation Complete! ===")
