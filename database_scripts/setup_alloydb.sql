-- Create Sequences
CREATE SEQUENCE items_item_id_seq;
CREATE SEQUENCE orders_order_id_seq;
CREATE SEQUENCE order_items_order_items_id_seq;
CREATE SEQUENCE ratings_rating_id_seq;
CREATE SEQUENCE users_user_id_seq;

-- Create Tables
CREATE TABLE Users (
    user_id BIGINT PRIMARY KEY DEFAULT nextval('users_user_id_seq'),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    status VARCHAR(50)
);

CREATE TABLE Items (
    item_id BIGINT PRIMARY KEY DEFAULT nextval('items_item_id_seq'),
    item_description TEXT,
    item_value DECIMAL(10, 2)
);

CREATE TABLE Orders (
    order_id BIGINT PRIMARY KEY DEFAULT nextval('orders_order_id_seq'),
    create_date DATE NOT NULL,
    status VARCHAR(50),
    user_id BIGINT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

CREATE TABLE Order_Items (
    order_items_id BIGINT PRIMARY KEY DEFAULT nextval('order_items_order_items_id_seq'),
    order_id BIGINT NOT NULL,
    item_id BIGINT NOT NULL,
    quantity INT NOT NULL,
    FOREIGN KEY (order_id) REFERENCES Orders(order_id),
    FOREIGN KEY (item_id) REFERENCES Items(item_id)
);

CREATE TABLE Ratings (
    rating_id BIGINT PRIMARY KEY DEFAULT nextval('ratings_rating_id_seq'),
    value INT NOT NULL CHECK (value >= 1 AND value <= 5),
    comments TEXT,
    user_id BIGINT NOT NULL,
    order_items_id BIGINT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES Users(user_id),
    FOREIGN KEY (order_items_id) REFERENCES Order_Items(order_items_id)
);

-- Associate sequences with table columns
ALTER SEQUENCE items_item_id_seq OWNED BY Items.item_id;
ALTER SEQUENCE orders_order_id_seq OWNED BY Orders.order_id;
ALTER SEQUENCE order_items_order_items_id_seq OWNED BY Order_Items.order_items_id;
ALTER SEQUENCE ratings_rating_id_seq OWNED BY Ratings.rating_id;
ALTER SEQUENCE users_user_id_seq OWNED BY Users.user_id;