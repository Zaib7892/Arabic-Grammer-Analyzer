import React, { useState } from 'react';
import '../style/Diacritization.css';
import { diacritizeArabicText } from '../diaApi'; // Adjust the path as necessary

const Diacritization = () => {
  const [inputText, setInputText] = useState('');
  const [ResultSentence, setResultSentence] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  

  const addDiacritics = async () => {
    if (inputText !== null) {
      try {
        setLoading(true); // Start loading
        const data = await diacritizeArabicText(inputText);
        console.log('API Response Data:', data);
        setResultSentence(data.text);
      } catch (error) {
        console.error('Error adding diacritics', error);
      } finally {
        setLoading(false); // Stop loading
      }
    }
  };

  const handleTextChange = (event) => {
    const text = event.target.value;

    setInputText(text);
  }
  const handleEdit = (event) => {
    setResultSentence(event.target.value);
  };

  const saveEdit = () => {
    setIsEditing(false);
    if (ResultSentence !== null) {
      setInputText(ResultSentence);
    }
  };

  return (
    <div className="text-analysis">
      <div className="results-container">
        <div className="selected-sentence">
          {isEditing ? (
            <input
              type="text"
              value={ResultSentence}
              onChange={handleEdit}
              onBlur={saveEdit}
              autoFocus
              className="edit-input"
            />
          ) : (
            ResultSentence
          )}
        </div>
        <textarea
        className="text-input"
        placeholder="Enter your text here"
        value={inputText}
        onChange={handleTextChange}
      />
      </div>
      <div className="buttons-container">
        <button className="add-diacritics-button" onClick={addDiacritics} disabled={loading}>
          {loading ? 'Adding Diacritics...' : 'Add Diacritics'}
        </button>
        <button className="edit-diacritics-button" onClick={() => setIsEditing(true)}>
          Edit Diacritics
        </button>
      </div>
    </div>
  );
}

export default Diacritization;
