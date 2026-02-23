const express = require('express');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});
// Middleware
app.use(bodyParser.json());

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables. Check your .env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
console.log('Successfully initialized Supabase client.');

// ======== SUPABASE QUERY HELPERS ========
// Wrapper to handle Supabase queries with error handling
const queryHelper = {
  // SELECT queries
  select: async (table, filters = {}, options = {}) => {
    let query = supabase.from(table).select(options.select || '*');
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        query = query.eq(key, value);
      }
    });

    if (options.limit) query = query.limit(options.limit);
    if (options.offset) query = query.offset(options.offset);
    if (options.order) {
      const [column, ascending] = options.order;
      query = query.order(column, { ascending });
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // Raw SELECT (for complex queries)
  selectRaw: async (sql) => {
    const { data, error } = await supabase.rpc('sql_exec', { sql });
    if (error) throw error;
    return data;
  },

  // INSERT query
  insert: async (table, values) => {
    const { data, error } = await supabase.from(table).insert([values]).select();
    if (error) throw error;
    return data?.[0] || { id: null };
  },

  // UPDATE query
  update: async (table, values, filters) => {
    let query = supabase.from(table).update(values);
    
    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });

    const { data, error, count } = await query.select();
    if (error) throw error;
    return { data, affectedRows: count || 0 };
  },

  // DELETE query
  delete: async (table, filters) => {
    let query = supabase.from(table).delete();
    
    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });

    const { error, count } = await query;
    if (error) throw error;
    return { affectedRows: count || 0 };
  }
};

// ======== DATABASE OPERATIONS ========
const db = {
  // GET all with optional filters
  selectAll: async (table, filters = {}) => {
    return await queryHelper.select(table, filters);
  },

  // GET by ID
  selectById: async (table, id) => {
    const data = await queryHelper.select(table, { id });
    return data;
  },

  // CREATE
  insert: async (table, values) => {
    return await queryHelper.insert(table, values);
  },

  // UPDATE
  update: async (table, values, filters) => {
    return await queryHelper.update(table, values, filters);
  },

  // DELETE
  delete: async (table, filters) => {
    return await queryHelper.delete(table, filters);
  }
};

module.exports = { supabase, queryHelper };

// Dashboard routes
const dashboardRoutes = require('./routes/dashboardRoutes');
app.use('/api/dashboard', dashboardRoutes(supabase));

// Routes
var routes = express.Router();
app.use('/api', routes);

routes.get('/', (req, res) => {
  res.send('Welcome to the DB Market API');
});

// GET all vendors
routes.get('/vendor', async (req, res) => {
  try {
    const vendors = await db.selectAll('vendor');
    res.json(vendors);
  } catch (err) {
    console.error('Error fetching vendors:', err.message);
    res.status(500).send('Error fetching vendors');
  }
});

// GET vendor by ID
routes.get('/vendor/:vid', async (req, res) => {
  try {
    const vendors = await db.selectById('vendor', parseInt(req.params.vid));
    if (!vendors || vendors.length === 0) {
      return res.status(404).json({ error: 'Vendor not found' });
    }
    res.json(vendors);
  } catch (err) {
    console.error('Error fetching vendor:', err.message);
    res.status(500).send('Error fetching vendor');
  }
});

// PUT update vendor details
routes.put('/vendor/:vid', async (req, res) => {
  try {
    const vid = parseInt(req.params.vid);
    const { name, phone, email, description, owner, logo } = req.body;

    if (!name) return res.status(400).json({ error: 'name is required' });

    const { data, affectedRows } = await db.update('vendor', 
      { name, phone: phone || '', email: email || '', description: description || '', owner: owner || '', logo: logo || null },
      { id: vid }
    );

    if (affectedRows === 0) {
      return res.status(404).json({ error: 'Vendor not found' });
    }

    const updated = await db.selectById('vendor', vid);
    res.json({ message: 'Vendor updated', vendor: updated[0] });
  } catch (err) {
    console.error('Error updating vendor:', err.message);
    res.status(500).json({ error: 'Error updating vendor' });
  }
});

// DELETE vendor
routes.delete('/vendor/:vid', async (req, res) => {
  try {
    const vid = parseInt(req.params.vid);

    // Delete vendor_auth records first
    await db.delete('vendor_auth', { vendor_id: vid });

    // Then delete vendor
    const { affectedRows } = await db.delete('vendor', { id: vid });

    if (affectedRows === 0) {
      return res.status(404).json({ error: 'Vendor not found' });
    }

    res.json({ message: 'Vendor account deleted' });
  } catch (err) {
    console.error('Error deleting vendor:', err.message);
    res.status(500).json({ error: 'Error deleting vendor account' });
  }
});

