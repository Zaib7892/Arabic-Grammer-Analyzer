from flask import Flask, request, jsonify
from flask_cors import CORS
import stanza
import spacy_stanza
import logging

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Set up logging
logging.basicConfig(level=logging.DEBUG)

# Initialize the Stanza pipeline for Arabic
stanza.download('ar')
nlp = spacy_stanza.load_pipeline('ar')

@app.route('/semantic-analyze', methods=['POST'])
def semantic_analyze():
    try:
        data = request.get_json()
        text = data['text']
        logging.debug(f"Received text for semantic analysis: {text}")
        doc = nlp(text)

        # Analyzing sentence-level relations
        relations = []
        for i, sentence in enumerate(doc.sents):
            for j, next_sentence in enumerate(doc.sents[i+1:], start=i+1):
                # Placeholder: Analyze relation between sentences (i) and (j)
                # Add custom logic to find relations between sentences
                relation = f"Relation between sentence {i+1} and {j+1}: <description>"
                relations.append(relation)

        return jsonify({'relations': relations})
    except Exception as e:
        logging.error(f"Error processing request: {e}", exc_info=True)
        return jsonify({'error': 'Internal Server Error'}), 500

if __name__ == '__main__':
    app.run(port=5005)
