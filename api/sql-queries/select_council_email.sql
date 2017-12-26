SELECT
    settings->>'council_email' AS email
FROM
    users
WHERE
    id = (
        SELECT 
            settings->>'linked_council_id'
        FROM 
            form_item_options 
        WHERE 
            id = (
                SELECT 
                    option_id 
                FROM 
                    form_response_items 
                WHERE 
                    response_id = $1 
                    AND 
                    item_id = (
                        SELECT id FROM form_items WHERE settings->'linked_to_council' = 'true' LIMIT 1
                    ) 
                LIMIT 1
            )
    )::BIGINT