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
        setResultSentence(data.text);
      } catch (error) {
        console.error('Error adding diacritics', error);
      } finally {
        setLoading(false); // Stop loading
      }
    }
  };

  const handleTextChange = (event) => {
    setInputText(event.target.value);
  };

  const handleEdit = (event) => {
    setResultSentence(event.target.value);
  };

  const saveEdit = () => {
    setIsEditing(false);
    if (ResultSentence !== null) {
      setResultSentence(ResultSentence);
    }
  };

  return (
    <div className="diacritization-container">
            {/* Result and Edit Area */}
            <div className="result-box">
        {isEditing ? (
          <textarea
            type="text"
            value={ResultSentence}
            onChange={handleEdit}
            onBlur={saveEdit}
            autoFocus
            className="edit-input"
          />
        ) : (
          <div className="result-sentence">{ResultSentence}</div>
        )}
        <button
          onClick={() => setIsEditing(true)}
          className="start-button edit-diacritics-button"
        >
          Edit Diacritics
        </button>
      </div>
      {/* Input Area */}
      <div className="input-box">
        <textarea
          value={inputText}
          onChange={handleTextChange}
          placeholder="Enter Arabic text here..."
          className="input"
        />
        <button
          onClick={addDiacritics}
          className="start-button add-diacritics-button"
          disabled={loading}
        >
          {loading ? 'Adding Diacritics...' : 'Add Diacritics'}
        </button>
      </div>
    </div>
  );
};

export default Diacritization;
