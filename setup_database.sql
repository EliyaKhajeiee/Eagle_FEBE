-- Create the stores table
CREATE TABLE store (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

-- Create the invoices table, linked to stores
CREATE TABLE invoice (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(20) NOT NULL,
    store_id INT,
    FOREIGN KEY (store_id) REFERENCES store(id)
);

-- Create the drivers table
CREATE TABLE driver (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    van VARCHAR(10),
    imageUrl VARCHAR(255)
);

-- Create the association table between drivers and stores
CREATE TABLE driver_store (
    driver_id INT,
    store_id INT,
    PRIMARY KEY (driver_id, store_id),
    FOREIGN KEY (driver_id) REFERENCES driver(id),
    FOREIGN KEY (store_id) REFERENCES store(id)
);
