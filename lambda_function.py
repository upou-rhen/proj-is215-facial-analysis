import json
import urllib.parse
import boto3

def lambda_handler(event, context):
    # Initialize S3 and Rekognition clients
    s3 = boto3.client('s3')
    rekognition = boto3.client('rekognition')

    # Get bucket name and key from the event
    bucket = event['Records'][0]['s3']['bucket']['name']
    key = urllib.parse.unquote_plus(event['Records'][0]['s3']['object']['key'])

    # Print the actual key after decoding
    print(f"Decoded key: {key}")

    # Define the directory and the path for the JSON output
    output_directory = 'json'  # You can change this to your preferred directory name
    json_output_key = f"{output_directory}/{key.rsplit('/', 1)[-1].rsplit('.', 1)[0]}_labels.json"

    if key.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.bmp')):
        print("Confirmed: The uploaded file is a photo.")

        # Call Amazon Rekognition to detect labels in the photo
        response = rekognition.detect_labels(
            Image={'S3Object': {'Bucket': bucket, 'Name': key}},
            MaxLabels=20
        )

        # Prepare the JSON data to be saved
        json_data = json.dumps(response['Labels'], indent=4)

        # Save the JSON output to the specified directory in the same S3 bucket
        s3.put_object(Bucket=bucket, Key=json_output_key, Body=json_data)
        print(f"JSON output saved to {bucket}/{json_output_key}")
    else:
        print("Uploaded file is not a photo.")

    return {
        'statusCode': 200,
        'body': json.dumps('Photo analysis and JSON generation complete!')
    }
    
