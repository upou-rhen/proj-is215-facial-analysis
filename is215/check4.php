<?php
require 'vendor/autoload.php';

use Aws\S3\S3Client;
use GuzzleHttp\Client;

// HTML header with added CSS for styling
echo "<!DOCTYPE html>
<html lang='en'>
<head>
    <meta charset='UTF-8'>
    <title>IS215 - Fictional Analysis of Image: Fajardo, Sebuano, Llobrera, De Guzman, Callado, Sual</title>
<style>
        body { font-family: Arial, sans-serif; margin: 40px; background-color: #f4f4f9; color: #333; }
        h1 { color: #0056b3; }
        p { margin: 20px 0; line-height: 1.6; }
        .error { color: #ff0000; }
</style>
</head>
<body>";

// Initialize the AWS S3 Client
$s3Client = new S3Client([
    'version' => 'latest',
    'region'  => 'ap-southeast-1',
    'credentials' => [
        'key'    => 'AKIA6GBMDIA7HGO27Z6J',
        'secret' => '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',    
    ]
]);

$bucket = 'is215-bucket';

// Check if an image key is provided and remove the file extension for JSON key
$imagekey = isset($_GET['e']) ? $_GET['e'] : 'default_image.jpg';  // Default image if none specified
$jsonkey = 'json/' . pathinfo($imagekey, PATHINFO_FILENAME) . '_labels.json';  // Creates json filename based on image key

try {
    // Get the object from the bucket
    $result = $s3Client->getObject([
        'Bucket' => $bucket,
        'Key'    => $jsonkey
    ]);

    $cmd = $s3Client->getCommand('GetObject', [
        'Bucket' => $bucket,
        'Key'    => $imagekey
    ]);


    // Read the content of the file
    $jsonContent = (string) $result['Body'];
    $data = json_decode($jsonContent, true);
    $narrativePrompt = "Create a fictional story based on the following details: ";

    foreach ($data as $item) {
        $narrativePrompt .= $item['Name'] . ' (' . round($item['Confidence'], 2) . '% confidence), ';
    }

    // Trim the trailing comma
    $narrativePrompt = rtrim($narrativePrompt, ', ');

    // Now prepare to call OpenAI API
    $client = new Client();
    $response = $client->request('POST', 'https://api.openai.com/v1/chat/completions', [
        'headers' => [
            'Content-Type' => 'application/json',
            'Authorization' => 'Bearer sk-proj-v0AvV0e4ChPyp9NC4UhrT3BlbkFJm0OtwAhKZluFfwlAqyIV'
        ],
        'json' => [
            'model' => 'gpt-4',
            'messages' => [
                ['role' => 'system', 'content' => 'You are a creative writer tasked with writing a story.'],
                ['role' => 'user', 'content' => $narrativePrompt]
            ]
        ]
    ]);

    $analysis = json_decode($response->getBody(), true);

    $imageUrl = (string) $s3Client->createPresignedRequest($cmd, '+20 minutes')->getUri();

    echo "<h1>OpenAI Analysis:</h1>"; 
    
    echo "<img src='$imageUrl' width='512px' border='1' alt='Event Image'>";

    echo "<br/><br/>". "<p>" . htmlspecialchars($analysis['choices'][0]['message']['content']) . "</p>";

    echo "<br/>DO another upload: <a href='main.html'>Click here</a>";

    echo "<br/>University of the Philippines, Open University - IS215: Final Project - Fajardo, Sebuano, Llobrera, De Guzman, Callado, Sual - Advance Computer Systems. Submitted to Prof. Katrina Joy Abriol-Santos";

}

  catch (Aws\Exception\AwsException $e) {
    // Output error message if AWS fails
    echo "<p class='error'>AWS Error: " . htmlspecialchars($e->getMessage()) . "</p>";
} catch (\GuzzleHttp\Exception\GuzzleException $e) {
    // Output error message if OpenAI API call fails
    echo "<p class='error'>OpenAI Error: " . htmlspecialchars($e->getMessage()) . "</p>";
}

echo "</body></html>";
?>

