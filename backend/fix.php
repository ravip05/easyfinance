<?php
$source = __DIR__ . "/vendor/laravel/framework/src/Illuminate/Macroable/Traits/Macroable.php";
$dest = __DIR__ . "/vendor/laravel/framework/src/Illuminate/Support/Traits/Macroable.php";
if (!is_dir(dirname($dest))) {
    mkdir(dirname($dest), 0777, true);
}
$content = file_get_contents($source);
if ($content) {
    $content = str_replace("namespace Illuminate\\Macroable\\Traits;", "namespace Illuminate\\Support\\Traits;", $content);
    file_put_contents($dest, $content);
    echo "Fixed";
} else {
    echo "Source missing";
}
