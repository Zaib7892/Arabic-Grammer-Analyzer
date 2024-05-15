import React from 'react';
import '../style/ViewFeedback.css'
const ViewFeedback = () => {
  // Sample feedback data
  const feedbackData = [
    { id: 3, feedback: 'The word order in this sentence could be improved for clarity.', sentence: 'استراتيجيات تحسين الأداء' },
    { id: 4, feedback: 'The translation accurately conveys the meaning of the sentence.', sentence: 'تطوير البنية التحتية' },
    { id: 5, feedback: 'The sentence could be clearer by rephrasing or adding context.', sentence: 'تعزيز التعاون الفريقي' },
    { id: 6, feedback: 'The translation is well-done and captures the essence of the original sentence.', sentence: 'دمج التقنيات الجديدة' },
    { id: 7, feedback: 'The sentence structure may need revision for better flow.', sentence: 'تحليل البيانات المتقدم' },
    { id: 8, feedback: 'Good translation, but consider using more idiomatic language for better fluency.', sentence: 'ابتكار في الإدارة' },
    // Add more feedback data as needed
  ];

  return (
    <div className="feedback-container">
      <h2 className="feedback-header">Feedbacks on Grammatical Analysis</h2>
      {/* Mapping over feedback data and rendering each feedback item */}
      {feedbackData.map((feedback) => (
        <div key={feedback.id} className="feedback-item">
          <p className="sentence"><strong>Sentence:</strong> {feedback.sentence}</p>
          <p className="feedback"><strong>Feedback:</strong> {feedback.feedback}</p>
        </div>
      ))}
    </div>
  );
}

export default ViewFeedback;
