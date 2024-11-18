import React, { useState } from 'react';
import '../style/Diacritization.css';
import { diacritizeArabicText } from '../diaApi'; // Adjust the path as necessary
import { useSession } from './Contexts/UploadContext'; // Adjust the path to your context provider
import { FaCopy } from 'react-icons/fa'; // Import the copy icon from react-icons

const Diacritization = () => {
  const { sessionData, setSessionData } = useSession();
  const { input_Text, ResultSentence, isEditing, loading } = sessionData;
  const [buttonText, setButtonText] = useState('Edit Diacritics');
  const [errorMessage, setErrorMessage] = useState(''); // State for error messages

  // Function to validate Arabic text (with or without diacritics)
  const validateArabicText = (text) => {
    const arabicRegex = /^[\u0600-\u06FF\s\u0610-\u061A\u064B-\u065F.!؟]*$/;
    return arabicRegex.test(text);
  };

  const handleTextChange = (event) => {
    const text = event.target.value;

    // Validate the text to check if it's Arabic
    if (!validateArabicText(text)) {
      setErrorMessage('The data is not correct. Please enter valid Arabic text.');
      setSessionData({ ...sessionData, input_Text: text, isArabic: false });
    } else {
      setErrorMessage(''); // Clear the error message if text is valid
      setSessionData({ ...sessionData, input_Text: text, isArabic: true });
    }
  };

  const addDiacritics = async () => {
    if (input_Text !== null && sessionData.isArabic) {
      try {
        setSessionData({ ...sessionData, loading: true }); // Start loading
        const data = await diacritizeArabicText(input_Text);
        setSessionData({ ...sessionData, ResultSentence: data.text, loading: false });
      } catch (error) {
        console.error('Error adding diacritics', error);
        setSessionData({ ...sessionData, loading: false });
      }
    } else {
      setErrorMessage('Please enter valid Arabic text before proceeding.');
    }
  };

  const handleEdit = (event) => {
    setSessionData({ ...sessionData, ResultSentence: event.target.value });
  };

  const toggleEdit = () => {
    if (isEditing) {
      setSessionData({ ...sessionData, isEditing: false });
      setButtonText('Edit Diacritics');
    } else {
      setSessionData({ ...sessionData, isEditing: true });
      setButtonText('Done');
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(ResultSentence).then(() => {
      alert('Text copied to clipboard!');
    }).catch((error) => {
      console.error('Failed to copy text', error);
    });
  };

  return (
    <div className="diacritization-container">
      {/* Result and Edit Area */}
      <div className="result-box">
        <div className="edit-container">
          {isEditing ? (
            <textarea
              value={ResultSentence}
              onChange={handleEdit}
              autoFocus
              className="edit-input"
            />
          ) : (
            <div className="result-sentence">{ResultSentence}</div>
          )}
          <FaCopy className="copy-icon" onClick={copyToClipboard} />
        </div>
        <button
          onClick={toggleEdit}
          className="start-button edit-diacritics-button"
        >
          {buttonText}
        </button>
      </div>
      {/* Input Area */}
      <div className="input-box">
        <textarea
          value={input_Text}
          onChange={handleTextChange}
          placeholder="اپنا متن یہاں لکھیں...."
          className="input"
        />
        {errorMessage && <div className="error-message">{errorMessage}</div>}
        <button
          onClick={addDiacritics}
          className="start-button add-diacritics-button"
          disabled={loading || !sessionData.isArabic}
        >
          {loading ? 'Loading...' : 'Add Diacritics'}
        </button>
      </div>
    </div>
  );
};

export default Diacritization;
