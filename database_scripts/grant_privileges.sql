-- Grant ownership of the database 'items' to user 'items'
ALTER DATABASE items OWNER TO items;

-- Grant all privileges on the database 'items' to user 'items'
GRANT ALL PRIVILEGES ON DATABASE items TO items;

-- The following commands are intended to be run while connected to the 'items' database
-- to ensure the user has permissions on the specific schema objects (tables, sequences).

-- Grant permissions on the public schema
GRANT ALL ON SCHEMA public TO items;

-- Grant permissions on all existing tables and sequences
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO items;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO items;

-- Ensure future tables and sequences created by other users are also accessible (optional but recommended)
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO items;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO items;
