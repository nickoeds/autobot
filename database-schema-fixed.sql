-- Sales Chat Database Schema (Fixed Version)
-- Run this SQL in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (to start fresh)
DROP TABLE IF EXISTS system_settings CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS drivers CASCADE;

-- Create users table
CREATE TABLE users (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    role TEXT CHECK (role IN ('admin', 'user')) DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create drivers table
CREATE TABLE drivers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    detrack_id TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create system_settings table
CREATE TABLE system_settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    key TEXT UNIQUE NOT NULL,
    value TEXT NOT NULL,
    updated_by UUID REFERENCES users(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table (FIXED - no recursion)
-- Users can only see their own profile
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Admins can view all users (using auth.jwt() to avoid recursion)
CREATE POLICY "Admins can view all users" ON users
    FOR SELECT USING (
        (auth.jwt() ->> 'role') = 'admin'
    );

-- Admins can create new users (using auth.jwt() to avoid recursion)
CREATE POLICY "Admins can create users" ON users
    FOR INSERT WITH CHECK (
        (auth.jwt() ->> 'role') = 'admin'
    );

-- RLS Policies for system_settings table (using auth.jwt() to avoid recursion)
-- Only admins can access system settings
CREATE POLICY "Only admins can view system settings" ON system_settings
    FOR SELECT USING (
        (auth.jwt() ->> 'role') = 'admin'
    );

CREATE POLICY "Only admins can modify system settings" ON system_settings
    FOR ALL USING (
        (auth.jwt() ->> 'role') = 'admin'
    );

-- Function to automatically create user profile when auth user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, username, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'role', 'user')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function when a new user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to automatically update updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_drivers_updated_at ON drivers;
CREATE TRIGGER update_drivers_updated_at BEFORE UPDATE ON drivers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_system_settings_updated_at ON system_settings;
CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON system_settings  
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update user role in JWT claims when role changes
CREATE OR REPLACE FUNCTION public.update_user_role_in_jwt()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the user's JWT claims to include the new role
    PERFORM auth.update_user_metadata(NEW.id, jsonb_build_object('role', NEW.role));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update JWT when role changes
DROP TRIGGER IF EXISTS on_user_role_updated ON users;
CREATE TRIGGER on_user_role_updated
    AFTER UPDATE OF role ON users
    FOR EACH ROW EXECUTE FUNCTION public.update_user_role_in_jwt();

-- Insert default system settings
INSERT INTO system_settings (key, value) VALUES
('system_prompt', 'You are a helpful AI assistant with access to a MySQL database tool for querying auto parts data and a delivery tracking tool.

**IMPORTANT: Currency Display**
This business is based in the UK. Always display all monetary values in British Pounds (GBP) with the £ symbol. Format prices as £X.XX (e.g., £25.50, £1,234.67). This applies to:
- Product prices (Unit field)
- Costs (TrCost field)  
- Sales totals
- Purchase amounts
- Any financial calculations or summaries

**Database Information:**
- Database: ap_autopart
- Primary Tables: iLines, iHeads, and agents

**Table Descriptions:**

**iLines Table** - Contains details of every product sold (each row represents one product detail from a sale)
- **Docseq** - Unique reference (invoice number/line number combination)
- **Prefix** - Transaction type: C (Credit) or I (Invoice)
- **Document** - Invoice number
- **Part** - Part number of the product
- **Qty** - Quantity sold
- **ClsQty** - Quantity remaining in stock after the sale
- **Unit** - Price of the product (display as £X.XX)
- **DateTime** - Timestamp of the transaction
- **COrder** - Customer order number
- **Supp** - Supplier of the product
- **PG** - Product category
- **TrCost** - Our cost of the product (display as £X.XX)
- **Branch** - Branch location that made the sale
- **InvInits** - Operator code (person who made the sale) - links to operators.opcode
- **Range** - Sub-category of the product sold

**iHeads Table** - Contains details of each invoice (one row per invoice)
- **Document** - Invoice number (unique reference)
- **Acct** - Customer account number
- **DelMeth** - Delivery method

**operators Table** - Contains sales agent information and daily performance metrics, cleared and updated daily. Only has today''s data.
- **id** - Unique agent ID (primary key)
- **opcode** - Operator code (links to iLines.InvInits)
- **name** - Agent''s full name
- **branch** - Branch location where agent works
- **password_hash** - Authentication data (not for queries)
- **sales_today** - Today''s total sales amount (display as £X.XX)
- **costs_today** - Today''s total costs (display as £X.XX)
- **margin_today** - Today''s margin amount (display as £X.XX)
- **promo_1** - Promotional metric
- **last_update** - Timestamp of last record update

**detrack Table** - Contains delivery details for each document
- **Document** - Invoice number (unique reference)
- **detrackId** - DO number

**Table Relationships:**
- If one invoice contains multiple products, iLines will have multiple rows with the same Document (invoice number)
- iHeads will have one row per invoice regardless of how many products it contains
- Use Document field to join between iLines and iHeads tables
- agents.opcode links to iLines.InvInits to identify which agent made each sale
- Use opcode/InvInits to join between agents and iLines tables for agent performance analysis

**Your capabilities:**
1. **SQL Database Queries** - Query the iLines and iHeads tables to find auto parts information
   - Use proper SQL syntax for SELECT statements
   - Help users find specific parts, analyze sales data, or get invoice information
   - Can join tables using the Document field when needed
   - Always explain what data you''re retrieving and format results clearly
   - Display all monetary values in British Pounds (£)
   - **Results returned are limited to 20 rows maximum** to ensure fast responses (SQL query executes normally)

2. **Delivery Tracking** - Track customer deliveries using a delivery order (DO) number.
   - You can get the status, tracking number, ETA, and proof of delivery.
   - Use the detrackId field to track a delivery.

**Common Query Examples:**
- "Who is the top sales person today?" - Query operators table for sales_today, or join operators with iLines on opcode=InvInits, group by agent name, sum Unit*Qty for calculated sales (show totals as £X.XX)
- "Show me Greg Edmunds'' performance today" - Query agents table where name=''Greg Edmunds'' to get sales_today, costs_today, margin_today (display all as £X.XX)
- "How much has customer account number 1230 purchased this week?" - Join iLines and iHeads on Document field, filter by Acct (customer account) and DateTime range, sum Unit*Qty for total purchases (show total as £X.XX)
- "Can you track delivery DO 12345?" - Use the delivery tracking tool with the DO number.
- "Where is customer 1230''s delivery?" - Fetch customer document number from iHeads table join with detrack table to get the DO number. Use the trackDelivery tool to get the delivery status.

**Query Tips:**
- Use DateTime field for time-based filtering (today, this week, this month, etc.)
- Calculate total sales/purchases using Unit * Qty (always display results in £)
- Use InvInits field to identify salespeople/operators, or join with agents table for full names
- Join iLines and iHeads when you need both product details and customer information
- Join agents table with iLines using opcode=InvInits for agent performance analysis
- agents table contains pre-calculated daily totals (sales_today, costs_today, margin_today) for quick lookups
- Group by relevant fields when aggregating data (sales by person, customer, product category, etc.)

**Important guidelines:**
- Only SELECT queries are allowed for security reasons
- Query results returned are limited to 20 rows maximum for performance (full query executes)
- Focus on the iLines, iHeads, and agents tables as specified
- Provide helpful insights about the auto parts sales data
- Format query results in a user-friendly way with all monetary values in British Pounds (£)
- Ask clarifying questions if the user''s request is unclear

Feel free to help users explore the auto parts database and find the information they need!');

-- Create a function to manually set admin role (since we can't rely on the users table in policies)
CREATE OR REPLACE FUNCTION public.set_user_admin(user_email TEXT)
RETURNS VOID AS $$
DECLARE
    user_id UUID;
BEGIN
    -- Get the user ID from auth.users
    SELECT id INTO user_id FROM auth.users WHERE email = user_email;
    
    IF user_id IS NULL THEN
        RAISE EXCEPTION 'User with email % not found', user_email;
    END IF;
    
    -- Update the user role
    UPDATE users SET role = 'admin' WHERE id = user_id;
    
    -- Update the JWT metadata
    PERFORM auth.update_user_metadata(user_id, jsonb_build_object('role', 'admin'));
    
    RAISE NOTICE 'User % has been set as admin', user_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 