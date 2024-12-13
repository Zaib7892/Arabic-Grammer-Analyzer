from flask import Flask, request, jsonify
from flask_cors import CORS
import spacy_stanza
import logging
import stanza
import subprocess
import json
import tempfile
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Set up logging
logging.basicConfig(level=logging.DEBUG)

# Download and initialize the stanza pipeline for Arabic (spaCy-Stanza)
stanza.download('ar')
nlp = spacy_stanza.load_pipeline('ar')

def run_camel_parser(input_text):
    try:
        # Create a temporary file for the input text
        with tempfile.NamedTemporaryFile(delete=False, mode='w', encoding='utf-8') as temp_file:
            temp_file.write(input_text)
            temp_file_path = temp_file.name
        
        # Command to activate the virtual environment and run the Camel Parser
        shell_command = f"bash -c 'source venv/bin/activate && python text_to_conll_cli.py -i {temp_file_path} -f text -m catib'"

        # Log the command for debugging purposes
        print(f"Running command in shell: {shell_command}")
        
        # Run the command in the shell with the appropriate working directory
        process = subprocess.run(
            shell_command, 
            stdout=subprocess.PIPE, 
            stderr=subprocess.PIPE,
            shell=True,  # This allows us to run multiple commands in sequence (activate venv, then run python)
            cwd='../camel_parser'  # Navigate to the correct working directory
        )
        
        # Capture the output (both stdout and stderr)
        output = process.stdout.decode('utf-8')
        error_output = process.stderr.decode('utf-8')

        # Print output for debugging
        print("Camel Parser Output:", output)
        print("Camel Parser Error (if any):", error_output)

        # Check if stderr contains critical errors or just informational logs
        if "ERROR" in error_output or "Traceback" in error_output:
            # If there is a real error, raise an exception
            raise Exception(f"Camel Parser Error: {error_output}")
        
        # Clean up the temporary file
        os.remove(temp_file_path)

        # Process the output and convert it to JSON format (assuming you have a function for this)
        parsed_output = parse_camel_output_to_json(output)
        
        return parsed_output
    except Exception as e:
        logging.error(f"Error running Camel Parser: {e}", exc_info=True)
        return None


def parse_camel_output_to_json(output):
    # Process the output and structure it into JSON
    lines = output.splitlines()
    result = []
    tokens = []

    # Capture all tokens from the output first
    for line in lines:
        if line.strip() and not line.startswith("#"):  # Skip comment lines
            parts = line.split()
            if len(parts) >= 10:
                # Extract the 'pos' part from the 'ud' field (e.g., 'ud=NOUN|pos=noun')
                ud_field = parts[5]  # Assuming 'ud' is in the 6th column (index 5)
                pos_tag = extract_pos_from_ud(ud_field)

                tokens.append({
                        'index': parts[0],  # Token index
                        'text': parts[1],  # Word (text)
                        'lemma': parts[2],  # Lemma (root form)
                        'pos': pos_tag,  # Extracted Part of Speech (POS) from 'ud'
                        'head': parts[6],  # Head index
                        'dep': parts[7],  # Dependency relation
                        'morphological_features': ud_field  # Add full morphological features
                    })


    # Now process tokens and replace head index with the actual head word
    for token in tokens:
        head_index = int(token['head']) - 1  # Convert head index to zero-based index
        head_word = tokens[head_index]['text'] if head_index >= 0 and head_index < len(tokens) else 'ROOT'
        
        result.append({
            'text': token['text'],   # The actual word
            'lemma': token['lemma'], # Lemma (root form of the word)
            'pos': token['pos'],     # Extracted Part of Speech (POS)
            'dep': token['dep'],     # Dependency relation (e.g., nsubj, obj)
            'head': head_word,       # Head word (word that this token is dependent on)
            'morphological_features': token['morphological_features']  # Include morph features
        })

    # Return the full structured result
    return result


def extract_pos_from_ud(ud_field):
    """Extract the 'pos' part from the 'ud' field (e.g., 'ud=NOUN|pos=noun')"""
    ud_parts = ud_field.split('|')  # Split the 'ud' field by '|'
    for part in ud_parts:
        if part.startswith('pos='):
            return part.split('=')[1]  # Return the value after 'pos='
    return 'UNKNOWN'  # Default to 'UNKNOWN' if 'pos' not found



@app.route('/analyze', methods=['POST'])
def analyze_text():
    try:
        data = request.get_json()
        text = data['text']
        parser = data.get('parser', 'spacy')  # Default to 'spacy' if not provided
        logging.debug(f"Received text for analysis: {text}, using parser: {parser}")
        
        if parser == 'spacy':
            # Use spaCy for parsing
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
                print("Spacy Result: ", result)
            return jsonify(result)
        elif parser == 'camel':
            # Use Camel Parser for parsing
            result = run_camel_parser(text)
            if result:
                return jsonify(result)
            else:
                return jsonify({'error': 'Error processing with Camel Parser'}), 500
        else:
            return jsonify({'error': 'Invalid parser selected'}), 400

    except Exception as e:
        logging.error(f"Error processing request: {e}", exc_info=True)
        return jsonify({'error': 'Internal Server Error'}), 500

if __name__ == '__main__':
    app.run(port=5000)
