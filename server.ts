import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import bcrypt from "bcryptjs";

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("marketplace.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    email TEXT UNIQUE,
    password TEXT,
    full_name TEXT,
    contact_number TEXT,
    whatsapp_number TEXT,
    business_name TEXT,
    address TEXT,
    profile_image TEXT,
    role TEXT DEFAULT 'user',
    status TEXT DEFAULT 'Active',
    category TEXT,
    can_sell INTEGER DEFAULT 1,
    is_suspended INTEGER DEFAULT 0,
    total_orders INTEGER DEFAULT 0,
    pending_orders INTEGER DEFAULT 0,
    bkash TEXT,
    nagad TEXT,
    rocket TEXT,
    binance TEXT,
    otp TEXT,
    is_verified INTEGER DEFAULT 0,
    pending_role TEXT,
    deletion_requested INTEGER DEFAULT 0,
    lastLogin TEXT,
    lastActive TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
  CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    description TEXT,
    price REAL,
    category TEXT,
    stock INTEGER,
    image_url TEXT,
    seller_id INTEGER,
    status TEXT DEFAULT 'pending',
    FOREIGN KEY (seller_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
  );

  INSERT OR IGNORE INTO settings (key, value) VALUES ('ai_automation_enabled', '0');

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER,
    user_id INTEGER,
    quantity INTEGER,
    total_price REAL,
    payment_method TEXT,
    sender_number TEXT,
    transaction_id TEXT,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
  CREATE INDEX IF NOT EXISTS idx_orders_product_id ON orders(product_id);

  CREATE TABLE IF NOT EXISTS cart (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    product_id INTEGER,
    quantity INTEGER,
    added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
  );

  CREATE TABLE IF NOT EXISTS seller_applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    store_name TEXT,
    description TEXT,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS payment_methods (
    id TEXT PRIMARY KEY,
    name TEXT,
    identifier TEXT,
    type TEXT,
    instructions TEXT,
    is_enabled INTEGER DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS pending_admin_actions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    target_user_id INTEGER,
    admin_id INTEGER,
    action_type TEXT,
    description TEXT,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (target_user_id) REFERENCES users(id),
    FOREIGN KEY (admin_id) REFERENCES users(id)
  );
`);

try {
  db.exec("ALTER TABLE orders ADD COLUMN user_id INTEGER REFERENCES users(id)");
} catch (e) {
  // Column might already exist
}

// Add new columns if they don't exist
try {
  db.exec("ALTER TABLE users ADD COLUMN whatsapp_number TEXT");
} catch (e) {
  // Column might already exist
}
try {
  db.exec("ALTER TABLE users ADD COLUMN business_name TEXT");
} catch (e) {
  // Column might already exist
}

// Seed Admin if not exists
const admin = db.prepare("SELECT * FROM users WHERE email = ?").get("admin@yourwebsite.com");
if (!admin) {
  const hashedPassword = bcrypt.hashSync("Admin@12345", 10);
  db.prepare("INSERT INTO users (username, email, password, full_name, contact_number, role, status, is_verified) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").run(
    "SuperAdmin",
    "admin@yourwebsite.com",
    hashedPassword,
    "System Administrator",
    "+1234567890",
    "super_admin",
    "Active",
    1
  );
}

// Seed Demo Sellers if empty
const sellerCount = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'seller'").get() as { count: number };
if (sellerCount.count === 0) {
  const demoSellers = [
    { full_name: "Gadget Hub", username: "gadget_hub", email: "seller1@demo.com", contact_number: "01710000001", password: bcrypt.hashSync("Seller@123", 10) },
    { full_name: "Fashion Store", username: "fashion_store", email: "seller2@demo.com", contact_number: "01710000002", password: bcrypt.hashSync("Seller@123", 10) },
    { full_name: "Home Essentials", username: "home_essentials", email: "seller3@demo.com", contact_number: "01710000003", password: bcrypt.hashSync("Seller@123", 10) },
  ];
  const insert = db.prepare("INSERT INTO users (full_name, username, email, contact_number, password, role, status, is_verified) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
  for (const s of demoSellers) {
    insert.run(s.full_name, s.username, s.email, s.contact_number, s.password, "seller", "Active", 1);
  }
}

// Update existing demo admin if it exists
try {
  const hashedPassword = bcrypt.hashSync("Admin@123", 10);
  db.prepare("UPDATE users SET email = ?, password = ? WHERE email = ?").run("admin@demo.com", hashedPassword, "admin1@demo.com");
} catch (e) {
  // Ignore
}

// Seed Demo Customers if empty
const customerCount = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'user'").get() as { count: number };
if (customerCount.count === 0) {
  const demoCustomers = [
    { full_name: "John Doe", username: "johndoe", email: "user1@demo.com", contact_number: "01910000001", password: bcrypt.hashSync("User@123", 10) },
    { full_name: "Jane Smith", username: "janesmith", email: "user2@demo.com", contact_number: "01910000002", password: bcrypt.hashSync("User@123", 10) },
  ];
  const insert = db.prepare("INSERT INTO users (full_name, username, email, contact_number, password, role, status, is_verified) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
  for (const c of demoCustomers) {
    insert.run(c.full_name, c.username, c.email, c.contact_number, c.password, "user", "Active", 1);
  }
}

// Seed some initial products if empty
const productCount = db.prepare("SELECT COUNT(*) as count FROM products").get() as { count: number };
if (productCount.count === 0) {
  // Get seller IDs
  const seller1 = db.prepare("SELECT id FROM users WHERE email = 'seller1@demo.com'").get() as { id: number };
  const seller2 = db.prepare("SELECT id FROM users WHERE email = 'seller2@demo.com'").get() as { id: number };
  const seller3 = db.prepare("SELECT id FROM users WHERE email = 'seller3@demo.com'").get() as { id: number };

  const seedProducts = [
    { name: "Wireless Noise-Cancelling Headphones", description: "Premium over-ear headphones with active noise cancellation and 30-hour battery life.", price: 299.99, category: "Electronics", stock: 50, image_url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80", seller_id: seller1?.id || 1, status: 'approved' },
    { name: "Smart Watch Series 8", description: "Advanced health tracking, fitness metrics, and seamless connectivity.", price: 399.00, category: "Electronics", stock: 20, image_url: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&q=80", seller_id: seller1?.id || 1, status: 'approved' },
    { name: "Minimalist Cotton T-Shirt", description: "Ultra-soft, breathable 100% organic cotton t-shirt for everyday wear.", price: 25.00, category: "Clothing", stock: 100, image_url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80", seller_id: seller2?.id || 1, status: 'approved' },
    { name: "Classic Denim Jacket", description: "Timeless vintage wash denim jacket with durable stitching.", price: 89.50, category: "Clothing", stock: 30, image_url: "https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=800&q=80", seller_id: seller2?.id || 1, status: 'approved' },
    { name: "Ceramic Coffee Mug Set", description: "Set of 4 handcrafted ceramic mugs, perfect for your morning brew.", price: 45.00, category: "Home & Garden", stock: 15, image_url: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=800&q=80", seller_id: seller3?.id || 1, status: 'approved' },
    { name: "Indoor Potted Plant", description: "Low-maintenance indoor plant to brighten up your living space.", price: 35.00, category: "Home & Garden", stock: 25, image_url: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=800&q=80", seller_id: seller3?.id || 1, status: 'approved' },
  ];
  const insert = db.prepare("INSERT INTO products (name, description, price, category, stock, image_url, seller_id, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
  for (const p of seedProducts) {
    insert.run(p.name, p.description, p.price, p.category, p.stock, p.image_url, p.seller_id, p.status);
  }
}

// Seed Cart and Orders for Demo Users
const cartCount = db.prepare("SELECT COUNT(*) as count FROM cart").get() as { count: number };
if (cartCount.count === 0) {
  const user1 = db.prepare("SELECT id FROM users WHERE email = 'user1@demo.com'").get() as { id: number };
  const prod1 = db.prepare("SELECT id FROM products LIMIT 1").get() as { id: number };
  if (user1 && prod1) {
    db.prepare("INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)").run(user1.id, prod1.id, 2);
    db.prepare("INSERT INTO orders (product_id, user_id, quantity, total_price, payment_method, status) VALUES (?, ?, ?, ?, ?, ?)").run(prod1.id, user1.id, 1, 299.99, 'bKash', 'completed');
    db.prepare("INSERT INTO orders (product_id, user_id, quantity, total_price, payment_method, status) VALUES (?, ?, ?, ?, ?, ?)").run(prod1.id, user1.id, 1, 299.99, 'Nagad', 'pending');
    db.prepare("INSERT INTO orders (product_id, user_id, quantity, total_price, payment_method, status) VALUES (?, ?, ?, ?, ?, ?)").run(prod1.id, user1.id, 1, 299.99, 'Rocket', 'cancelled');
  }
}

// Middleware
const authenticate = (req: any, res: any, next: any) => {
  const userId = req.headers['x-user-id'];
  if (!userId) return res.status(401).json({ error: "Unauthorized. User ID missing." });
  
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId) as any;
  if (!user) return res.status(401).json({ error: "Unauthorized. User not found." });
  if (user.is_suspended) return res.status(403).json({ error: "Account suspended." });
  
  req.user = user;
  next();
};

const authorize = (roles: string[]) => {
  return (req: any, res: any, next: any) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Forbidden. Insufficient permissions." });
    }
    next();
  };
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // --- API Routes ---

  // Products
  app.get("/api/products", (req, res) => {
    try {
      const products = db.prepare("SELECT * FROM products").all();
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  app.get("/api/products/:id", (req, res) => {
    try {
      const product = db.prepare("SELECT * FROM products WHERE id = ?").get(req.params.id);
      if (product) res.json(product);
      else res.status(404).json({ error: "Product not found" });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/products", authenticate, (req, res) => {
    try {
      const { name, description, price, category, stock, image_url, seller_id } = req.body;
      
      // Only sellers or admins can create products
      if (req.user.role === 'user') {
        return res.status(403).json({ error: "Only sellers can create products" });
      }

      const result = db.prepare("INSERT INTO products (name, description, price, category, stock, image_url, seller_id, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
        .run(name, description, price, category, stock, image_url, seller_id, 'pending');
      res.json({ id: result.lastInsertRowid });
    } catch (error) {
      res.status(500).json({ error: "Failed to create product" });
    }
  });

  app.post("/api/products/:id/approve", authenticate, authorize(['admin', 'super_admin']), (req, res) => {
    try {
      db.prepare("UPDATE products SET status = 'approved' WHERE id = ?").run(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to approve product" });
    }
  });

  app.post("/api/products/:id/reject", authenticate, authorize(['admin', 'super_admin']), (req, res) => {
    try {
      db.prepare("UPDATE products SET status = 'rejected' WHERE id = ?").run(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to reject product" });
    }
  });

  app.put("/api/products/:id", authenticate, (req, res) => {
    try {
      const { name, description, price, category, stock, image_url } = req.body;
      const product = db.prepare("SELECT * FROM products WHERE id = ?").get(req.params.id) as any;
      
      if (!product) return res.status(404).json({ error: "Product not found" });
      
      // Only owner or admin can edit
      if (product.seller_id !== req.user.id && !['admin', 'super_admin'].includes(req.user.role)) {
        return res.status(403).json({ error: "Unauthorized to edit this product" });
      }

      db.prepare("UPDATE products SET name = ?, description = ?, price = ?, category = ?, stock = ?, image_url = ? WHERE id = ?")
        .run(name, description, price, category, stock, image_url, req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to update product" });
    }
  });

  app.delete("/api/products/:id", authenticate, (req, res) => {
    try {
      const product = db.prepare("SELECT * FROM products WHERE id = ?").get(req.params.id) as any;
      if (!product) return res.status(404).json({ error: "Product not found" });

      if (product.seller_id !== req.user.id && !['admin', 'super_admin'].includes(req.user.role)) {
        return res.status(403).json({ error: "Unauthorized to delete this product" });
      }

      db.prepare("DELETE FROM products WHERE id = ?").run(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete product" });
    }
  });

  // Orders
  app.post("/api/orders", authenticate, (req, res) => {
    try {
      const { product_id, user_id, quantity, total_price, payment_method, sender_number, transaction_id } = req.body;
      const result = db.prepare("INSERT INTO orders (product_id, user_id, quantity, total_price, payment_method, sender_number, transaction_id) VALUES (?, ?, ?, ?, ?, ?, ?)")
        .run(product_id, user_id || req.user.id, quantity, total_price, payment_method, sender_number, transaction_id);
      res.json({ id: result.lastInsertRowid });
    } catch (error) {
      res.status(500).json({ error: "Failed to create order" });
    }
  });

  app.post("/api/seller-applications", authenticate, (req, res) => {
    try {
      const { storeName, description } = req.body;
      const userId = req.user.id;
      db.prepare("INSERT INTO seller_applications (user_id, store_name, description, status) VALUES (?, ?, ?, ?)")
        .run(userId, storeName, description, 'pending');
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to submit application" });
    }
  });

  app.post("/api/seed-demo-orders", authenticate, authorize(['admin', 'super_admin']), (req, res) => {
    try {
      const products = db.prepare("SELECT id, price, seller_id FROM products LIMIT 10").all();
      const users = db.prepare("SELECT id FROM users WHERE role = 'user' LIMIT 5").all();
      
      if (products.length === 0 || users.length === 0) {
        return res.status(400).json({ error: "Need products and users to seed orders" });
      }

      for (let i = 0; i < 20; i++) {
        const product = products[Math.floor(Math.random() * products.length)];
        const user = users[Math.floor(Math.random() * users.length)];
        
        db.prepare("INSERT INTO orders (product_id, user_id, quantity, total_price, status, created_at) VALUES (?, ?, ?, ?, ?, ?)")
          .run(product.id, user.id, 1, product.price, ['pending', 'processing', 'completed'][Math.floor(Math.random() * 3)], new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString());
      }
      res.json({ success: true, message: "Demo orders added" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to seed demo orders" });
    }
  });

  app.get("/api/seller-orders", authenticate, (req, res) => {
    try {
      const sellerId = req.user.id;
      const orders = db.prepare(`
        SELECT orders.*, products.name as product_name, products.seller_id 
        FROM orders 
        JOIN products ON orders.product_id = products.id
        WHERE products.seller_id = ?
        ORDER BY created_at DESC
      `).all(sellerId);
      res.json(orders);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch seller orders" });
    }
  });

  app.get("/api/orders", authenticate, authorize(['admin', 'super_admin']), (req, res) => {
    try {
      const orders = db.prepare(`
        SELECT orders.*, products.name as product_name, products.seller_id 
        FROM orders 
        JOIN products ON orders.product_id = products.id
        ORDER BY created_at DESC
      `).all();
      res.json(orders);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });

  app.patch("/api/orders/:id", authenticate, (req, res) => {
    try {
      const { status } = req.body;
      const order = db.prepare("SELECT orders.*, products.seller_id FROM orders JOIN products ON orders.product_id = products.id WHERE orders.id = ?").get(req.params.id) as any;
      
      if (!order) return res.status(404).json({ error: "Order not found" });
      
      // Only seller of the product or admin can update status
      if (order.seller_id !== req.user.id && !['admin', 'super_admin'].includes(req.user.role)) {
        return res.status(403).json({ error: "Unauthorized to update this order" });
      }

      db.prepare("UPDATE orders SET status = ? WHERE id = ?").run(status, req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to update order" });
    }
  });

  app.delete("/api/orders/:id", authenticate, authorize(['super_admin']), (req, res) => {
    try {
      db.prepare("DELETE FROM orders WHERE id = ?").run(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete order" });
    }
  });

  app.get("/api/users/:id/orders", authenticate, (req, res) => {
    try {
      if (parseInt(req.params.id) !== req.user.id && !['admin', 'super_admin'].includes(req.user.role)) {
        return res.status(403).json({ error: "Unauthorized" });
      }
      const orders = db.prepare(`
        SELECT orders.*, products.name as product_name, products.image_url
        FROM orders 
        JOIN products ON orders.product_id = products.id
        WHERE orders.user_id = ?
        ORDER BY created_at DESC
      `).all(req.params.id);
      res.json(orders);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user orders" });
    }
  });

  app.get("/api/users/:id/cart", (req, res) => {
    const cartItems = db.prepare(`
      SELECT cart.*, products.name as product_name, products.price, products.image_url
      FROM cart
      JOIN products ON cart.product_id = products.id
      WHERE cart.user_id = ?
      ORDER BY added_at DESC
    `).all(req.params.id);
    res.json(cartItems);
  });

  app.get("/api/users/:id/sales", (req, res) => {
    const sales = db.prepare(`
      SELECT orders.*, products.name as product_name, products.image_url, users.full_name as customer_name
      FROM orders 
      JOIN products ON orders.product_id = products.id
      JOIN users ON orders.user_id = users.id
      WHERE products.seller_id = ?
      ORDER BY created_at DESC
    `).all(req.params.id);
    res.json(sales);
  });

  app.post("/api/users/:id/request-deletion", (req, res) => {
    db.prepare("UPDATE users SET deletion_requested = 1 WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // Pending Admin Actions
  app.get("/api/admin/pending-actions", authenticate, authorize(['admin', 'super_admin']), (req, res) => {
    const actions = db.prepare(`
      SELECT pa.*, u.full_name as admin_name, u.email as admin_email, u.username as admin_username,
             target.full_name as target_name, target.email as target_email
      FROM pending_admin_actions pa
      JOIN users u ON pa.admin_id = u.id
      JOIN users target ON pa.target_user_id = target.id
      WHERE pa.status = 'pending'
    `).all();
    res.json(actions);
  });

  app.post("/api/admin/pending-actions", authenticate, authorize(['admin', 'super_admin']), (req, res) => {
    const { target_user_id, admin_id, action_type, description } = req.body;
    if (!description) {
        return res.status(400).json({ error: "Description is mandatory" });
    }
    const result = db.prepare("INSERT INTO pending_admin_actions (target_user_id, admin_id, action_type, description) VALUES (?, ?, ?, ?)")
      .run(target_user_id, admin_id, action_type, description);
    res.json({ id: result.lastInsertRowid });
  });

  app.post("/api/admin/pending-actions/:id/approve", authenticate, authorize(['super_admin']), (req, res) => {
    const action = db.prepare("SELECT * FROM pending_admin_actions WHERE id = ?").get(req.params.id) as any;
    if (!action) return res.status(404).json({ error: "Action not found" });

    if (action.action_type === 'delete') {
        db.prepare("DELETE FROM users WHERE id = ?").run(action.target_user_id);
    } else if (action.action_type === 'restrict') {
        db.prepare("UPDATE users SET is_suspended = 1, status = 'Restricted' WHERE id = ?").run(action.target_user_id);
    }

    db.prepare("UPDATE pending_admin_actions SET status = 'approved' WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  app.post("/api/admin/pending-actions/:id/reject", authenticate, authorize(['super_admin']), (req, res) => {
    db.prepare("UPDATE pending_admin_actions SET status = 'rejected' WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // Seller Pending Actions
  app.get("/api/seller/pending-actions", authenticate, authorize(['seller']), (req, res) => {
    const actions = db.prepare(`
      SELECT pa.*, u.full_name as admin_name, u.email as admin_email, u.username as admin_username,
             target.full_name as target_name, target.email as target_email
      FROM pending_admin_actions pa
      JOIN users u ON pa.admin_id = u.id
      JOIN users target ON pa.target_user_id = target.id
      WHERE pa.target_user_id = ?
      ORDER BY pa.created_at DESC
    `).all((req as any).user.id);
    res.json(actions);
  });

  app.post("/api/seller/pending-actions/:id/cancel", authenticate, authorize(['seller']), (req, res) => {
    const userId = (req as any).user.id;
    const action = db.prepare("SELECT * FROM pending_admin_actions WHERE id = ? AND target_user_id = ?").get(req.params.id, userId) as any;
    
    if (!action) return res.status(404).json({ error: "Action not found" });
    if (action.status !== 'pending') return res.status(400).json({ error: "Only pending actions can be cancelled" });
    
    db.prepare("UPDATE pending_admin_actions SET status = 'cancelled' WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  app.get("/api/public-settings", (req, res) => {
    try {
      const settings = db.prepare("SELECT * FROM settings WHERE key = 'marketplace_content'").all();
      const settingsObj = settings.reduce((acc: any, curr: any) => {
        acc[curr.key] = curr.value;
        return acc;
      }, {});
      res.json(settingsObj);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch public settings" });
    }
  });

  app.get("/api/settings", authenticate, authorize(['admin', 'super_admin']), (req, res) => {
    const settings = db.prepare("SELECT * FROM settings").all();
    const settingsObj = settings.reduce((acc: any, curr: any) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});
    res.json(settingsObj);
  });

  app.post("/api/settings", authenticate, authorize(['super_admin']), (req, res) => {
    const { key, value } = req.body;
    db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)").run(key, value);
    res.json({ success: true });
  });

  app.post("/api/admin/bulk-update-orders", (req, res) => {
    const { updates } = req.body; // Array of { id, status }
    
    if (!updates || !Array.isArray(updates)) {
      return res.status(400).json({ error: "Invalid updates format" });
    }

    const stmt = db.prepare("UPDATE orders SET status = ? WHERE id = ?");
    const transaction = db.transaction((updates) => {
      for (const update of updates) {
        stmt.run(update.status, update.id);
      }
    });

    try {
      transaction(updates);
      res.json({ success: true, message: `Updated ${updates.length} orders` });
    } catch (error) {
      console.error("Bulk update error:", error);
      res.status(500).json({ error: "Failed to update orders" });
    }
  });

  // Auth
  app.post("/api/register", async (req, res) => {
    const { username, email, password, role, status, full_name, pending_role, whatsapp_number, business_name } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const result = db.prepare("INSERT INTO users (username, email, password, role, status, otp, is_verified, full_name, pending_role, whatsapp_number, business_name) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
        .run(username, email, hashedPassword, role || 'user', status || 'pending', otp, 0, full_name || null, pending_role || null, whatsapp_number || null, business_name || null);
      
      res.json({ id: result.lastInsertRowid, message: "User registered successfully", demo_otp: otp });
    } catch (err: any) {
      if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        res.status(400).json({ error: "Username or Email already exists" });
      } else {
        console.error("Registration error:", err);
        res.status(500).json({ error: "Registration failed" });
      }
    }
  });

  app.post("/api/verify-otp", (req, res) => {
    const { email, otp } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email) as any;
    
    if (user && user.otp === otp) {
      db.prepare("UPDATE users SET is_verified = 1, otp = NULL WHERE id = ?").run(user.id);
      res.json({ success: true });
    } else {
      res.status(400).json({ error: "Invalid OTP" });
    }
  });

  app.post("/api/login", async (req, res) => {
    const { identifier, password, loginType } = req.body; // identifier can be email or username
    try {
      const user = db.prepare("SELECT * FROM users WHERE (username = ? OR email = ?)")
        .get(identifier, identifier) as any;
      
      if (user) {
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
          return res.status(401).json({ error: "Invalid credentials" });
        }

        if (!user.is_verified) {
          return res.status(403).json({ error: "Please verify your email first.", needsVerification: true, email: user.email });
        }
        
        if (loginType === 'admin' && !['admin', 'super_admin'].includes(user.role)) {
          return res.status(403).json({ error: "Access denied. Admin role required." });
        }

        if (loginType === 'user' && !['user', 'seller'].includes(user.role)) {
          return res.status(403).json({ error: "Access denied. Please use the Admin portal." });
        }

        if (user.status !== 'Active' && ['admin', 'super_admin'].includes(user.role)) {
          return res.status(403).json({ error: "Your admin account is pending approval from Super Admin." });
        }

        const now = new Date().toISOString();
        db.prepare("UPDATE users SET lastLogin = ?, lastActive = ? WHERE id = ?").run(now, now, user.id);

        res.json({ id: user.id, username: user.username, email: user.email, role: user.role, status: user.status, full_name: user.full_name, profile_image: user.profile_image });
      } else {
        res.status(401).json({ error: "Invalid credentials" });
      }
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // User Management
  app.post("/api/heartbeat/:id", (req, res) => {
    db.prepare("UPDATE users SET lastActive = ? WHERE id = ?").run(new Date().toISOString(), req.params.id);
    res.json({ success: true });
  });

  app.get("/api/stats", authenticate, (req, res) => {
    try {
      const sellerId = req.query.seller_id;
      
      if (sellerId) {
        // Only allow seller to see their own stats or admin
        if (parseInt(sellerId as string) !== req.user.id && !['admin', 'super_admin'].includes(req.user.role)) {
          return res.status(403).json({ error: "Unauthorized" });
        }

        const totalProducts = db.prepare("SELECT COUNT(*) as count FROM products WHERE seller_id = ?").get(sellerId) as any;
        const totalOrders = db.prepare("SELECT COUNT(*) as count FROM orders JOIN products ON orders.product_id = products.id WHERE products.seller_id = ?").get(sellerId) as any;
        const pendingOrders = db.prepare("SELECT COUNT(*) as count FROM orders JOIN products ON orders.product_id = products.id WHERE products.seller_id = ? AND orders.status = 'pending'").get(sellerId) as any;
        const completedOrders = db.prepare("SELECT COUNT(*) as count FROM orders JOIN products ON orders.product_id = products.id WHERE products.seller_id = ? AND orders.status = 'completed'").get(sellerId) as any;
        
        res.json({
          totalProducts: totalProducts.count,
          totalOrders: totalOrders.count,
          pendingOrders: pendingOrders.count,
          completedOrders: completedOrders.count
        });
      } else {
        // Only admins can see global stats
        if (!['admin', 'super_admin'].includes(req.user.role)) {
          return res.status(403).json({ error: "Forbidden" });
        }

        const totalUsers = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'user'").get() as any;
        const totalSellers = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'seller'").get() as any;
        const totalAdmins = db.prepare("SELECT COUNT(*) as count FROM users WHERE role IN ('admin', 'super_admin')").get() as any;
        const totalOrders = db.prepare("SELECT COUNT(*) as count FROM orders").get() as any;
        const pendingOrders = db.prepare("SELECT COUNT(*) as count FROM orders WHERE status = 'pending'").get() as any;
        const completedOrders = db.prepare("SELECT COUNT(*) as count FROM orders WHERE status = 'completed'").get() as any;
        const pendingActions = db.prepare("SELECT COUNT(*) as count FROM pending_admin_actions WHERE status = 'pending'").get() as any;
        
        res.json({
          totalUsers: totalUsers.count,
          totalSellers: totalSellers.count,
          totalAdmins: totalAdmins.count,
          totalOrders: totalOrders.count,
          pendingOrders: pendingOrders.count,
          completedOrders: completedOrders.count,
          pendingActions: pendingActions.count
        });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });
  app.get("/api/users", authenticate, authorize(['admin', 'super_admin']), (req, res) => {
    try {
      const users = db.prepare("SELECT id, username, email, full_name, contact_number, role, status, is_verified, createdAt FROM users").all();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.get("/api/users/:id", authenticate, (req, res) => {
    try {
      if (parseInt(req.params.id) !== req.user.id && !['admin', 'super_admin'].includes(req.user.role)) {
        return res.status(403).json({ error: "Unauthorized" });
      }
      const user = db.prepare("SELECT id, username, email, full_name, contact_number, whatsapp_number, business_name, address, profile_image, role, status, category, can_sell, is_suspended, createdAt FROM users WHERE id = ?").get(req.params.id);
      if (user) res.json(user);
      else res.status(404).json({ error: "User not found" });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.patch("/api/users/:id", authenticate, authorize(['admin', 'super_admin']), (req, res) => {
    try {
      const { role, status, full_name, contact_number, address, profile_image, can_sell, is_suspended, pending_role, category } = req.body;
      db.prepare("UPDATE users SET role = ?, status = ?, full_name = ?, contact_number = ?, address = ?, profile_image = ?, can_sell = ?, is_suspended = ?, pending_role = ?, category = ? WHERE id = ?")
        .run(role, status, full_name, contact_number, address, profile_image, can_sell, is_suspended, pending_role, category, req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to update user" });
    }
  });

  app.post("/api/admin/approve-role/:id", (req, res) => {
    const { approve, role } = req.body;
    if (approve) {
      db.prepare("UPDATE users SET role = ?, pending_role = NULL, status = 'Active' WHERE id = ?").run(role, req.params.id);
    } else {
      db.prepare("UPDATE users SET pending_role = NULL WHERE id = ?").run(req.params.id);
    }
    res.json({ success: true });
  });

  app.put("/api/profile/:id", authenticate, (req, res) => {
    try {
      if (parseInt(req.params.id) !== req.user.id && req.user.role !== 'super_admin') {
        return res.status(403).json({ error: "Unauthorized to update this profile" });
      }

      const { full_name, email, contact_number, whatsapp_number, business_name, address, profile_image, bkash, nagad, rocket, binance } = req.body;
      db.prepare("UPDATE users SET full_name = ?, email = ?, contact_number = ?, whatsapp_number = ?, business_name = ?, address = ?, profile_image = ?, bkash = ?, nagad = ?, rocket = ?, binance = ? WHERE id = ?")
        .run(full_name, email, contact_number, whatsapp_number, business_name, address, profile_image, bkash, nagad, rocket, binance, req.params.id);
      res.json({ success: true });
    } catch (err: any) {
      console.error("Profile update error:", err);
      res.status(400).json({ error: "Update failed. Email might be taken." });
    }
  });

  app.delete("/api/users/:id", authenticate, authorize(['super_admin']), (req, res) => {
    try {
      db.prepare("DELETE FROM users WHERE id = ?").run(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete user" });
    }
  });

  // Payment Methods
  app.get("/api/payment-methods", (req, res) => {
    try {
      const methods = db.prepare("SELECT * FROM payment_methods").all();
      res.json(methods);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch payment methods" });
    }
  });

  app.put("/api/payment-methods/:id", authenticate, authorize(['admin', 'super_admin']), (req, res) => {
    try {
      const { identifier, type, instructions, is_enabled } = req.body;
      db.prepare("UPDATE payment_methods SET identifier = ?, type = ?, instructions = ?, is_enabled = ? WHERE id = ?")
        .run(identifier, type, instructions, is_enabled ? 1 : 0, req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to update payment method" });
    }
  });

  // Stats
  app.get("/api/admin/stats", (req, res) => {
    const totalUsers = db.prepare("SELECT COUNT(*) as count FROM users").get() as any;
    const totalOrders = db.prepare("SELECT COUNT(*) as count FROM orders").get() as any;
    const totalRevenue = db.prepare("SELECT SUM(total_price) as sum FROM orders WHERE status = 'approved'").get() as any;
    const pendingAdmins = db.prepare("SELECT COUNT(*) as count FROM users WHERE status = 'pending' AND role IN ('admin', 'super_admin')").get() as any;
    const pendingOrders = db.prepare("SELECT COUNT(*) as count FROM orders WHERE status = 'pending'").get() as any;

    res.json({
      totalUsers: totalUsers.count,
      totalOrders: totalOrders.count,
      totalRevenue: totalRevenue.sum || 0,
      pendingAdmins: pendingAdmins.count,
      pendingOrders: pendingOrders.count
    });
  });

  // --- Vite Middleware ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
