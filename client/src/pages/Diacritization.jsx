import React, { useState,useEffect } from 'react';
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
  const [uploadedText, setUploadedText] = useState('');


//-------------Farasa APi Call with Proxy-----------------
const sendRequestToFarasa = () => {
  var api_key = "WltNKBUvNMAeBFxAWO";
  var dialect = "mor";
  var text = uploadedText; // Assuming uploadedText contains the text to be diacritized

  fetch("https://farasa.qcri.org/webapi/seq2seq_diacritize/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "cache-control": "no-cache"
    },
    body: JSON.stringify({
      text: text,
      api_key: api_key,
      dialect: dialect
    })
  })
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.error(error));
};


//--------------------------------------------------------



  useEffect(() => {
    // Retrieve uploaded text from local storage
    const storedText = localStorage.getItem('uploadedText');
    if (storedText) {
      setUploadedText(storedText);
    }
  }, []);

  // const selectSentence = (index) => {
  //   setSelectedSentenceIndex(index);
  //   setSelectedSentence(arabicTextSentences[index]);
  //   setIsEditing(false); // Ensure editing mode is turned off when a sentence is selected
  // };

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
          {uploadedText}
        </div>
      </div>

      <button className="add-diacritics-button" onClick={sendRequestToFarasa}>
        Add Diacritics
      </button>
      <button className="edit-diacritics-button" onClick={() => setIsEditing(true)}>
        Edit Diacritics
      </button>
      {/* <button className="save-text-button">
          Save Text
        </button> */}
    </div>
  );
}

export default Diacritization;
