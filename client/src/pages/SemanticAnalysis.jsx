import React, { useState, useRef } from 'react';
import '../style/SemanticAnalysis.css';

const SemanticAnalysis = () => {
    const [arabicText, setArabicText] = useState('');
    const [translatedText, setTranslatedText] = useState('');
    const [analysisResult, setAnalysisResult] = useState([]); // Add this line to define analysisResult state
    const [errorMessage, setErrorMessage] = useState('');
  
    // Handle changes in the Arabic text input
    const handleTextChange = (e) => {
      setArabicText(e.target.value);
    };
  
    // Handle the translation request
    const handleTranslate = async () => {
      if (!arabicText.trim()) {
        setErrorMessage('Please enter some Arabic text.');
        return;
      }
  
      try {
        const response = await fetch('http://localhost:8000/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: arabicText, to: 'en' }),
        });
  
        if (response.ok) {
          const data = await response.json();
          setTranslatedText(data.translatedText);
          setErrorMessage('');
        } else {
          setErrorMessage('Failed to translate the text. Please try again.');
        }
      } catch (error) {
        setErrorMessage('An error occurred while connecting to the translation service.');
      }
    };
  
    // Handle the semantic analysis request
    const handleAnalyze = async () => {
      if (!arabicText.trim()) {
        setErrorMessage('Please enter some Arabic text for analysis.');
        return;
      }
  
      try {
        const response = await fetch('http://localhost:5005/semantic-analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: arabicText }),
        });
  
        if (response.ok) {
          const data = await response.json();
          setAnalysisResult(data.relations); // Use setAnalysisResult to update the state
          setErrorMessage('');
        } else {
          setErrorMessage('Failed to analyze the text. Please try again.');
        }
      } catch (error) {
        setErrorMessage('An error occurred while connecting to the analysis service.');
      }
    };
  
    return (
      <div className="semantic-analysis-container">
        {/* Left side: Translation Box */}
        <div className="translation-box">
          <textarea
            value={translatedText}
            readOnly
            placeholder="Translated text will appear here..."
            className="translation-textarea"
          />
          <button onClick={handleTranslate} className="translate-button">
            Translate
          </button>
        </div>
  
        {/* Right side: Arabic Input Box */}
        <div className="arabic-input-box">
          <textarea
            value={arabicText}
            onChange={handleTextChange}
            placeholder="Enter Arabic text here..."
            className="arabic-textarea"
          />
          <button onClick={handleAnalyze} className="analyze-button">
            Analyze
          </button>
          {errorMessage && <p className="error-message">{errorMessage}</p>}
        </div>
  
        {/* Display Analysis Result */}
        {analysisResult.length > 0 && (
          <div className="analysis-result">
            <h3>Sentence Relations:</h3>
            <ul>
              {analysisResult.map((relation, index) => (
                <li key={index}>{relation}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };
  
  export default SemanticAnalysis;
