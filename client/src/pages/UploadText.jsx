import React, { useState } from 'react';
import '../style/UploadText.css'; // Import your CSS file

function UploadText() {
  const [inputText, setInputText] = useState('');
  const [sentences, setSentences] = useState([]);
  const [selectedSentence, setSelectedSentence] = useState('');

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

  return (
    <div className="text-analysis">
      <textarea
        className="text-input"
        placeholder="Enter your Arabic text here"
        value={inputText} // Update value with inputText state
        onChange={handleTextChange} // Call handleTextChange on text change
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
    </div>
  );
}

export default UploadText;
