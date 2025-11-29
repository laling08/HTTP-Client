<?php

declare(strict_types=1);

$app = require_once realpath(__DIR__ . '/../config/bootstrap.php');

$app->add(new App\Middleware\CorsMiddleware());

$app->run();
