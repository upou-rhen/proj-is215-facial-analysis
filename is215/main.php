<?php
require 'vendor/autoload.php';

use Aws\S3\S3Client;
use Aws\Exception\AwsException;

// Initialize the S3 client with your AWS credentials
$s3Client = new S3Client([
    'version'     => 'latest',
    'region'      => 'ap-southeast-1',  // Set your AWS region
    'credentials' => [
        'key'    => 'XXXXXXXXXX',
        'secret' => 'XXXXXXXXXX',
    ]
]);

$bucketName = 'is215-bucket';  // Replace with your bucket name

// Check if the form was submitted
if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_FILES['image'])) {
    $file = $_FILES['image'];

    // Ensure the file was uploaded successfully
    if ($file['error'] === UPLOAD_ERR_OK) {
        $tmpName = $file['tmp_name'];
        $key = basename($file['name']);

        try {
            // Upload the file to the specified bucket
            $result = $s3Client->putObject([
                'Bucket' => $bucketName,
                'Key'    => "$key",  // Optional: Prefix with 'uploads/' to place the file in the uploads directory
                'SourceFile' => $tmpName
            ]);

	    // Redirect to another page after 30 seconds
            header("Refresh:30; url=check4.php?&e=$key");  // Adjust 'success.html' to your target page URL

            echo "File uploaded successfully. File URL is: " . $result->get('ObjectURL');
            echo "<p>You will be redirected in 30 seconds...</p>";
	
	} catch (AwsException $e) {
            echo "Error uploading file: " . $e->getMessage();
        }
    } else {
        echo "File upload error: " . $file['error'];
    }
} else {
    echo "No file was uploaded or wrong HTTP method used.";
}
?>

