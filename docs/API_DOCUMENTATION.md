# Mini E-Commerce Backend API Documentation

## Base URL
`http://localhost:3000`

## Authentication
Use JWT in the `Authorization` header for protected endpoints.

```http
Authorization: Bearer <token>
```

## Common Response Format
```json
{
  "success": true,
  "message": "string",
  "data": {}
}
```

## Error Format
```json
{
  "success": false,
  "message": "Error message"
}
```

---

## Authentication

### Register
**POST** `/api/auth/register`

Request:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "role": "user"
    },
    "token": "jwt_token"
  }
}
```

### Login
**POST** `/api/auth/login`

Request:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### Profile
**GET** `/api/auth/profile`

Headers:
```http
Authorization: Bearer <token>
```

---

## Categories

### Create Category
**POST** `/api/categories`

Admin only.

### Update Category
**PUT** `/api/categories/:id`

Admin only.

### Delete Category
**DELETE** `/api/categories/:id`

Admin only.

### List Categories
**GET** `/api/categories`

Public.

---

## Products

### Create Product
**POST** `/api/products`

Admin only.

Request:
```json
{
  "name": "iPhone 15",
  "description": "Latest smartphone",
  "price": 999.99,
  "category_id": "uuid",
  "options": [
    { "name": "color", "value": "Black" },
    { "name": "size", "value": "128GB" }
  ],
  "images": [
    "https://example.com/image1.jpg",
    "https://example.com/image2.jpg"
  ]
}
```

### Update Product
**PUT** `/api/products/:id`

Admin only.

### Delete Product
**DELETE** `/api/products/:id`

Admin only.

### Get Product Details
**GET** `/api/products/:id`

Public.

### List Products
**GET** `/api/products`

Query params:
- `search`
- `category_id`
- `min_price`
- `max_price`
- `page`
- `limit`

Example:
```http
GET /api/products?search=phone&category_id=uuid&page=1&limit=10
```

---

## Assumptions and Decisions

- JWT is used for authentication.
- Roles are limited to `admin` and `user`.
- Product options are stored as name-value pairs.
- Product images are stored as URLs.
- PostgreSQL is normalized into separate tables for products, options, and images.
- Pagination uses `page` and `limit`.
- Search uses case-insensitive matching on product name.

---

## Postman Testing

### Suggested flow
1. Register user.
2. Login and save JWT token.
3. Test protected endpoints with `Authorization: Bearer <token>`.
4. Create category as admin.
5. Create product as admin.
6. Test search, filter, and pagination on products.