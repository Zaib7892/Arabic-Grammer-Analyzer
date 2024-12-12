from flask import Flask, request, jsonify
from flask_cors import CORS
import spacy_stanza
import logging
import stanza
import subprocess
import json
import tempfile
import os
import platform

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Set up logging
logging.basicConfig(level=logging.DEBUG)

# Download and initialize the stanza pipeline for Arabic (spaCy-Stanza)
stanza.download('ar')
nlp = spacy_stanza.load_pipeline('ar')


def run_camel_parser(input_text):
    try:
        is_windows = platform.system().lower() == 'windows'

        # Create a temporary file for the input text
        with tempfile.NamedTemporaryFile(delete=False, mode='w', encoding='utf-8', suffix='.txt') as temp_file:
            temp_file.write(input_text)
            temp_file_path = temp_file.name

        # Define the absolute path to the Camel Parser directory
        camel_parser_path = "D:\\all data\\Arabic-Grammer-Analyzer\\camel_parser"

        # Construct the shell command
        if is_windows:
            shell_command = (
                f"cmd /c \"cd {camel_parser_path} && venv\\Scripts\\activate && "
                f"python text_to_conll_cli.py -i \"{temp_file_path}\" -f text -m catib\""
            )
        else:
            shell_command = (
                f"bash -c 'cd {camel_parser_path} && source venv/bin/activate && "
                f"python text_to_conll_cli.py -i \"{temp_file_path}\" -f text -m catib'"
            )

        logging.debug(f"Running command: {shell_command}")
        logging.debug(f"Temporary file path: {temp_file_path}")

        # Execute the command
        process = subprocess.run(
            shell_command,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            shell=True
        )

        # Capture the output
        output = process.stdout.decode('utf-8')
        error_output = process.stderr.decode('utf-8')

        logging.debug(f"Camel Parser Output: {output}")
        logging.debug(f"Camel Parser Error (if any): {error_output}")

        # Handle errors
        if process.returncode != 0 or "ERROR" in error_output or "Traceback" in error_output:
            raise Exception(f"Camel Parser Error: {error_output}")

        # Clean up the temporary file
        os.remove(temp_file_path)

        # Process and return the result
        return parse_camel_output_to_json(output)
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
                ud_field = parts[5]  # Assuming 'ud' is in the 6th column (index 5)
                pos_tag = extract_pos_from_ud(ud_field)
                tokens.append({
                    'index': parts[0],
                    'text': parts[1],
                    'lemma': parts[2],
                    'pos': pos_tag,
                    'head': parts[6],
                    'dep': parts[7],
                    'morphological_features': ud_field
                })

    for token in tokens:
        head_index = int(token['head']) - 1  # Convert head index to zero-based index
        head_word = tokens[head_index]['text'] if 0 <= head_index < len(tokens) else 'ROOT'
        result.append({
            'text': token['text'],
            'lemma': token['lemma'],
            'pos': token['pos'],
            'dep': token['dep'],
            'head': head_word,
            'morphological_features': token['morphological_features']
        })

    return result

def extract_pos_from_ud(ud_field):
    """Extract the 'pos' part from the 'ud' field (e.g., 'ud=NOUN|pos=noun')"""
    ud_parts = ud_field.split('|')
    for part in ud_parts:
        if part.startswith('pos='):
            return part.split('=')[1]
    return 'UNKNOWN'

@app.route('/analyze', methods=['POST'])
def analyze_text():
    try:
        data = request.get_json()
        text = data['text']
        parser = data.get('parser', 'spacy')
        logging.debug(f"Received text for analysis: {text}, using parser: {parser}")

        if parser == 'spacy':
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
        elif parser == 'camel':
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
