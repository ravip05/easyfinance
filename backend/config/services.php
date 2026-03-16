<?php

// services config for third party integrations

return [

    'firebase' => [
        'project_id' => env('FIREBASE_PROJECT_ID', ''),
        'server_key' => env('FIREBASE_SERVER_KEY', ''),
    ],

];
