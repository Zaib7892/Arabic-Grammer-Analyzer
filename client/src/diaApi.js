import axios from 'axios';

const apiKey = 'rXSJKZDUvgsloKbRQL'; // Replace with your actual API key
const url = 'https://farasa.qcri.org/webapi/diacritize/';

export const diacritizeArabicText = async (text) => {
  try {
    const response = await axios.post(url, {
      text: text,
      api_key: apiKey
    }
  
  );
    return response.data;
  } catch (error) {
    console.error('Error making API request', error);
    throw error;
  }
};
