# Database Design

## Tables

### users
- id
- email
- password
- role
- created_at
- updated_at

### categories
- id
- name
- description
- created_at
- updated_at

### products
- id
- category_id
- name
- description
- price
- created_at
- updated_at

### product_options
- id
- product_id
- name
- value
- created_at

### product_images
- id
- product_id
- url
- created_at

## Relationships

- One category has many products.
- One product has many options.
- One product has many images.

## Normalization

The schema is normalized to avoid repeating groups:
- product options are in a separate table.
- product images are in a separate table.
- category data is not duplicated inside products.