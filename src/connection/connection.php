<?php
    define('PG_DB', "BTL");
    define('PG_HOST', "localhost");
    define('PG_USER', "postgres");
    define('PG_PORT', "5432");
    define('PG_PASS_Hien', "admin");
    define('PG_PASS_Vanh', "vuvananh140802");
    define('PG_PASS_Minh', "24062002");

    $conn =  pg_connect("dbname=".PG_DB." password=".PG_PASS_Hien." host=".PG_HOST." user=".PG_USER." port=".PG_PORT);   
    // $conn =  pg_connect("dbname=".PG_DB." password=".PG_PASS_Vanh." host=".PG_HOST." user=".PG_USER." port=".PG_PORT);   
    // $conn =  pg_connect("dbname=".PG_DB." password=".PG_PASS_Minh." host=".PG_HOST." user=".PG_USER." port=".PG_PORT);   


?>