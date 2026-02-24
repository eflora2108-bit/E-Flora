-- Seed Data for eFlora Marketplace
-- Run this after creating the schema

-- Insert sample categories
INSERT INTO categories (name, slug, description, is_active) VALUES
('Indoor Plants', 'indoor-plants', 'Perfect plants for your home and office spaces', true),
('Outdoor Plants', 'outdoor-plants', 'Hardy plants for gardens and outdoor spaces', true),
('Succulents & Cacti', 'succulents-cacti', 'Low-maintenance desert plants', true),
('Flowering Plants', 'flowering-plants', 'Beautiful blooming plants', true),
('Herbs & Vegetables', 'herbs-vegetables', 'Edible plants for your kitchen garden', true),
('Trees & Shrubs', 'trees-shrubs', 'Large plants and ornamental trees', true)
ON CONFLICT (slug) DO NOTHING;

-- Create an admin user (password: Admin@123)
-- Password hash for Admin@123
INSERT INTO users (email, password_hash, role, first_name, last_name, email_verified, is_active) VALUES
('admin@eflora.com', '$2a$10$YourHashHere', 'admin', 'Admin', 'User', true, true),
('supplier@eflora.com', '$2a$10$YourHashHere', 'supplier', 'Test', 'Supplier', true, true),
('customer@eflora.com', '$2a$10$YourHashHere', 'customer', 'Test', 'Customer', true, true)
ON CONFLICT (email) DO NOTHING;

-- Note: You'll need to register users through the app to get proper password hashes
-- The above are just placeholders

COMMENT ON TABLE categories IS 'Seeded with initial plant categories';
