<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['*'],
    'allowed_origins' => [
        'http://localhost:5173',
        env('FRONTEND_URL', 'http://localhost:5173'),
        'http://' . parse_url(env('FRONTEND_URL', 'http://localhost:5173'), PHP_URL_HOST),
        'https://' . parse_url(env('FRONTEND_URL', 'http://localhost:5173'), PHP_URL_HOST),
    ],
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true,
];
