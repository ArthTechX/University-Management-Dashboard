-- Seed Data for testing

-- 1. Create an admin user (password: admin123 hashed with bcrypt cost 10)
INSERT INTO users (id, name, email, password_hash, role, is_active)
VALUES 
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'System Administrator', 'admin@edutrack.edu', '$2b$10$wL4F.4yH6FfP3E.m62o1G.DXZg7Hj5UuO2N2zY3k/6S1s8A9F2YjG', 'admin', true)
ON CONFLICT DO NOTHING;

-- 2. Create some sample courses
INSERT INTO courses (id, title, description, category, instructor_name, capacity, created_by)
VALUES 
('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Introduction to Computer Science', 'Learn the basics of programming and algorithms.', 'Computer Science', 'Dr. Alan Turing', 100, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
('c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'Calculus I', 'Limits, derivatives, and integrals.', 'Mathematics', 'Prof. Isaac Newton', 50, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
('d3eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'World History 101', 'A survey of global history from ancient times to the present.', 'History', 'Dr. Herodotus', 200, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11')
ON CONFLICT DO NOTHING;
