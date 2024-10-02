import React, { useState } from 'react';
import '../style/Diacritization.css';
import { diacritizeArabicText } from '../diaApi'; // Adjust the path as necessary
import { useSession } from './Contexts/UploadContext'; // Adjust the path to your context provider

const Diacritization = () => {
  const { sessionData, setSessionData } = useSession();
  const { input_Text: input_Text, ResultSentence, isEditing, loading } = sessionData;

  const addDiacritics = async () => {
    if (input_Text !== null) {
      try {
        setSessionData({ ...sessionData, loading: true }); // Start loading
        const data = await diacritizeArabicText(input_Text);
        setSessionData({ ...sessionData, ResultSentence: data.text, loading: false });
      } catch (error) {
        console.error('Error adding diacritics', error);
        setSessionData({ ...sessionData, loading: false });
      }
    }
  };

  const handleTextChange = (event) => {
    setSessionData({ ...sessionData, input_Text: event.target.value });
  };

  const handleEdit = (event) => {
    setSessionData({ ...sessionData, ResultSentence: event.target.value });
  };

  const saveEdit = () => {
    setSessionData({ ...sessionData, isEditing: false });
  };

  return (
    <div className="diacritization-container">
      {/* Result and Edit Area */}
      <div className="result-box">
        {isEditing ? (
          <textarea
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
          onClick={() => setSessionData({ ...sessionData, isEditing: true })}
          className="start-button edit-diacritics-button"
        >
          Edit Diacritics
        </button>
      </div>
      {/* Input Area */}
      <div className="input-box">
        <textarea
          value={input_Text}
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
