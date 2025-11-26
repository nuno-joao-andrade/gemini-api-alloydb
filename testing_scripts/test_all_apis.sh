#!/bin/bash

BASE_URL="http://localhost:3000/api"

# Function to print section headers
print_header() {
  echo "----------------------------------------------------------------"
  echo "$1"
  echo "----------------------------------------------------------------"
}

# Function to check status code
check_status() {
  if [[ "$1" =~ ^2 ]]; then
    echo "✅ Success ($1)"
  else
    echo "❌ Failed ($1) - Response: $2"
  fi
}

# 1. USERS
print_header "Testing USERS API"

# Create User
echo "Creating new user..."
USER_RES=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/users" \
  -H "Content-Type: application/json" \
  -d '{"name": "Test User", "email": "testuser_unique_'$(date +%s)'@example.com", "status": "Active"}')
USER_BODY=$(echo "$USER_RES" | head -n 1)
USER_CODE=$(echo "$USER_RES" | tail -n 1)
check_status "$USER_CODE" "$USER_BODY"
USER_ID=$(echo "$USER_BODY" | grep -o '"user_id":"[^"]*"' | cut -d'"' -f4)
echo "Created User ID: $USER_ID"

# Get User
echo "Getting user $USER_ID..."
curl -s "$BASE_URL/users/$USER_ID" | grep "Test User" > /dev/null && echo "✅ User data verified" || echo "❌ User data mismatch"

# Update User
echo "Updating user $USER_ID..."
curl -s -X PUT "$BASE_URL/users/$USER_ID" \
  -H "Content-Type: application/json" \
  -d '{"name": "Updated User", "email": "updated_'$(date +%s)'@example.com", "status": "Inactive"}' > /dev/null
echo "✅ Update request sent"

# List Users
echo "Listing users (limit 5)..."
curl -s "$BASE_URL/users?limit=5" > /dev/null && echo "✅ List users success"

# 2. ITEMS
print_header "Testing ITEMS API"

# Create Item
echo "Creating new item..."
ITEM_RES=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/items" \
  -H "Content-Type: application/json" \
  -d '{"item_description": "Test Item", "item_value": 99.99}')
ITEM_BODY=$(echo "$ITEM_RES" | head -n 1)
ITEM_CODE=$(echo "$ITEM_RES" | tail -n 1)
check_status "$ITEM_CODE" "$ITEM_BODY"
ITEM_ID=$(echo "$ITEM_BODY" | grep -o '"item_id":"[^"]*"' | cut -d'"' -f4)
echo "Created Item ID: $ITEM_ID"

# Get Item
echo "Getting item $ITEM_ID..."
curl -s "$BASE_URL/items/$ITEM_ID" | grep "Test Item" > /dev/null && echo "✅ Item data verified" || echo "❌ Item data mismatch"

# Average Rating (Special Endpoint)
echo "Getting average rating for item $ITEM_ID..."
curl -s "$BASE_URL/items/$ITEM_ID/average-rating" > /dev/null && echo "✅ Average rating endpoint success"

# 3. ORDERS
print_header "Testing ORDERS API"

# Create Order
echo "Creating new order for User $USER_ID..."
ORDER_RES=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/orders" \
  -H "Content-Type: application/json" \
  -d '{"create_date": "2023-10-27", "status": "Pending", "user_id": '$USER_ID'}')
ORDER_BODY=$(echo "$ORDER_RES" | head -n 1)
ORDER_CODE=$(echo "$ORDER_RES" | tail -n 1)
check_status "$ORDER_CODE" "$ORDER_BODY"
ORDER_ID=$(echo "$ORDER_BODY" | grep -o '"order_id":"[^"]*"' | cut -d'"' -f4)
echo "Created Order ID: $ORDER_ID"

# Get User Orders (Complex Endpoint)
echo "Getting orders for User $USER_ID..."
curl -s "$BASE_URL/users/$USER_ID/orders" > /dev/null && echo "✅ User orders history endpoint success"

# 4. ORDER ITEMS
print_header "Testing ORDER ITEMS API"

# Create Order Item
echo "Creating new order item (Order: $ORDER_ID, Item: $ITEM_ID)..."
OI_RES=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/order_items" \
  -H "Content-Type: application/json" \
  -d '{"order_id": '$ORDER_ID', "item_id": '$ITEM_ID', "quantity": 2}')
OI_BODY=$(echo "$OI_RES" | head -n 1)
OI_CODE=$(echo "$OI_RES" | tail -n 1)
check_status "$OI_CODE" "$OI_BODY"
OI_ID=$(echo "$OI_BODY" | grep -o '"order_items_id":"[^"]*"' | cut -d'"' -f4)
echo "Created Order Item ID: $OI_ID"

# 5. RATINGS
print_header "Testing RATINGS API"

# Create Rating
echo "Creating new rating (User: $USER_ID, Order Item: $OI_ID)..."
RATING_RES=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/ratings" \
  -H "Content-Type: application/json" \
  -d '{"value": 5, "comments": "Great test product!", "user_id": '$USER_ID', "order_items_id": '$OI_ID'}')
RATING_BODY=$(echo "$RATING_RES" | head -n 1)
RATING_CODE=$(echo "$RATING_RES" | tail -n 1)
check_status "$RATING_CODE" "$RATING_BODY"
RATING_ID=$(echo "$RATING_BODY" | grep -o '"rating_id":"[^"]*"' | cut -d'"' -f4)
echo "Created Rating ID: $RATING_ID"

# CLEANUP (Deleting in reverse order of dependencies)
print_header "Cleaning Up"

if [ ! -z "$RATING_ID" ]; then
  echo "Deleting Rating $RATING_ID..."
  curl -s -X DELETE "$BASE_URL/ratings/$RATING_ID" > /dev/null
fi

if [ ! -z "$OI_ID" ]; then
  echo "Deleting Order Item $OI_ID..."
  curl -s -X DELETE "$BASE_URL/order_items/$OI_ID" > /dev/null
fi

if [ ! -z "$ORDER_ID" ]; then
  echo "Deleting Order $ORDER_ID..."
  curl -s -X DELETE "$BASE_URL/orders/$ORDER_ID" > /dev/null
fi

if [ ! -z "$ITEM_ID" ]; then
  echo "Deleting Item $ITEM_ID..."
  curl -s -X DELETE "$BASE_URL/items/$ITEM_ID" > /dev/null
fi

if [ ! -z "$USER_ID" ]; then
  echo "Deleting User $USER_ID..."
  curl -s -X DELETE "$BASE_URL/users/$USER_ID" > /dev/null
fi

echo "✅ Cleanup complete."