// GET products for vendor
routes.get('/vendor/:vid/product', async (req, res) => {
  try {
    const products = await db.selectAll('product', { vid: parseInt(req.params.vid) });
    res.json(products);
  } catch (err) {
    console.error('Error fetching products:', err.message);
    res.status(500).send('Error fetching products');
  }
});

// POST create new product for vendor
routes.post('/vendor/:vid/product', async (req, res) => {
  try {
    const vid = parseInt(req.params.vid);
    const { name, description, count, price } = req.body;

    if (!name) return res.status(400).json({ error: 'name is required' });

    const newProduct = await db.insert('product', {
      name,
      description: description || '',
      count: count || 0,
      price: price || 0,
      vid
    });

    res.status(201).json({ message: 'Product created', product: newProduct });
  } catch (err) {
    console.error('Error creating product:', err.message);
    res.status(500).json({ error: 'Error creating product' });
  }
});

// PUT update product
routes.put('/product/:pid', async (req, res) => {
  try {
    const pid = parseInt(req.params.pid);
    const { name, description, count, price } = req.body;

    if (!name) return res.status(400).json({ error: 'name is required' });

    const { affectedRows } = await db.update('product',
      { name, description: description || '', count: count || 0, price: price || 0 },
      { id: pid }
    );

    if (affectedRows === 0) return res.status(404).json({ error: 'Product not found' });

    const updated = await db.selectById('product', pid);
    res.json({ message: 'Product updated', product: updated[0] });
  } catch (err) {
    console.error('Error updating product:', err.message);
    res.status(500).json({ error: 'Error updating product' });
  }
});

// DELETE product
routes.delete('/product/:pid', async (req, res) => {
  try {
    const pid = parseInt(req.params.pid);
    const { affectedRows } = await db.delete('product', { id: pid });

    if (affectedRows === 0) return res.status(404).json({ error: 'Product not found' });

    res.json({ message: 'Product deleted' });
  } catch (err) {
    console.error('Error deleting product:', err.message);
    res.status(500).json({ error: 'Error deleting product' });
  }
});

// GET vendor sales (vendor-specific)
routes.get('/vendor/:vid/sale', async (req, res) => {
  try {
    const vid = parseInt(req.params.vid);
    // Get sales for products belonging to this vendor
    const { data, error } = await supabase
      .from('saleitem')
      .select('sale!inner(*), product!inner(*)')
      .eq('product.vid', vid);
    
    if (error) throw error;
    
    // Extract unique sales
    const saleMap = new Map();
    data?.forEach(item => {
      if (!saleMap.has(item.sale.id)) {
        saleMap.set(item.sale.id, item.sale);
      }
    });
    
    res.json(Array.from(saleMap.values()));
  } catch (err) {
    console.error('Error fetching sales:', err.message);
    res.status(500).send('Error fetching sales');
  }
});

// GET sale by ID
routes.get('/sale/:sid', async (req, res) => {
  try {
    const sales = await db.selectById('sale', parseInt(req.params.sid));
    if (!sales || sales.length === 0) {
      return res.status(404).json({ error: 'Sale not found' });
    }
    res.json(sales);
  } catch (err) {
    console.error('Error fetching sale:', err.message);
    res.status(500).send('Error fetching sales');
  }
});

// GET sale items
routes.get('/sale/:sid/item', async (req, res) => {
  try {
    const items = await db.selectAll('saleitem', { sid: parseInt(req.params.sid) });
    res.json(items);
  } catch (err) {
    console.error('Error fetching sale items:', err.message);
    res.status(500).send('Error fetching saleitems');
  }
});

// GET sale products
routes.get('/sale/:sid/product', async (req, res) => {
  try {
    const sid = parseInt(req.params.sid);
    const { data, error } = await supabase
      .from('saleitem')
      .select('product(*)')
      .eq('sid', sid);
    
    if (error) throw error;
    
    const products = data?.map(item => item.product) || [];
    res.json(products);
  } catch (err) {
    console.error('Error fetching sale products:', err.message);
    res.status(500).send('Error fetching saleitems');
  }
});

