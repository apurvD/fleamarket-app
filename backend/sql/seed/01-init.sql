-- Active: 1760138508635@@127.0.0.1@5432
CREATE TABLE Vendor (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL DEFAULT '',
    email VARCHAR(100) NOT NULL DEFAULT '',
    description VARCHAR(500) NOT NULL DEFAULT '',
    owner VARCHAR(100) NOT NULL DEFAULT '',
    logo BLOB
);

CREATE TABLE IF NOT EXISTS vendor_auth (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vendor_id INT NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (vendor_id) REFERENCES vendor(id)
);

CREATE TABLE Product (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(500) NOT NULL DEFAULT '',
    count DECIMAL(10, 2),
    price DECIMAL(10, 2) NOT NULL,
    image BLOB,
    vid INT NOT NULL,
    FOREIGN KEY (vid) REFERENCES Vendor(id) ON DELETE CASCADE
);

CREATE TABLE Sale (
    id INT AUTO_INCREMENT PRIMARY KEY,
    discount DECIMAL(10, 2) NOT NULL,
    date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE SaleItem (
    pid INT NOT NULL,
    sid INT NOT NULL,
    quantity DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (sid) REFERENCES Sale(id) ON DELETE CASCADE,
    FOREIGN KEY (pid) REFERENCES Product(id) ON DELETE CASCADE,
    PRIMARY KEY (sid, pid)
);

CREATE TABLE Booth (
    id INT AUTO_INCREMENT PRIMARY KEY,
    xcor DECIMAL(10, 2) NOT NULL,
    ycor DECIMAL(10, 2) NOT NULL
);

CREATE TABLE Reservation (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vid INT NOT NULL,
    bid INT NOT NULL,
    date DATETIME NOT NULL,
    duration INT NOT NULL,
    FOREIGN KEY (bid) REFERENCES Booth(id) ON DELETE CASCADE,
    FOREIGN KEY (vid) REFERENCES Vendor(id) ON DELETE CASCADE
);

-- Product indexes: look up products by vendor, and support sorting/filtering by price
CREATE INDEX idx_product_vid ON Product(vid);
CREATE INDEX idx_product_price ON Product(price);
CREATE INDEX idx_product_vid_price ON Product(vid, price);
CREATE INDEX idx_product_name ON Product(name);

-- Sale and SaleItem indexes for joins/aggregations
CREATE INDEX idx_sale_date ON Sale(date);
CREATE INDEX idx_saleitem_pid ON SaleItem(pid);
CREATE INDEX idx_saleitem_sid ON SaleItem(sid);

-- Reservation indexes to quickly find reservations by vendor or booth
CREATE INDEX idx_reservation_vid ON Reservation(vid);
CREATE INDEX idx_reservation_bid ON Reservation(bid);