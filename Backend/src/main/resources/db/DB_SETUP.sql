-- =============================================================================
-- GotYourBack Database Setup Script
-- Complete database initialization for the GotYourBack application
-- 
-- ⚠️  WARNING: DEVELOPMENT ONLY - DESTRUCTIVE OPERATIONS ⚠️
-- This script will DROP and recreate the entire database!
-- DO NOT run this in production environments!
-- 
-- For production:
-- 1. Remove or comment out the DROP/CREATE DATABASE statements below
-- 2. Use table-level migrations or Flyway/Liquibase for safe schema updates
-- 3. Ensure proper backups before any schema changes
-- 
-- Run this script with: mysql -u root -p < DB_SETUP.sql
-- =============================================================================

-- Drop and recreate database (DEVELOPMENT ONLY - See warning above)
-- For production, comment out these lines and create database manually
DROP DATABASE IF EXISTS gotyourback;
CREATE DATABASE gotyourback;
USE gotyourback;

-- =============================================================================
-- TABLE: users
-- Stores user account information
-- =============================================================================
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    department VARCHAR(255),
    registration_number VARCHAR(50),
    year_of_study INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================================================
-- TABLE: items
-- Stores items that can be lent or sold
-- =============================================================================
CREATE TABLE items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    owner_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    type ENUM('LEND', 'SELL') NOT NULL,
    urgency VARCHAR(20),
    image_url VARCHAR(255),
    status ENUM('AVAILABLE', 'SOLD', 'RETURNED', 'UNAVAILABLE') NOT NULL DEFAULT 'AVAILABLE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_owner_id (owner_id),
    INDEX idx_status (status),
    INDEX idx_type (type),
    INDEX idx_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================================================
-- TABLE: requests
-- Stores borrowing/buying requests for items
-- =============================================================================
CREATE TABLE requests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    item_id BIGINT NOT NULL,
    requester_id BIGINT NOT NULL,
    status ENUM('PENDING', 'ACCEPTED', 'REJECTED', 'DONE') NOT NULL DEFAULT 'PENDING',
    created_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
    
    -- Return confirmation tracking
    borrower_confirmed_return TINYINT(1) NOT NULL DEFAULT 0,
    lender_confirmed_return TINYINT(1) NOT NULL DEFAULT 0,
    completed_at DATETIME(6) NULL,
    
    -- Lend/Receipt tracking
    lender_marked_as_lent TINYINT(1) NOT NULL DEFAULT 0,
    borrower_confirmed_receipt TINYINT(1) NOT NULL DEFAULT 0,
    lent_at DATETIME(6) NULL,
    received_at DATETIME(6) NULL,
    
    FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE,
    FOREIGN KEY (requester_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_item_id (item_id),
    INDEX idx_requester_id (requester_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================================================
-- TABLE: messages
-- Stores messages between users for specific requests
-- =============================================================================
CREATE TABLE messages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    request_id BIGINT NOT NULL,
    sender_id BIGINT NOT NULL,
    receiver_id BIGINT NOT NULL,
    content TEXT NOT NULL,
    sent_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (request_id) REFERENCES requests(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_request_id (request_id),
    INDEX idx_sender_id (sender_id),
    INDEX idx_receiver_id (receiver_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================================================
-- TABLE: notifications
-- Stores user notifications for various events
-- =============================================================================
CREATE TABLE notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    recipient_id BIGINT NOT NULL,
    notification_type VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    related_item_id BIGINT,
    related_request_id BIGINT,
    related_message_id BIGINT,
    is_read TINYINT(1) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP NULL,
    FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (related_item_id) REFERENCES items(id) ON DELETE SET NULL,
    FOREIGN KEY (related_request_id) REFERENCES requests(id) ON DELETE SET NULL,
    FOREIGN KEY (related_message_id) REFERENCES messages(id) ON DELETE SET NULL,
    INDEX idx_recipient_id (recipient_id),
    INDEX idx_is_read (is_read),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================================================
-- END OF SCHEMA DEFINITION
-- =============================================================================
-- NOTE: For sample/test data, see data.sql (development only)
-- Do NOT include real user data or PII in this production setup script
-- =============================================================================

-- =============================================================================
-- VERIFICATION QUERIES
-- =============================================================================

SELECT 'Database setup complete!' AS status;
SHOW TABLES;

SELECT 
    TABLE_NAME, 
    TABLE_ROWS, 
    CREATE_TIME 
FROM 
    information_schema.TABLES 
WHERE 
    TABLE_SCHEMA = 'gotyourback'
ORDER BY 
    TABLE_NAME;
