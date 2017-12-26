SELECT 
    value AS email
FROM 
    form_response_items 
WHERE 
    response_id = $1
    AND 
    item_id = 10
LIMIT 
    1