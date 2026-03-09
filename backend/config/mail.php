<?php
return [
    'default'  => env('MAIL_MAILER', 'log'),
    'mailers'  => [
        'smtp'    => ['transport'=>'smtp','url'=>env('MAIL_URL'),'host'=>env('MAIL_HOST','127.0.0.1'),'port'=>env('MAIL_PORT',2525),'encryption'=>env('MAIL_ENCRYPTION','tls'),'username'=>env('MAIL_USERNAME'),'password'=>env('MAIL_PASSWORD'),'timeout'=>null,'local_domain'=>env('MAIL_EHLO_DOMAIN')],
        'log'     => ['transport'=>'log','channel'=>env('LOG_CHANNEL','stack')],
        'array'   => ['transport'=>'array'],
        'failover'=> ['transport'=>'failover','mailers'=>['smtp','log']],
        'roundrobin'=>['transport'=>'roundrobin','mailers'=>['ses','smtp']],
    ],
    'from' => ['address'=>env('MAIL_FROM_ADDRESS','noreply@easyfinancewale.in'),'name'=>env('MAIL_FROM_NAME','EasyFinance CRM')],
];
