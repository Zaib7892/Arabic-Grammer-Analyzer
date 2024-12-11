![Logo](client/public/logo.png)
# Arabic Grammar Analyzer

## Introduction
The **Arabic Grammar Analyzer** is a tool designed to analyze and parse Arabic sentences. It identifies grammatical components, such as nouns, verbs, and particles, and provides syntactic structures of the input text. This project aims to assist linguists, educators, and software developers working with the Arabic language by providing detailed grammatical insights.

---

## Main Features
- **Arabic Tokenization**: Breaks down Arabic sentences into individual tokens.
- **Grammatical Analysis**: Identifies parts of speech such as nouns, verbs, and particles.
- **Syntactic Parsing**: Analyzes sentence structures to show grammatical relationships.
- **Diacritic Support**: Handles both diacritic-sensitive and diacritic-free Arabic text.
- **User-Friendly Interface**: Designed for ease of use with clear results.

---

## App Structure
   Arabic-Grammar-Analyzer/
- ├── camel_parser/       # camel parsing server
- ├── client/             # React client-side application (frontend)
- ├── db/                 # Database connection 
- ├── middleware/         # Middleware functions for the server
- ├── models/             # Data models for the application
- ├── node_modules/       # Node.js dependencies (automatically managed by npm/yarn)
- ├── Parsing Server/     # Spacy parsing server and translation server

---

## Installation Guide
Follow these steps to set up the project on your local machine:

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/Zaib7892/Arabic-Grammer-Analyzer.git
2. **Install Dependencies for react**
  - 2.1. **for server**
   run command
   ```bash
   npm install
   ```
  - 2.2.
   First navigate to client
   run command
   ```bash
   cd client
   ```
  - 2.3.
   run command
   ```bash
   npm install
   ```
3. **setting up servers**
  - 3.1. **Parsing Servers**
   Run following command in directory where you downloaded requirements.txt file
   ```bash
   pip install -r requirements.txt
   ```
  - 3.2. **Translation server**
   go to folder Parsing Server and unzip free-translation-api.zip

  - 3.3. **How to run servers**
      - 3.3.1. **Translation server**
       after unzipping the free-translation-api.zip then run following command in unzipped folder
       ```bash
       go run main.go
       ```
       this will start the translation server
       - 3.3.2. **Spacy/Camel Server**
       after installing all required pachages from requirement.txt file
       run parsing_server.py file. This should start parsing servers if you have successfully installed required packages
## Run Application
1. **Connect with database**
   In Arabic Grammar Analyzer directory run following comman on Command Prompt
   ```bash
   nodemon
   ```
2. **Start Application**
   open new PowerShell terminal and nivagate to the \client by command
   ```bash
   cd client
   ```
   once you navigated to client then run
   ```bash
   npm start
   ```
   The Application will be started on link
   ```bash
   https://localhost:3000
   ```


   
   
   
   

