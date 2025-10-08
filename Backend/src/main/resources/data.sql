-- Clear existing data
DELETE FROM messages;
-- First delete from messages as it references requests
DELETE FROM requests;
-- Then delete from requests as it references items and users
DELETE FROM items;
-- Then delete from items as it references users
DELETE FROM users;
-- Finally delete from users as it's referenced by others

-- Insert sample users
INSERT INTO users
    (id, name, email, password, department, registration_number, year_of_study)
VALUES
    (1, 'Arjun Sharma', 'arjun.sharma@srmist.edu.in', 'password123', 'Computer Science', 'RA2111003010001', 3),
    (2, 'Priya Patel', 'priya.patel@srmist.edu.in', 'password123', 'Electronics', 'RA2111003010002', 3),
    (3, 'Rahul Verma', 'rahul.verma@srmist.edu.in', 'password123', 'Computer Science', 'RA2111003010003', 2),
    (4, 'Neha Singh', 'neha.singh@srmist.edu.in', 'password123', 'Mechanical', 'RA2111003010004', 4),
    (5, 'Aditya Kumar', 'aditya.kumar@srmist.edu.in', 'password123', 'Computer Science', 'RA2111003010005', 3);

-- Insert sample items
INSERT INTO items
    (id, name, description, category, type, urgency, image_url, status, owner_id)
VALUES
    -- Books
    (1, 'Operating Systems Textbook', 'Galvin OS book, 8th edition, good condition', 'BOOKS', 'LEND', 'LOW', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSqFvg9kW8V09NR7jC37JFO6R957tLdaY7yZQ&s', 'AVAILABLE', 1),
    (2, 'Data Structures Book', 'Cormen CLRS book, barely used', 'BOOKS', 'SELL', 'MEDIUM', 'https://m.media-amazon.com/images/I/71kBRLo8ZtL._UF1000,1000_QL80_.jpg', 'AVAILABLE', 2),
    (3, 'Java Programming Guide', 'Head First Java, perfect for beginners', 'BOOKS', 'LEND', 'HIGH', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTwvfpr3jal8VTLHJN1awTMSznh-eYC6g7DNA&s', 'AVAILABLE', 3),

    -- Electronics
    (4, 'Scientific Calculator', 'Casio FX-991ES, works perfectly', 'ELECTRONICS', 'SELL', 'MEDIUM', 'https://m.media-amazon.com/images/I/61IujYL0JTL.jpg', 'AVAILABLE', 1),
    (5, 'USB Drive', '32GB Kingston pendrive', 'ELECTRONICS', 'LEND', 'LOW', 'https://static1.industrybuying.com/products/it-electronics/storage-devices/pen-drive/ITE.PEN.57502935_1670068563927.webp', 'AVAILABLE', 4),

    -- Notes
    (6, 'Database Management Notes', 'Handwritten notes for DBMS course', 'NOTES', 'LEND', 'HIGH', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTUGm68YxGIXG_iG9Zi5vZ7ytz4LpTLHq_dYQ&s', 'AVAILABLE', 2),
    (7, 'Computer Networks Notes', 'Detailed notes with diagrams', 'NOTES', 'SELL', 'MEDIUM', 'https://studyhubzone.com/wp-content/uploads/2025/06/Computer-Networks-Notes.webp', 'AVAILABLE', 5),

    -- Lab Equipment
    (8, 'Arduino Kit', 'Complete Arduino starter kit with sensors', 'LAB_EQUIPMENT', 'LEND', 'HIGH', 'https://res.cloudinary.com/rsc/image/upload/b_rgb:FFFFFF,c_pad,dpr_1.0,f_auto,q_auto,w_700/c_pad,w_700/R7907009-01', 'AVAILABLE', 3),
    (9, 'Breadboard Kit', 'Breadboard with jumper wires and basic components', 'LAB_EQUIPMENT', 'SELL', 'LOW', 'https://m.media-amazon.com/images/I/71IFezcCVXL.jpg', 'AVAILABLE', 4),

    -- Other
    (10, 'Drawing Tools Set', 'Engineering drawing tools set', 'OTHER', 'SELL', 'MEDIUM', 'https://m.media-amazon.com/images/I/414RAnYUxJL.jpg', 'AVAILABLE', 5),

    -- Clothes (New Item)
    (11, 'Lab Coat', 'White Lab Coat Size M, used for one semester only, perfect for chemistry labs', 'CLOTHES', 'SELL', 'LOW', 'https://www.laboratorydeal.com/cdn/shop/products/Lab_Coat_Chemistry_Students_White_1.jpg', 'AVAILABLE', 2);


-- Insert sample requests
INSERT INTO requests
    (id, item_id, requester_id, status)
VALUES
    (1, 1, 2, 'PENDING'),
    -- Priya requesting Arjun's OS book
    (2, 3, 4, 'ACCEPTED'),
    -- Neha requesting Rahul's Java book
    (3, 8, 1, 'PENDING'),
    -- Arjun requesting Rahul's Arduino kit
    (4, 6, 5, 'REJECTED'),
    -- Aditya requesting Priya's DBMS notes
    (5, 4, 3, 'DONE');      -- Rahul requested and completed transaction for Arjun's calculator