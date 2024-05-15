import React, { useState, useEffect } from 'react';
import '../style/UploadText.css'; 
import '../style/Diacritization.css'; 

function UploadText() {
  const [inputText, setInputText] = useState('');
  const [sentences, setSentences] = useState([]);
  const [selectedSentence, setSelectedSentence] = useState('');
  const [selectedSentenceIndex, setSelectedSentenceIndex] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [diacritizedSentence, setDiacritizedSentence] = useState('');

  function segmentSentences(text) {
    const regex = /[\.\?\!](?:\s+|$)/; 
    return text.split(regex);
  }

  const handleTextChange = (event) => {
    setInputText(event.target.value);
    setSentences(segmentSentences(event.target.value)); 
  };

  const selectSentence = (index) => {
    setSelectedSentenceIndex(index);
    setSelectedSentence(sentences[index]);
    setDiacritizedSentence(''); 
    setIsEditing(false); 
  };

  // Improved Diacritization Logic
  const addDiacritics = async () => {
    if (selectedSentence) { 
      try {
        const apiKey = 'WltNKBUvNMAeBFxAWO'; 
        const text = selectedSentence;
        const response = await fetch(`https://farasa.qcri.org/webapi/diacritize/?text=${text}&api_key=${apiKey}`);

        if (!response.ok) {
          throw new Error('Diacritization request failed'); 
        }

        const data = await response.json();
        setDiacritizedSentence(data.text);
      } catch (error) {
        console.error("Error adding diacritics:", error);
        // Handle the error in the UI (e.g., show an error message)
      }
    }
  };

  const handleEdit = (event) => {
    setSelectedSentence(event.target.value);
  };

  const saveEdit = () => {
    setIsEditing(false);
    if (selectedSentenceIndex !== null) {
      sentences[selectedSentenceIndex] = selectedSentence;
    }
  };

  useEffect(() => {
    if (inputText && !selectedSentence) {
      setSelectedSentence(sentences[0] || ''); 
    }
  }, [inputText, sentences, selectedSentence]);

  return (
    <div className="text-analysis">
      <textarea
        className="text-input"
        placeholder="Enter your Arabic text here"
        value={inputText}
        onChange={handleTextChange}
      />
      <div className="results-container">
        <div className="selected-sentence">
          {diacritizedSentence || selectedSentence} {/* Always show diacritized or original */}
        </div>
        <div className="sentences-list">
          {sentences.map((sentence, index) => (
            <div key={index} onClick={() => selectSentence(index)}>
              {index + 1}. {sentence}
            </div>
          ))}
        </div>
      </div>
      <div className="buttons-container">
        <button className="add-diacritics-button" onClick={addDiacritics}>
          Add Diacritics
        </button>
        <button className="edit-diacritics-button" onClick={() => setIsEditing(true)}>
          Edit Diacritics
        </button>
        <button className="save-text-button">Save Text</button>
      </div>
    </div>
  );
}

export default UploadText;
