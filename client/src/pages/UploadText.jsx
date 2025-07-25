import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from './Contexts/UploadContext';
import '../style/UploadText.css'; // Import your CSS file

function UploadText() {
  const { sessionData, setSessionData } = useSession();
  const navigate = useNavigate();

  // Restore state when component mounts
  useEffect(() => {
    setInputText(sessionData.inputText);
    setSentences(sessionData.sentences);
    setSelectedSentence(sessionData.selectedSentence);
    setTranslatedText(sessionData.translatedText);
    setWordCount(sessionData.wordCount);
    setLanguage(sessionData.language);
    setShowFields(sessionData.showFields);
  }, []);

  const [inputText, setInputText] = useState(sessionData.inputText);
  const [sentences, setSentences] = useState(sessionData.sentences);
  const [selectedSentence, setSelectedSentence] = useState(sessionData.selectedSentence);
  const [translatedText, setTranslatedText] = useState(sessionData.translatedText);
  const [wordCount, setWordCount] = useState(sessionData.wordCount);
  const [language, setLanguage] = useState(sessionData.language);
  const [showFields, setShowFields] = useState(sessionData.showFields);
  const [errorMessage, setErrorMessage] = useState(''); // For displaying errors

  // Function to separate sentences using regular expressions
  function segmentSentences(text) {
    const regex = /[\.\?\!](?:\s+|$)/; // Regex for sentence boundaries
    return text.split(regex).filter(sentence => sentence.trim() !== '');
  }

  const handleTextChange = (event) => {
    const text = event.target.value;
    setInputText(text);

    // Arabic text validation using a regular expression
    const arabicRegex = /^[\u0600-\u06FF\u200C\u200B\u060C\u061B\u064B-\u065F\s\.,?!؛؟]+$/;
    if (!arabicRegex.test(text)) {
      setErrorMessage('Please enter text in Arabic.');
      setShowFields(false); // Hide further processing options
      return; // Do not proceed further
    } else {
      setErrorMessage(''); // Clear error message if text is Arabic
    }

    const segmentedSentences = segmentSentences(text);
    setSentences(segmentedSentences);
    setWordCount(text.split(/\s+/).filter(word => word.trim() !== '').length);
    detectLanguage(text);

    // Update session data
    setSessionData(prev => ({
      ...prev,
      inputText: text,
      sentences: segmentedSentences,
      wordCount: text.split(/\s+/).filter(word => word.trim() !== '').length,
    }));
  };

  const selectSentence = (index) => {
    setSelectedSentence(sentences[index]);

    // Update session data
    setSessionData(prev => ({
      ...prev,
      selectedSentence: sentences[index],
    }));
  };

  const handleTranslate = async () => {
    try {
      const response = await fetch('http://localhost:8000/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText, to: 'en' }),
      });

      if (response.ok) {
        const data = await response.json();
        setTranslatedText(data.translatedText);

        // Update session data
        setSessionData(prev => ({
          ...prev,
          translatedText: data.translatedText,
        }));
      } else {
        setTranslatedText('Error translating text');
      }
    } catch (error) {
      setTranslatedText('Error communicating with API');
    }
  };

  const detectLanguage = async (text) => {
    try {
      const response = await fetch('http://localhost:8000/detectLanguage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text }),
      });

      if (response.ok) {
        const data = await response.json();
        setLanguage(data.language);

        // Update session data
        setSessionData(prev => ({
          ...prev,
          language: data.language,
        }));
      } else {
        setLanguage('Unknown');
      }
    } catch (error) {
      setLanguage('Error detecting language');
    }
  };

  const handleProceed = () => {
    setShowFields(true); // Show additional fields when "Proceed" is clicked

    // Update session data
    setSessionData(prev => ({
      ...prev,
      showFields: true,
    }));
  };

  const handleAnalyze = () => {
    navigate('/syntacticanalysis', { state: { selectedSentence } });
  };

  return (
    <div className="text-analysis">
      <textarea
        className="text-input"
        placeholder="اپنا متن یہاں لکھیں...."
        value={inputText}
        onChange={handleTextChange}
      />
      {errorMessage && <div className="error-message">{errorMessage}</div>}
      {!showFields && inputText && !errorMessage && (
        <button className="start-button proceed-text-button" onClick={handleProceed}>Proceed</button>
      )}
      {showFields && (
        <>
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
          <div className="analyze-text-button-wrapper">
            <button
              className="start-button analyze-text-button"
              onClick={handleAnalyze}
              disabled={!selectedSentence}
            >
              Analyze Text
            </button>
          </div>

          <div className="translation-section">
            <div className="translation-text">{translatedText}</div>
          </div>

          <button className="start-button translate-button-uploadtext" onClick={handleTranslate}>
            Translate All
          </button>
        </>
      )}
    </div>
  );
}

export default UploadText;