// GET sale vendors
routes.get('/sale/:sid/vendor', async (req, res) => {
  try {
    const sid = parseInt(req.params.sid);
    const { data, error } = await supabase
      .from('saleitem')
      .select('product!inner(vendor(*))')
      .eq('sid', sid);
    
    if (error) throw error;
    
    // Extract unique vendors
    const vendorMap = new Map();
    data?.forEach(item => {
      if (item.product?.vendor && !vendorMap.has(item.product.vendor.id)) {
        vendorMap.set(item.product.vendor.id, item.product.vendor);
      }
    });
    
    res.json(Array.from(vendorMap.values()));
  } catch (err) {
    console.error('Error fetching vendors:', err.message);
    res.status(500).send('Error fetching vendors');
  }
});

// GET product by ID
routes.get('/product/:pid', async (req, res) => {
  try {
    const products = await db.selectById('product', parseInt(req.params.pid));
    if (!products || products.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(products);
  } catch (err) {
    console.error('Error fetching product:', err.message);
    res.status(500).send('Error fetching product');
  }
});

// Vendor registration: create vendor row and vendor_auth (hashed password)
routes.post('/vendor/register', async (req, res) => {
  const { name, phone, email, description, owner, password, logo } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'name, email and password are required' });
  }

  try {
    // Insert vendor first
    const newVendor = await db.insert('vendor', {
      name,
      phone: phone || '',
      email: email || '',
      description: description || '',
      owner: owner || '',
      logo: logo || null
    });

    const vendorId = newVendor.id;

    // Hash the password
    const hashed = await bcrypt.hash(password, 10);

    // Insert into vendor_auth
    await db.insert('vendor_auth', {
      vendor_id: vendorId,
      email,
      password: hashed
    });

    // Fetch and return created vendor (without password)
    const vendor = await db.selectById('vendor', vendorId);
    res.status(201).json({ vendor: vendor[0] || newVendor });
  } catch (err) {
    console.error('Error creating vendor:', err.message);
    return res.status(500).json({ error: 'Error creating vendor' });
  }
});

// Vendor login: authenticate using vendor_auth table
routes.post('/vendor/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });

  try {
    const authRecords = await db.selectAll('vendor_auth', { email });

    if (!authRecords || authRecords.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const auth = authRecords[0];
    const match = await bcrypt.compare(password, auth.password);

    if (!match) return res.status(401).json({ error: 'Invalid credentials' });

    // Fetch vendor info
    const vendors = await db.selectById('vendor', auth.vendor_id);
    const vendor = vendors && vendors[0];

    // Return vendor info (no password). Include vendor_id for compatibility with frontend
    return res.json({ vendor_id: vendor?.id, vendor });
  } catch (err) {
    console.error('Error during login:', err.message);
    return res.status(500).json({ error: 'Server error' });
  }
});

  // Vendor forgot-password: verify vendor details and set a new hashed password
  routes.post('/vendor/forgot-password', async (req, res) => {
    const { email, phone, owner, newPassword } = req.body;

    if (!email || !newPassword) return res.status(400).json({ error: 'email and newPassword are required' });

    try {
      // Find vendor by provided details
      let query = supabase.from('vendor').select('*').eq('email', email);
      if (phone) query = query.eq('phone', phone);
      if (owner) query = query.eq('owner', owner);

      const { data: vendors, error: vendorError } = await query;
      if (vendorError) throw vendorError;

      if (!vendors || vendors.length === 0) {
        return res.status(404).json({ error: 'Vendor not found or details do not match' });
      }

      const vendor = vendors[0];

      // Hash new password
      const hashed = await bcrypt.hash(newPassword, 10);

      // Check if vendor_auth exists
      const authRecords = await db.selectAll('vendor_auth', { vendor_id: vendor.id });

      if (authRecords && authRecords.length > 0) {
        // Update existing auth record
        await db.update('vendor_auth', { password: hashed }, { vendor_id: vendor.id });
        return res.json({ message: 'Password updated' });
      } else {
        // Create new auth record
        await db.insert('vendor_auth', {
          vendor_id: vendor.id,
          email,
          password: hashed
        });
        return res.json({ message: 'Password set' });
      }
    } catch (err) {
      console.error('Error in forgot-password:', err.message);
      return res.status(500).json({ error: 'Server error' });
    }
  });
