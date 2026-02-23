import { useState } from 'react';

const TransportFAQ = ({ faqData }) => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="space-y-4">
      {faqData.map((faq, index) => (
        <div 
          key={index}
          className={`bg-white rounded-xl border-2 overflow-hidden transition-all duration-300 ${
            openIndex === index 
              ? 'border-[#1ECAD3] shadow-lg' 
              : 'border-slate-200 hover:border-[#1ECAD3]/50'
          }`}
        >
          <button
            onClick={() => toggleFAQ(index)}
            className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 focus:outline-none focus:ring-2 focus:ring-[#1ECAD3] focus:ring-inset"
            aria-expanded={openIndex === index}
          >
            <span className={`font-semibold text-lg transition-colors ${
              openIndex === index ? 'text-[#0F4C5C]' : 'text-[#1E293B]'
            }`}>
              {faq.question}
            </span>
            <span className={`text-2xl transition-transform duration-300 ${
              openIndex === index 
                ? 'rotate-180 text-[#1ECAD3]' 
                : 'text-[#64748B]'
            }`}>
              ▼
            </span>
          </button>
          <div className={`overflow-hidden transition-all duration-300 ${
            openIndex === index ? 'max-h-96' : 'max-h-0'
          }`}>
            <div className="px-6 pb-5 text-[#64748B] leading-relaxed bg-gradient-to-r from-slate-50 to-white">
              {faq.answer}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TransportFAQ;
