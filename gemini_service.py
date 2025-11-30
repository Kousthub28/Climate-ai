from flask import Flask, request, jsonify
import google.generativeai as genai
import traceback
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get API key from environment variable
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

if not GOOGLE_API_KEY:
    raise ValueError("GOOGLE_API_KEY not found in environment variables. Please set it in .env file")

genai.configure(api_key=GOOGLE_API_KEY)

print("Available models:")
for m in genai.list_models():
    print(m.name)

model = genai.GenerativeModel("models/gemini-2.5-pro")

app = Flask(__name__)

@app.route('/ask_gemini', methods=['POST'])
def ask_gemini():
    data = request.json
    question = data.get('question', '')
    print("Prompt sent to Gemini:", question)
    try:
        response = model.generate_content(question)
        return jsonify({'answer': response.text})
    except Exception as e:
        print("Gemini API error:", e)
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

# Add a test endpoint to verify the service is running
@app.route('/', methods=['GET'])
def test():
    return "Gemini service is running!"

if __name__ == '__main__':
    app.run(port=5001) 