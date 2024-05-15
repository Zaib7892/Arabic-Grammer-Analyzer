import React from 'react'

const Test = () => {
    const tests = [
        "استراتيجيات تحسين الأداء",
        "تطوير البنية التحتية",
        "تعزيز التعاون الفريقي",
        "دمج التقنيات الجديدة",
        "تحليل البيانات المتقدم",
        "ابتكار في الإدارة"
    ];
    const buttonStyles = {
        color: '#aaa', // Muted text color
        backgroundColor: '#f5f5f5', // Muted background color
        border: 'none', // Remove button border
        padding: '10px 20px', // Add padding to button
        borderRadius: '5px', // Add border radius to button
        cursor: 'not-allowed' // Change cursor to not-allowed when button is disabled
      };

    return (
        <div className="sentences">
            {tests.map((solution, index) => (
                <div key={index} className="solution">
                    <span>{solution}</span>
                    <button disabled style={buttonStyles}>Take Test</button>
                </div>
            ))}
        </div>
    );
}

export default Test