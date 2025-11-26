-- Populate Script for AlloyDB
-- Volumes: Items (100k), Users (100k), Orders (1M), Order_Items (2M), Ratings (200k)
-- This script uses efficient bulk insert techniques (INSERT INTO ... SELECT) to generate data rapidly.

BEGIN;

-- 1. Populate Users (100k)
INSERT INTO Users (name, email, status)
SELECT
    'User ' || i,
    'user' || i || '@example.com',
    CASE (i % 3) WHEN 0 THEN 'Active' WHEN 1 THEN 'Inactive' ELSE 'Pending' END
FROM generate_series(1, 100000) AS i;

-- 2. Populate Items (100k)
INSERT INTO Items (item_description, item_value)
SELECT
    'Item ' || i || ' - ' || (ARRAY['Electronics', 'Home', 'Clothing', 'Garden', 'Sports'])[floor(random()*5 + 1)],
    (random() * 100 + 5)::decimal(10,2)
FROM generate_series(1, 100000) AS i;

-- 3. Populate Orders (1M)
-- Randomly assign to users. Dates within the last 2 years.
INSERT INTO Orders (create_date, status, user_id)
SELECT
    CURRENT_DATE - (random() * 730)::integer,
    (ARRAY['Pending', 'Shipped', 'Delivered', 'Cancelled', 'Returned'])[floor(random()*5 + 1)],
    floor(random() * 100000 + 1)::int
FROM generate_series(1, 1000000) AS i;

-- 4. Populate Order_Items (2M)
-- Randomly link Orders to Items.
INSERT INTO Order_Items (order_id, item_id, quantity)
SELECT
    floor(random() * 1000000 + 1)::int,
    floor(random() * 100000 + 1)::int,
    floor(random() * 5 + 1)::int
FROM generate_series(1, 2000000) AS i;

-- 5. Populate Ratings (200k)
-- Select random Order_Items to rate. Ensure user_id matches the order's user.
-- Generate realistic comments using a combination of phrases.

WITH ReviewTemplates AS (
    SELECT * FROM (VALUES
        (5, 'Absolutely love this product! It exceeded my expectations in every way.', 'Praise'),
        (5, 'Great quality and fast shipping. Will definitely buy again.', 'Praise'),
        (4, 'Good product, but the packaging was a bit damaged upon arrival.', 'Delivery Issue'),
        (4, 'Works well, does exactly what it says on the box.', 'Praise'),
        (3, 'It is okay, but I wish it had more features.', 'Feature Request'),
        (3, 'Average quality. You get what you pay for.', 'Neutral'),
        (2, 'Not great. It stopped working after a week.', 'Bug Report'),
        (2, 'The color is completely different from the picture.', 'Complaint'),
        (1, 'Terrible experience. Customer support was unhelpful.', 'Complaint'),
        (1, 'Do not buy this! It is a complete waste of money.', 'Complaint'),
        (4, 'I would love to see a dark mode version of this.', 'Feature Request'),
        (2, 'The app crashes whenever I try to save my settings.', 'Bug Report'),
        (5, 'Best purchase I have made all year!', 'Praise'),
        (3, 'Delivery was delayed by three days.', 'Delivery Issue'),
        (1, 'Product arrived broken. Still waiting for a refund.', 'Delivery Issue')
    ) AS t(score, text_template, category)
)
INSERT INTO Ratings (value, comments, user_id, order_items_id)
SELECT
    rt.score,
    rt.text_template,
    o.user_id,
    oi.order_items_id
FROM Order_Items oi
JOIN Orders o ON oi.order_id = o.order_id
CROSS JOIN LATERAL (
    SELECT score, text_template FROM ReviewTemplates ORDER BY random() LIMIT 1
) rt
ORDER BY random()
LIMIT 200000;

COMMIT;
ANALYZE;
