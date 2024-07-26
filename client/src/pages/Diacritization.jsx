import React, { useState } from 'react';
import '../style/Diacritization.css';
import { diacritizeArabicText } from '../diaApi'; // Adjust the path as necessary

const Diacritization = () => {
  const arabicTextSentences = [
    "هذه الجملة الأولى",
    "وهذه الجملة الثانية",
    "ثم تأتي الجملة الثالثة",
  ];

  const [selectedSentenceIndex, setSelectedSentenceIndex] = useState(null);
  const [selectedSentence, setSelectedSentence] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const selectSentence = (index) => {
    setSelectedSentenceIndex(index);
    setSelectedSentence(arabicTextSentences[index]);
    setIsEditing(false); // Ensure editing mode is turned off when a sentence is selected
  };

  const addDiacritics = async () => {
    if (selectedSentenceIndex !== null) {
      try {
        setLoading(true); // Start loading
        const data = await diacritizeArabicText(arabicTextSentences[selectedSentenceIndex]);
        console.log('API Response Data:', data);
        setSelectedSentence(data.text);
      } catch (error) {
        console.error('Error adding diacritics', error);
      } finally {
        setLoading(false); // Stop loading
      }
    }
  };

  const handleEdit = (event) => {
    setSelectedSentence(event.target.value);
  };

  const saveEdit = () => {
    setIsEditing(false);
    if (selectedSentenceIndex !== null) {
      arabicTextSentences[selectedSentenceIndex] = selectedSentence;
    }
  };

  return (
    <div className="text-analysis">
      <div className="results-container">
        <div className="selected-sentence">
          {isEditing ? (
            <input
              type="text"
              value={selectedSentence}
              onChange={handleEdit}
              onBlur={saveEdit}
              autoFocus
              className="edit-input"
            />
          ) : (
            selectedSentence
          )}
        </div>
        <div className="sentences-list">
          {arabicTextSentences.map((sentence, index) => (
            <div key={index} onClick={() => selectSentence(index)}>
              {index + 1}. {sentence}
            </div>
          ))}
        </div>
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
