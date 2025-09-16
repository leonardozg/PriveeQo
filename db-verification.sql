-- DATABASE VERIFICATION QUERIES FOR PRIVEE APPLICATION
-- Use these queries to verify that your Digital Ocean database is properly set up
-- 
-- Usage: psql "your-connection-string" -f db-verification.sql

\echo '======================================================================'
\echo 'PRIVEE DATABASE VERIFICATION REPORT'
\echo '======================================================================'
\echo ''

-- 1. Database connection information
\echo '1. DATABASE CONNECTION INFORMATION'
\echo '--------------------------------'
SELECT 
    current_database() as database_name,
    current_user as connected_user,
    version() as postgresql_version,
    inet_server_addr() as server_address,
    inet_server_port() as server_port,
    now() as connection_time;

\echo ''

-- 2. Table existence check
\echo '2. TABLE STRUCTURE VERIFICATION'
\echo '------------------------------'
SELECT 
    t.tablename,
    t.hasindexes,
    t.hasrules,
    t.hastriggers,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.tablename) as column_count
FROM pg_tables t
WHERE t.schemaname = 'public'
ORDER BY t.tablename;

\echo ''

-- 3. Record counts
\echo '3. RECORD COUNTS BY TABLE'
\echo '------------------------'
SELECT 'items' as table_name, COUNT(*) as record_count FROM items
UNION ALL
SELECT 'admin_users' as table_name, COUNT(*) as record_count FROM admin_users
UNION ALL
SELECT 'partners' as table_name, COUNT(*) as record_count FROM partners
UNION ALL
SELECT 'users' as table_name, COUNT(*) as record_count FROM users
UNION ALL
SELECT 'quotes' as table_name, COUNT(*) as record_count FROM quotes
UNION ALL
SELECT 'quote_items' as table_name, COUNT(*) as record_count FROM quote_items
UNION ALL
SELECT 'sessions' as table_name, COUNT(*) as record_count FROM sessions
ORDER BY table_name;

\echo ''

-- 4. Product catalog verification
\echo '4. PRODUCT CATALOG ANALYSIS'
\echo '--------------------------'
\echo 'Products by Category:'
SELECT 
    category,
    COUNT(*) as product_count,
    ROUND(AVG(base_price::numeric), 2) as avg_price,
    MIN(base_price::numeric) as min_price,
    MAX(base_price::numeric) as max_price
FROM items 
GROUP BY category
ORDER BY category;

\echo ''
\echo 'Products by Quality Level:'
SELECT 
    quality,
    COUNT(*) as product_count,
    ROUND(AVG(base_price::numeric), 2) as avg_price,
    MIN(min_margin) as min_margin_allowed,
    MAX(max_margin) as max_margin_allowed
FROM items 
GROUP BY quality
ORDER BY 
    CASE quality 
        WHEN 'Plata' THEN 1 
        WHEN 'Oro' THEN 2 
        WHEN 'Platino' THEN 3 
    END;

\echo ''
\echo 'Products by Event Type:'
SELECT 
    ambientacion,
    COUNT(*) as product_count,
    ROUND(AVG(base_price::numeric), 2) as avg_price
FROM items 
GROUP BY ambientacion
ORDER BY ambientacion;

\echo ''
\echo 'Product Distribution Matrix:'
SELECT 
    category,
    quality,
    ambientacion,
    COUNT(*) as count
FROM items 
GROUP BY category, quality, ambientacion
ORDER BY category, quality, ambientacion;

\echo ''

-- 5. Authentication accounts verification
\echo '5. AUTHENTICATION ACCOUNTS'
\echo '-------------------------'
\echo 'Admin Users:'
SELECT 
    username,
    created_at,
    (CASE WHEN LENGTH(password) > 50 THEN 'Properly Hashed' ELSE 'Plain Text (INSECURE)' END) as password_status
FROM admin_users
ORDER BY created_at DESC
LIMIT 10;

\echo ''
\echo 'Partner Accounts:'
SELECT 
    username,
    full_name,
    company,
    email,
    is_active,
    registration_date,
    (CASE WHEN LENGTH(password) > 50 THEN 'Properly Hashed' ELSE 'Plain Text (INSECURE)' END) as password_status
FROM partners
ORDER BY registration_date DESC
LIMIT 10;

\echo ''

-- 6. Quotes and quote items verification (if any exist)
\echo '6. QUOTES VERIFICATION'
\echo '---------------------'
SELECT 
    COUNT(*) as total_quotes,
    COUNT(CASE WHEN status = 'draft' THEN 1 END) as draft_quotes,
    COUNT(CASE WHEN status = 'sent' THEN 1 END) as sent_quotes,
    COUNT(CASE WHEN status = 'accepted' THEN 1 END) as accepted_quotes,
    COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_quotes,
    COUNT(CASE WHEN status = 'executed' THEN 1 END) as executed_quotes,
    COUNT(CASE WHEN status = 'expired' THEN 1 END) as expired_quotes
FROM quotes;

\echo ''

-- 7. Index verification
\echo '7. DATABASE INDEXES'
\echo '------------------'
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

\echo ''

