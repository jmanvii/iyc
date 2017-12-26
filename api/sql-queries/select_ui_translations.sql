SELECT 
    lang,
    t_group,
    t_key,
    t_value
FROM 
    ui_translations
WHERE
    $1::TEXT IS NULL OR lang = $1::TEXT
ORDER BY
    t_group, t_key, lang;