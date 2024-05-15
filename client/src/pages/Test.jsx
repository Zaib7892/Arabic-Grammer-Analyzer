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

    return (
        <div className="sentences">
            {tests.map((solution, index) => (
                <div key={index} className="solution">
                    <span>{solution}</span>
                    <button>Take Test</button> 
                </div>
            ))}
        </div>
    );
}

export default Test