-- 8. Database constraints verification
\echo '8. TABLE CONSTRAINTS'
\echo '-------------------'
SELECT 
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    tc.is_deferrable,
    tc.initially_deferred
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
WHERE tc.table_schema = 'public'
ORDER BY tc.table_name, tc.constraint_type, tc.constraint_name;

\echo ''

-- 9. Sample data verification
\echo '9. SAMPLE DATA VERIFICATION'
\echo '--------------------------'
\echo 'Sample Items (showing first 5 from each category):'
WITH ranked_items AS (
    SELECT 
        name,
        category,
        quality,
        ambientacion,
        base_price,
        ROW_NUMBER() OVER (PARTITION BY category ORDER BY name) as rn
    FROM items
    WHERE status = 'active'
)
SELECT 
    category,
    quality,
    ambientacion,
    name,
    base_price
FROM ranked_items
WHERE rn <= 5
ORDER BY category, rn;

\echo ''

-- 10. Database size and performance info
\echo '10. DATABASE SIZE AND PERFORMANCE'
\echo '--------------------------------'
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

\echo ''

-- 11. Expected vs Actual verification
\echo '11. EXPECTED VS ACTUAL DATA CHECK'
\echo '--------------------------------'
WITH expected_data AS (
    SELECT 
        'items' as table_name, 
        87 as expected_count,
        'Product catalog should have 87 items' as description
    UNION ALL
    SELECT 
        'admin_users' as table_name, 
        1 as expected_count,
        'Should have at least 1 admin user (admin)' as description
    UNION ALL
    SELECT 
        'partners' as table_name, 
        1 as expected_count,
        'Should have at least 1 partner for testing' as description
),
actual_data AS (
    SELECT 'items' as table_name, COUNT(*) as actual_count FROM items
    UNION ALL
    SELECT 'admin_users' as table_name, COUNT(*) as actual_count FROM admin_users
    UNION ALL
    SELECT 'partners' as table_name, COUNT(*) as actual_count FROM partners
)
SELECT 
    e.table_name,
    e.expected_count,
    a.actual_count,
    (CASE 
        WHEN a.actual_count >= e.expected_count THEN '✅ PASS'
        ELSE '❌ FAIL'
    END) as status,
    e.description
FROM expected_data e
LEFT JOIN actual_data a ON e.table_name = a.table_name
ORDER BY e.table_name;

\echo ''

-- 12. Quality assurance checks
\echo '12. QUALITY ASSURANCE CHECKS'
\echo '----------------------------'

\echo 'Checking for invalid data:'

-- Check for products with invalid prices
SELECT 
    'Invalid Prices' as check_type,
    COUNT(*) as count,
    (CASE WHEN COUNT(*) = 0 THEN '✅ PASS' ELSE '❌ FAIL' END) as status
FROM items 
WHERE base_price <= 0 OR base_price IS NULL;

-- Check for products with invalid margins
SELECT 
    'Invalid Margins' as check_type,
    COUNT(*) as count,
    (CASE WHEN COUNT(*) = 0 THEN '✅ PASS' ELSE '❌ FAIL' END) as status
FROM items 
WHERE min_margin < 0 OR max_margin < 0 OR min_margin > max_margin;

-- Check for admin users with weak passwords (plain text)
SELECT 
    'Weak Admin Passwords' as check_type,
    COUNT(*) as count,
    (CASE WHEN COUNT(*) = 0 THEN '✅ PASS' ELSE '❌ FAIL' END) as status
FROM admin_users 
WHERE LENGTH(password) < 50;

-- Check for partner users with weak passwords (plain text)
SELECT 
    'Weak Partner Passwords' as check_type,
    COUNT(*) as count,
    (CASE WHEN COUNT(*) = 0 THEN '✅ PASS' ELSE '❌ FAIL' END) as status
FROM partners 
WHERE LENGTH(password) < 50;

\echo ''

-- 13. Final summary
\echo '13. VERIFICATION SUMMARY'
\echo '-----------------------'
WITH verification_summary AS (
    SELECT 
        (SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public') as tables_created,
        (SELECT COUNT(*) FROM items) as products_loaded,
        (SELECT COUNT(*) FROM admin_users) as admin_users_created,
        (SELECT COUNT(*) FROM partners) as partners_created,
        (SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public') as indexes_created
)
SELECT 
    tables_created || ' tables created' as tables_status,
    products_loaded || ' products loaded' as products_status,
    admin_users_created || ' admin users' as admin_status,
    partners_created || ' partners' as partners_status,
    indexes_created || ' indexes created' as indexes_status,
    (CASE 
        WHEN tables_created >= 7 AND products_loaded >= 80 AND admin_users_created >= 1
        THEN '🎉 DATABASE READY FOR PRODUCTION'
        ELSE '⚠️ DATABASE SETUP INCOMPLETE'
    END) as overall_status
FROM verification_summary;

\echo ''
\echo '======================================================================'
\echo 'VERIFICATION COMPLETED'
\echo '======================================================================'
\echo ''
\echo 'If all checks show ✅ PASS, your database is ready for production!'
\echo 'If any checks show ❌ FAIL, please review the setup instructions.'
\echo ''