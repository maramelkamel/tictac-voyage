import { useState, useCallback, useId } from 'react';

// Helper function to generate unique IDs
const generateMessageId = (prefix, index) => {
  return `${prefix}-${index}-${Math.random().toString(36).substring(2, 9)}`;
};

const Chatbot = () => {
  const baseId = useId();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messageCounter, setMessageCounter] = useState(1);
  const [messages, setMessages] = useState([
    {
      id: `${baseId}-initial-0`,
      type: 'bot',
      text: "Bonjour ! Je suis votre assistant voyage. Comment puis-je vous aider aujourd'hui ?",
    },
  ]);

  const addMessage = useCallback(
    (type, text) => {
      setMessageCounter((prev) => prev + 1);
      const newMessage = {
        id: generateMessageId(baseId, messageCounter),
        type,
        text,
      };
      setMessages((prev) => [...prev, newMessage]);
      return newMessage.id;
    },
    [baseId, messageCounter]
  );

  const handleSendMessage = useCallback(() => {
    if (!message.trim()) return;

    addMessage('user', message);
    setMessage('');

    // Simulate bot response
    setTimeout(() => {
      addMessage('bot', 'Merci pour votre message ! Un de nos agents vous répondra dans les plus brefs délais.');
    }, 1000);
  }, [message, addMessage]);

  const handleQuickReply = useCallback(
    (reply) => {
      addMessage('user', reply);

      // Simulate bot response based on quick reply
      setTimeout(() => {
        let response = '';
        switch (reply) {
          case 'Réserver un hôtel':
            response = 'Je peux vous aider à réserver un hôtel. Quelle destination vous intéresse ?';
            break;
          case 'Voir les offres':
            response = 'Nous avons actuellement des offres spéciales sur Hammamet et Djerba. Voulez-vous en savoir plus ?';
            break;
          case 'Contacter un agent':
            response = 'Je vous mets en relation avec un de nos agents. Veuillez patienter quelques instants.';
            break;
          default:
            response = 'Merci pour votre message !';
        }
        addMessage('bot', response);
      }, 1000);
    },
    [addMessage]
  );

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    },
    [handleSendMessage]
  );

  const quickReplies = ['Réserver un hôtel', 'Voir les offres', 'Contacter un agent'];

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '25px',
        right: '25px',
        zIndex: 1000,
      }}
    >
      {/* Chat Window */}
      {isOpen && (
        <div
          role="dialog"
          aria-labelledby="chat-title"
          aria-modal="true"
          style={{
            width: '380px',
            height: '500px',
            background: 'var(--white)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-xl)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            marginBottom: '15px',
          }}
        >
          {/* Header */}
          <div
            style={{
              background: 'var(--primary)',
              color: 'var(--white)',
              padding: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '45px',
                  height: '45px',
                  background: 'rgba(255,255,255,0.15)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                }}
                aria-hidden="true"
              >
                <i className="fas fa-robot" />
              </div>
              <div>
                <h4 id="chat-title" style={{ fontSize: '16px', fontWeight: 700, marginBottom: '2px' }}>
                  Assistant TICTAC
                </h4>
                <small style={{ fontSize: '12px', opacity: 0.8, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span
                    style={{
                      width: '8px',
                      height: '8px',
                      background: '#4ade80',
                      borderRadius: '50%',
                    }}
                    aria-hidden="true"
                  />
                  En ligne
                </small>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              style={{
                color: 'rgba(255,255,255,0.7)',
                fontSize: '20px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '8px',
              }}
              aria-label="Fermer le chat"
            >
              <i className="fas fa-times" />
            </button>
          </div>

          {/* Messages */}
          <div
            role="log"
            aria-live="polite"
            aria-label="Messages du chat"
            style={{
              flex: 1,
              padding: '20px',
              background: 'var(--gray-50)',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  justifyContent: msg.type === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                <div
                  style={{
                    maxWidth: '80%',
                    padding: '14px 18px',
                    borderRadius: 'var(--radius-md)',
                    borderTopLeftRadius: msg.type === 'bot' ? '4px' : 'var(--radius-md)',
                    borderTopRightRadius: msg.type === 'user' ? '4px' : 'var(--radius-md)',
                    background: msg.type === 'user' ? 'var(--primary)' : 'var(--white)',
                    color: msg.type === 'user' ? 'var(--white)' : 'var(--gray-700)',
                    fontSize: '14px',
                    lineHeight: 1.5,
                    boxShadow: 'var(--shadow-sm)',
                  }}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* Quick Replies */}
          <div
            role="group"
            aria-label="Réponses rapides"
            style={{
              padding: '12px 20px',
              background: 'var(--white)',
              borderTop: '1px solid var(--gray-100)',
              display: 'flex',
              gap: '8px',
              flexWrap: 'wrap',
            }}
          >
            {quickReplies.map((reply) => (
              <button
                key={reply}
                type="button"
                onClick={() => handleQuickReply(reply)}
                style={{
                  padding: '8px 14px',
                  background: 'var(--gray-50)',
                  border: '1px solid var(--gray-200)',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '12px',
                  fontWeight: 500,
                  color: 'var(--gray-600)',
                  cursor: 'pointer',
                  transition: 'all var(--duration) var(--ease)',
                }}
              >
                {reply}
              </button>
            ))}
          </div>

          {/* Input */}
          <div
            style={{
              padding: '16px 20px',
              background: 'var(--white)',
              borderTop: '1px solid var(--gray-100)',
              display: 'flex',
              gap: '12px',
            }}
          >
            <label htmlFor="chat-input" className="sr-only" style={{ position: 'absolute', left: '-9999px' }}>
              Votre message
            </label>
            <input
              id="chat-input"
              type="text"
              placeholder="Écrivez votre message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              style={{
                flex: 1,
                padding: '14px 18px',
                background: 'var(--gray-50)',
                borderRadius: 'var(--radius-full)',
                fontSize: '14px',
                border: 'none',
                outline: 'none',
              }}
            />
            <button
              type="button"
              onClick={handleSendMessage}
              disabled={!message.trim()}
              style={{
                width: '48px',
                height: '48px',
                background: message.trim() ? 'var(--accent)' : 'var(--gray-300)',
                borderRadius: '50%',
                color: 'var(--white)',
                fontSize: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: 'none',
                cursor: message.trim() ? 'pointer' : 'not-allowed',
                transition: 'all var(--duration) var(--ease)',
              }}
              aria-label="Envoyer le message"
            >
              <i className="fas fa-paper-plane" />
            </button>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          style={{
            width: '65px',
            height: '65px',
            background: 'var(--accent)',
            borderRadius: '50%',
            color: 'var(--white)',
            fontSize: '26px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 8px 25px rgba(233, 47, 100, 0.4)',
            transition: 'all var(--duration) var(--ease)',
            animation: 'pulse-glow 2s ease-in-out infinite',
          }}
          aria-label="Ouvrir le chat"
        >
          <i className="fas fa-comments" />
        </button>
      )}
    </div>
  );
};

export default Chatbot;
