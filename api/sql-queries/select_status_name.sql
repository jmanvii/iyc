SELECT 
    name 
FROM 
    generic_statuses
WHERE 
    id = $1
LIMIT 
    1;