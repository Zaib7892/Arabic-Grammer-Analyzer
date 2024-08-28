from flask import Flask, request, jsonify
from flask_cors import CORS
import spacy_stanza
import logging
import stanza

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Set up logging
logging.basicConfig(level=logging.DEBUG)

# Download and initialize the stanza pipeline for Arabic
stanza.download('ar')
nlp = spacy_stanza.load_pipeline('ar')

@app.route('/analyze', methods=['POST'])
def analyze_text():
    try:
        data = request.get_json()
        text = data['text']
        logging.debug(f"Received text for analysis: {text}")
        doc = nlp(text)
        result = []
        for token in doc:
            result.append({
                'text': token.text,
                'lemma': token.lemma_,
                'pos': token.pos_,
                'dep': token.dep_,
                "head": token.head.text if token.head else 'ROOT'
            })
        return jsonify(result)
    except Exception as e:
        logging.error(f"Error processing request: {e}", exc_info=True)
        return jsonify({'error': 'Internal Server Error'}), 500

if __name__ == '__main__':
    app.run(port=5000)
