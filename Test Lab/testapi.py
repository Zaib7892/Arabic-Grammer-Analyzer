import requests

# Replace this with your Farasa API key
API_KEY = 'WltNKBUvNMAeBFxAWO'  # Your Farasa API key here

# Define the URL for the Farasa Dependency Parser API
FARASA_API_URL = 'https://farasa.qcri.org/api/parser'

# Example text for parsing
text = "اللغة العربية لغة جميلة ومعقدة"

def analyze_with_farasa(text):
    try:
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {API_KEY}'
        }
        payload = {'text': text}
        response = requests.post(FARASA_API_URL, json=payload, headers=headers)
        
        # Check if the response is successful
        if response.status_code == 200:
            parsed_data = response.json()
            print("Parsed Data: ", parsed_data)
            return parsed_data  # You can format the response as needed
        else:
            print(f"Error: {response.status_code}, {response.text}")
            return {'error': 'Failed to analyze with Farasa'}
    except Exception as e:
        print(f"Exception occurred: {e}")
        return {'error': str(e)}

# Test the Farasa parser
if __name__ == "__main__":
    result = analyze_with_farasa(text)
    print(result)
