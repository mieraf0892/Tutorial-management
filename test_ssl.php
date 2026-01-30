<?php
$ch = curl_init("https://www.google.com");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);

if (curl_errno($ch)) {
    echo '❌ SSL Error: ' . curl_error($ch);
} else {
    echo '✅ SSL Connection Successful!';
}

curl_close($ch);
?>