import React, { useState } from 'react';
import '../style/Diacritization.css';

const Diacritization = () => {
  const arabicTextSentences = [
    "هذه الجملة الأولى",
    "وهذه الجملة الثانية",
    "ثم تأتي الجملة الثالثة",
  ];

  // Hardcoded sentences with diacritics added
  const arabicTextSentencesWithDiacritics = [
    "هَذِهُ الْجُمْلَةُ الْأُولَى",
    "وَهَذِهِ الْجُمْلَةُ الثَّانِيَة",
    "ثُمَّ تَأْتِي الْجُملَةُ الثَّالِثَةُ",
  ];

  const [selectedSentenceIndex, setSelectedSentenceIndex] = useState(null);
  const [selectedSentence, setSelectedSentence] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const selectSentence = (index) => {
    setSelectedSentenceIndex(index);
    setSelectedSentence(arabicTextSentences[index]);
    setIsEditing(false); // Ensure editing mode is turned off when a sentence is selected
  };

  const addDiacritics = () => {
    if (selectedSentenceIndex !== null) {
      // Set the selected sentence with diacritics
      setSelectedSentence(arabicTextSentencesWithDiacritics[selectedSentenceIndex]);
    }
  };

  const handleEdit = (event) => {
    setSelectedSentence(event.target.value);
  };

  const saveEdit = () => {
    setIsEditing(false);
    if (selectedSentenceIndex !== null) {
      arabicTextSentencesWithDiacritics[selectedSentenceIndex] = selectedSentence;
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
        <button className="add-diacritics-button" onClick={addDiacritics}>
          Add Diacritics
        </button>
        <button className="edit-diacritics-button" onClick={() => setIsEditing(true)}>
          Edit Diacritics
        </button>
      </div>
    </div>
  );
}

export default Diacritization;
