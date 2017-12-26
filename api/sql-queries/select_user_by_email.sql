SELECT 
    u.id,
    u.email,
    u.password,
    u.first_name,
    u.last_name,
    u.permission,
    u.settings
FROM
    users AS u
WHERE
    email = $1