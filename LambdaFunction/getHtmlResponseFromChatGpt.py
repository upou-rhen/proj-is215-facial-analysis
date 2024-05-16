import json
import urllib3
import boto3
import os

def get_chatgpt_response(labels):
	api_key = os.getenv("API_KEY_CHATGPT")
	url = "https://api.openai.com/v1/chat/completions"
	headers = {
		"Content-Type": "application/json",
		"Authorization": f"Bearer {api_key}"
	}

	prompt = "You need to write a news article based on these keywords: "
	for label in labels:
		prompt += f"{label}, "
    	
	prompt += "Your response must be at maximum of 500 words and must start with a one-sentence short title for the news article. Headline must be wrapped in double asterisks. Each paragraph must be delimited by a pipe character after the last word of the paragraph. Don't forget to add 50% humor."

	print(prompt)

	payload = {
		"model": "gpt-3.5-turbo",
		"messages": [{ "role": "user", "content": f"{prompt}" }, { "role": "system", "content": "You're a veteran news reporter" }],
		"temperature": 1,
		#"max_tokens": 256, #default is 2046 tokens
		"top_p": 1,
		"frequency_penalty": 0,
		"presence_penalty": 0
	}
	
	#print(payload)

	encodedPayload = json.dumps(payload)
	http = urllib3.PoolManager()
	r = http.request('POST', url, headers=headers, body=encodedPayload)

	resp_body = r.data.decode('utf-8')
	parsed_resp = json.loads(resp_body)

	#print(resp_body)
	print(parsed_resp)

	choice_content = parsed_resp['choices'][0]['message']['content']
	return choice_content

def lambda_handler(event, context):
    print(event)
    bucket = event["bucket"]
    key = event["key"]
    
    rekog = boto3.client("rekognition")
    s3 = boto3.client("s3")

    s3_obj = {
	    "S3Object": {
		    "Bucket": bucket,
		    "Name": key
        }
    }

    try:
        response_faces = rekog.detect_faces(Image = s3_obj, Attributes=['ALL'])
        print(f'Detected faces for {key}')

        face_details = response_faces['FaceDetails']
		
        print(face_details)
        
        face_count = len(face_details)
        print(face_count)
        
        attributes = []
        attributes.append(f"there are {face_count} faces in this photo")
        counter = 1
        for fd in face_details:
            age_range_low = str(fd['AgeRange']['Low'])		#int
            age_range_high = str(fd['AgeRange']['High'])	#int
            gender = str(fd['Gender']['Value'])				#string
            emotion = str(fd['Emotions'][0]['Type'])		#top 1 only, highest confidence
            smile = fd['Smile']['Value']					#bool
            eye_glasses = fd['Eyeglasses']['Value']			#bool
            face_occluded = fd['FaceOccluded']['Value']		#bool
            sunglasses = fd['Sunglasses']['Value']			#bool
            beard = fd['Beard']['Value']					#bool
            mustache = fd['Mustache']['Value']				#bool
            eyes_open = fd['EyesOpen']['Value']				#bool
            mouth_open = fd['MouthOpen']['Value']			#bool

            attributes.append(f"#{counter}")
            attributes.append(f"age range is from {age_range_low} to {age_range_high}")
            attributes.append(f"gender is {gender}")
            attributes.append(f"is {emotion}")
            attributes.append(f"{"smiling" if smile else ""}")
            attributes.append(f"{"has eyeglasses" if eye_glasses else ""}")
            attributes.append(f"{"face is occluded" if face_occluded else ""}")
            attributes.append(f"{"wearing sunglasses" if sunglasses else ""}")
            attributes.append(f"{"has beard" if beard else ""}")
            attributes.append(f"{"has mustache" if mustache else ""}")
            attributes.append(f"{"eyes are open" if eyes_open else ""}")
            attributes.append(f"{"mount is open" if mouth_open else ""}")
            counter += 1
			
        print(attributes)

        gpt_response = get_chatgpt_response(attributes)

        return {
            "statusCode": 200,
            "body": gpt_response
        }
    except Exception as e:
        print("Error:", e)
        return {
            "statusCode": 500,
            "body": json.dumps("Error processing image")
        }