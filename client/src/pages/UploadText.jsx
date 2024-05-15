import React, { useState } from 'react';
import '../style/UploadText.css'; // Import your CSS file

function UploadText() {
  const [inputText, setInputText] = useState('');
  const [sentences, setSentences] = useState([]);
  const [selectedSentence, setSelectedSentence] = useState('');
  const [translatedText, setTranslatedText] = useState(''); // New state for translation


  // Function to separate sentences using regular expressions (basic example)
  function segmentSentences(text) {
    const regex = /[\.\?\!](?:\s+|$)/; // Regex for sentence boundaries
    return text.split(regex);
  }

  const handleTextChange = (event) => {
    setInputText(event.target.value);
    setSentences(segmentSentences(event.target.value)); // Update sentences on text change
  };

  const selectSentence = (index) => {
    setSelectedSentence(sentences[index]);
  };

  const handleTranslate = async () => {
    try {
      console.log("entered into the try block")
      const response = await fetch('http://localhost:8000/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText, to: 'en' }), // Translate entire inputText to English ('en')
      });

      if (response.ok) {
        console.log("response came from local server")
        const data = await response.json();
        console.log("data taken from the response data,", data)
        console.log("data.translation ", data.translatedText)
        setTranslatedText(data.translatedText);


          // Save uploaded text to local storage
      localStorage.setItem('uploadedText', inputText);

      } else {
        setTranslatedText('Error translating text');
      }
    } catch (error) {
      setTranslatedText('Error communicating with API');
    }
  };



  return (
    <div className="text-analysis">
      <textarea
        className="text-input"
        placeholder="Enter your Arabic text here"
        value={inputText}
        onChange={handleTextChange}
      />
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
    </div>
  );

}

export default UploadText;
