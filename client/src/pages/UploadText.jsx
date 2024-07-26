import React, { useState } from 'react';
import '../style/UploadText.css'; // Import your CSS file

function UploadText() {
  const [inputText, setInputText] = useState('');
  const [sentences, setSentences] = useState([]);
  const [selectedSentence, setSelectedSentence] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [language, setLanguage] = useState('');
  const [showFields, setShowFields] = useState(false); // Track if "Proceed" button has been clicked

  // Function to separate sentences using regular expressions
  function segmentSentences(text) {
    const regex = /[\.\?\!](?:\s+|$)/; // Regex for sentence boundaries
    return text.split(regex).filter(sentence => sentence.trim() !== '');
  }

  const handleTextChange = (event) => {
    const text = event.target.value;

    setInputText(text);
    setSentences(segmentSentences(text));
    setWordCount(text.split(/\s+/).filter(word => word.trim() !== '').length);
    detectLanguage(text);
  };

  const selectSentence = (index) => {
    setSelectedSentence(sentences[index]);
  };

  const handleTranslate = async () => {
    try {
      const response = await fetch('http://localhost:8000/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText, to: 'en' }), // Translate entire inputText to English ('en')
      });

      if (response.ok) {
        const data = await response.json();
        setTranslatedText(data.translatedText);
      } else {
        setTranslatedText('Error translating text');
      }
    } catch (error) {
      setTranslatedText('Error communicating with API');
    }
  };

  const detectLanguage = async (text) => {
    try {
      const response = await fetch('http://localhost:8000/detectLanguage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text }),
      });

      if (response.ok) {
        const data = await response.json();
        setLanguage(data.language);
      } else {
        setLanguage('Unknown');
      }
    } catch (error) {
      setLanguage('Error detecting language');
    }
  };

  const handleProceed = () => {
    setShowFields(true); // Show additional fields when "Proceed" is clicked
  };

  return (
    <div className="text-analysis">
      <textarea
        className="text-input"
        placeholder="Enter your text here"
        value={inputText}
        onChange={handleTextChange}
      />
      {!showFields && inputText && (
        <button className="proceed-text-button" onClick={handleProceed}>Proceed</button>
      )}
      {showFields && (
        <>
          <div className="results-container">
            <div className="selected-sentence">{selectedSentence}</div>
            <div className="sentences-list">
              {sentences.map((sentence, index) => (
                <div key={index} onClick={() => selectSentence(index)}>
                  {index + 1}. {sentence}
                </div>
              ))}
            </div>
          </div>
          <button className="analyze-text-button">Analyze Text</button>
          <button className="translate-button-uploadtext" onClick={handleTranslate}>
            Translate
          </button>
          <div className="translation-section">
            <div className="translation-text">{translatedText}</div>
          </div>
        </>
      )}
    </div>
  );
}

export default UploadText;