// GET /api/product - return paginated products and total count
routes.get('/product', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, parseInt(req.query.limit) || 20);
    const search = req.query.search || '';

    // 1. Calculate the 0-indexed range for Supabase
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // 2. Get total count
    let countQuery = supabase.from('product').select('*', { count: 'exact', head: true });
    if (search) {
      countQuery = countQuery.ilike('name', `%${search}%`);
    }
    const { count: total, error: countError } = await countQuery;
    if (countError) throw countError;

    // 3. Fetch paginated results using .range()
    let dataQuery = supabase.from('product').select('*');
    if (search) {
      dataQuery = dataQuery.ilike('name', `%${search}%`);
    }
    
    // Use .range(from, to) instead of limit/offset
    dataQuery = dataQuery.range(from, to);
    
    const { data: results, error } = await dataQuery;
    if (error) throw error;

    res.json({ products: results || [], total: total || 0 });
  } catch (err) {
    console.error('Error fetching products:', err.message);
    res.status(500).send('Error fetching products');
  }
});

routes.get('/product/:pid/item', async (req, res) => {
  try {
    const items = await db.selectAll('saleitem', { pid: parseInt(req.params.pid) });
    res.json(items);
  } catch (err) {
    console.error('Error fetching sale items:', err.message);
    res.status(500).send('Error fetching saleitems');
  }
});

routes.get('/booth', async (req, res) => {
  try {
    const booths = await db.selectAll('booth');
    res.json(booths);
  } catch (err) {
    console.error('Error fetching booths:', err.message);
    res.status(500).send('Error fetching booths');
  }
});

routes.get('/booth/:bid', async (req, res) => {
  try {
    const booths = await db.selectById('booth', parseInt(req.params.bid));
    if (!booths || booths.length === 0) {
      return res.status(404).json({ error: 'Booth not found' });
    }
    res.json(booths);
  } catch (err) {
    console.error('Error fetching booth:', err.message);
    res.status(500).send('Error fetching booths');
  }
});

// GET reservations for a booth (optional day filter)
routes.get('/booth/:bid/reservation', async (req, res) => {
  try {
    const bid = parseInt(req.params.bid);
    const day = req.query.day; // e.g. 2025-12-02

    let query = supabase.from('reservation').select('*').eq('bid', bid);

    if (day) {
      query = query.gte('date', `${day}T00:00:00`).lte('date', `${day}T23:59:59`);
    }

    const { data: results, error } = await query;
    if (error) throw error;

    res.json(results || []);
  } catch (err) {
    console.error('Error fetching reservations:', err.message);
    res.status(500).send('Error fetching reservations');
  }
});

// GET all reservations
routes.get('/reservation', async (req, res) => {
  try {
    const reservations = await db.selectAll('reservation');
    res.json(reservations);
  } catch (err) {
    console.error('Error fetching reservations:', err.message);
    res.status(500).send('Error fetching reservations');
  }
});

// POST create reservation
routes.post('/reservation', async (req, res) => {
  try {
    const { vid, bid, date, duration } = req.body;

    if (!vid || !bid || !date || !duration) {
      return res.status(400).send('Missing required reservation fields');
    }

    const newReservation = await db.insert('reservation', {
      vid: parseInt(vid),
      bid: parseInt(bid),
      date,
      duration: parseInt(duration)
    });

    res.status(201).json({ message: 'Reservation created successfully', id: newReservation.id });
  } catch (err) {
    console.error('Error creating reservation:', err.message);
    res.status(500).send('Error creating reservation');
  }
});

// GET booth reservations for day (/api/reservations?date=YYYY-MM-DD)
routes.get('/reservations', async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).send('Missing date parameter');
    }

    const { data, error } = await supabase
      .from('reservation')
      .select('id, bid, vid, date, duration, vendor(name)')
      .gte('date', `${date}T00:00:00`)
      .lte('date', `${date}T23:59:59`)
      .order('bid')
      .order('date');

    if (error) throw error;

    // Transform response to match expected format
    const results = data?.map(r => ({
      id: r.id,
      bid: r.bid,
      vid: r.vid,
      date: r.date,
      duration: r.duration,
      vendor_name: r.vendor?.name
    })) || [];

    res.json(results);
  } catch (err) {
    console.error('Error fetching reservations:', err.message);
    res.status(500).send('Error fetching reservations');
  }
});

// GET booth reservation for a vendor
routes.get('/vendor/:vid/booth', async (req, res) => {
  try {
    const vid = parseInt(req.params.vid);

    const { data, error } = await supabase
      .from('reservation')
      .select('booth(*), date, duration')
      .eq('vid', vid)
      .order('date', { ascending: false })
      .limit(1);

    if (error) throw error;

    const results = data?.map(r => ({
      ...r.booth,
      reservationDate: r.date,
      duration: r.duration
    })) || [];

    res.json(results);
  } catch (err) {
    console.error('Error fetching booth:', err.message);
    res.status(500).send('Error fetching booth');
  }
});


// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});