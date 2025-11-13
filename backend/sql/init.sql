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
    vid INT NOT NULL,
    bid INT NOT NULL,
    date DATETIME NOT NULL,
    duration INT NOT NULL,
    FOREIGN KEY (bid) REFERENCES Booth(id) ON DELETE CASCADE,
    FOREIGN KEY (vid) REFERENCES Vendor(id) ON DELETE CASCADE,
    PRIMARY KEY (vid, bid)
);

INSERT INTO Vendor (name, phone, description, owner) VALUES
('Fresh Farms', '123-456-7890', 'We sell fresh fruits and vegetables.', 'Alice Johnson'),
('Tech Gadgets', '987-654-3210', 'Latest technology gadgets and accessories.', 'Bob Smith');

INSERT INTO Product (name, description, count, price, vid) VALUES
('Apple', 'Fresh red apples.', 100.00, 1.50, 1),
('Banana', 'Organic bananas.', 150.00, 1.30, 1),
('Smartphone', 'Latest model smartphone.', 50.00, 699.99, 2),
('Headphones', 'Noise-cancelling headphones.', 75.00, 129.99, 2);

INSERT INTO Sale (discount) VALUES
(2.00),
(15.00);

INSERT INTO SaleItem (pid, sid, quantity) VALUES
(1, 1, 4.00),
(2, 1, 8.00),
(3, 2, 1.00),
(4, 2, 1.00);

INSERT INTO Booth (xcor, ycor) VALUES
(10.00, 20.00),
(15.00, 25.00),
(20.00, 30.00);

INSERT INTO Reservation (vid, bid, date, duration) VALUES
(1, 1, '2024-07-01 09:00:00', 4),
(2, 2, '2024-07-01 10:00:00', 6);