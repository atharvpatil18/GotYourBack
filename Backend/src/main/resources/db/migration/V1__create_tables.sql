CREATE TABLE users (
    id BIGINT NOT NULL AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    department VARCHAR(255),
    registration_number VARCHAR(50),
    year_of_study INT,
    CONSTRAINT users_pk PRIMARY KEY (id),
    CONSTRAINT users_email_unique UNIQUE (email)
) ENGINE=InnoDB;

CREATE TABLE items (
    id BIGINT NOT NULL AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    item_type VARCHAR(20) NOT NULL,   -- renamed from 'type'
    urgency VARCHAR(20) NOT NULL,
    image_url TEXT,
    item_status VARCHAR(20) NOT NULL, -- renamed from 'status'
    owner_id BIGINT,
    CONSTRAINT items_pk PRIMARY KEY (id),
    CONSTRAINT items_owner_fk FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE requests (
    id BIGINT NOT NULL AUTO_INCREMENT,
    item_id BIGINT,
    requester_id BIGINT,
    request_status VARCHAR(20) NOT NULL, -- renamed from 'status'
    CONSTRAINT requests_pk PRIMARY KEY (id),
    CONSTRAINT requests_item_fk FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE SET NULL,
    CONSTRAINT requests_requester_fk FOREIGN KEY (requester_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE messages (
    id BIGINT NOT NULL AUTO_INCREMENT,
    request_id BIGINT NOT NULL,
    sender_id BIGINT NOT NULL,
    receiver_id BIGINT NOT NULL,
    content TEXT NOT NULL,
    sent_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT messages_pk PRIMARY KEY (id),
    CONSTRAINT messages_request_fk FOREIGN KEY (request_id) REFERENCES requests(id) ON DELETE CASCADE,
    CONSTRAINT messages_sender_fk FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT messages_receiver_fk FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;
