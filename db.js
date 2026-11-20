const Database=require("better-sqlite3");
const db=new Database(process.env.DB_FILE||"bbm.sqlite");
db.pragma("journal_mode = WAL");
db.exec(`
CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY, name TEXT NOT NULL, email TEXT UNIQUE NOT NULL, phone TEXT, password_hash TEXT NOT NULL, role TEXT DEFAULT 'customer', created_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS products(id INTEGER PRIMARY KEY, slug TEXT UNIQUE, name TEXT NOT NULL, description TEXT, category TEXT, price INTEGER NOT NULL, compare_price INTEGER, image TEXT, images TEXT DEFAULT '[]', sizes TEXT DEFAULT '[]', colors TEXT DEFAULT '[]', stock INTEGER DEFAULT 0, is_new INTEGER DEFAULT 0, is_best INTEGER DEFAULT 0, active INTEGER DEFAULT 1, created_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS orders(id INTEGER PRIMARY KEY, order_no TEXT UNIQUE, user_id INTEGER, customer_name TEXT, email TEXT, phone TEXT, address TEXT, city TEXT, state TEXT, pincode TEXT, subtotal INTEGER, shipping INTEGER DEFAULT 0, total INTEGER, payment_status TEXT DEFAULT 'pending', payment_id TEXT, order_status TEXT DEFAULT 'pending', courier TEXT, tracking_id TEXT, tracking_url TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS order_items(id INTEGER PRIMARY KEY, order_id INTEGER, product_id INTEGER, name TEXT, size TEXT, color TEXT, quantity INTEGER, unit_price INTEGER);
CREATE TABLE IF NOT EXISTS wishlists(user_id INTEGER, product_id INTEGER, PRIMARY KEY(user_id,product_id));
CREATE TABLE IF NOT EXISTS returns(id INTEGER PRIMARY KEY, order_id INTEGER, user_id INTEGER, reason TEXT, status TEXT DEFAULT 'requested', refund_status TEXT DEFAULT 'not_started', created_at TEXT DEFAULT CURRENT_TIMESTAMP);
`);
const count=db.prepare("SELECT COUNT(*) n FROM products").get().n;
if(!count){
 const seed=[
 ["bbm-core-graphic-tee","BBM Core Graphic Tee","Relaxed everyday graphic tee.","Graphic Tees",79900,99900,"/assets/tee-black.svg",'["S","M","L","XL","XXL"]','["Black"]',30,1,1],
 ["after-hours-oversized-tee","After Hours Oversized Tee","Oversized streetwear fit for daily rotation.","Oversized",89900,109900,"/assets/tee-cream.svg",'["S","M","L","XL","XXL"]','["Cream"]',24,1,1],
 ["street-code-tee","Street Code Tee","A clean graphic statement piece.","Graphic Tees",74900,null,"/assets/tee-orange.svg",'["S","M","L","XL"]','["Orange"]',18,0,0],
 ["everyday-essential-tee","Everyday Essential Tee","A versatile essential for everyday wear.","Essentials",69900,null,"/assets/tee-green.svg",'["S","M","L","XL","XXL"]','["Olive"]',40,0,1]
 ];
 const ins=db.prepare("INSERT INTO products(slug,name,description,category,price,compare_price,image,sizes,colors,stock,is_new,is_best) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)");
 const tx=db.transaction(rows=>rows.forEach(x=>ins.run(...x)));tx(seed);
}
module.exports=db;
