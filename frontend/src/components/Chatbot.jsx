// src/components/Chatbot.jsx
import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

/* ── Icônes SVG inline ─────────────────────────────────────────── */
const IconSend    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" width="18" height="18"><path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z"/></svg>;
const IconClose   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" width="18" height="18"><path d="M18 6L6 18M6 6l12 12"/></svg>;
const IconBot     = () => <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h3a3 3 0 0 1 3 3v1h.5a1.5 1.5 0 0 1 0 3H19v1a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3v-1h-.5a1.5 1.5 0 0 1 0-3H5v-1a3 3 0 0 1 3-3h3V5.73A2 2 0 0 1 10 4a2 2 0 0 1 2-2zm-2 9a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm4 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z"/></svg>;
const IconMinimize= () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16"><path d="M5 12h14"/></svg>;
const IconRefresh = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>;

/* ── Message initial ─────────────────────────────────────────────── */
const INITIAL_MESSAGE = {
  role: 'assistant',
  content: `Bonjour ! Je suis **Tika** 👋, votre conseillère voyage Tic-Tac Voyages.\n\nJe peux vous aider à :\n• 🌍 Trouver le voyage idéal selon votre budget\n• 🗺️ Découvrir nos circuits en Tunisie\n• ✈️ Planifier un voyage sur mesure à l'étranger\n• 🚗 Réserver un transport\n• 🕌 Organiser votre Omra\n\nPar quoi on commence ?`,
  id: 'init',
};

/* ── Suggestions initiales ─────────────────────────────────────── */
const DEFAULT_SUGGESTIONS = [
  "Je veux voyager, aidez-moi 🌍",
  "Circuits Tunisie disponibles ?",
  "Mon budget est de 500 DT",
  "Tarifs transport ?",
  "Voyage à l'étranger sur mesure",
  "Infos sur l'Omra",
];

/* ── Formater le texte markdown simple ─────────────────────────── */
const formatMessage = (text) => {
  if (!text) return '';
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br/>')
    .replace(/•/g, '&bull;');
};

/* ════════════════════════════════════════════════════════════════
   COMPOSANT PRINCIPAL
   ════════════════════════════════════════════════════════════════ */
const Chatbot = () => {
  const navigate = useNavigate();

  const [isOpen,      setIsOpen]      = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages,    setMessages]    = useState([INITIAL_MESSAGE]);
  const [input,       setInput]       = useState('');
  const [isLoading,   setIsLoading]   = useState(false);
  const [showBadge,   setShowBadge]   = useState(true);
  const [suggestions, setSuggestions] = useState(DEFAULT_SUGGESTIONS);
  const [showSugg,    setShowSugg]    = useState(true);

  const endRef      = useRef(null);
  const inputRef    = useRef(null);
  const messagesRef = useRef(null);

  /* Auto-scroll */
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  /* Focus input à l'ouverture */
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isOpen, isMinimized]);

  /* Badge d'attention après 3s */
  useEffect(() => {
    const t = setTimeout(() => setShowBadge(true), 3000);
    return () => clearTimeout(t);
  }, []);

  /* ── Envoyer un message ─────────────────────────────────────── */
  const sendMessage = useCallback(async (text) => {
    const content = (text || input).trim();
    if (!content || isLoading) return;

    setInput('');
    setShowSugg(false);
    setShowBadge(false);

    // Ajouter le message utilisateur
    const userMsg    = { role: 'user', content, id: Date.now() };
    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setIsLoading(true);

    try {
      // Envoyer uniquement role+content à l'API (sans les ids internes)
      const apiMessages = newHistory.map(({ role, content }) => ({ role, content }));

      const res  = await fetch('http://localhost:5000/api/chat', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ messages: apiMessages }),
      });

      const data = await res.json();

      setMessages(prev => [...prev, {
        role:         'assistant',
        content:      data.reply || 'Désolée, je n\'ai pas pu traiter votre demande.',
        quickActions: data.quickActions || [],
        intent:       data.intent,
        id:           Date.now() + 1,
      }]);

    } catch {
      setMessages(prev => [...prev, {
        role:    'assistant',
        content: '😔 Je rencontre une difficulté technique.\n\nContactez-nous directement :\n📞 **+216 36 149 885**',
        quickActions: [{ label: '📞 Nous appeler', href: '/Contact' }],
        id:      Date.now() + 1,
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [input, messages, isLoading]);

  /* ── Réinitialiser la conversation ─────────────────────────── */
  const resetChat = () => {
    setMessages([INITIAL_MESSAGE]);
    setInput('');
    setShowSugg(true);
    setIsLoading(false);
  };

  /* ── Ouvrir/fermer ─────────────────────────────────────────── */
  const toggleOpen = () => {
    setIsOpen(prev => !prev);
    setIsMinimized(false);
    setShowBadge(false);
  };

  /* ── Keyboard submit ──────────────────────────────────────── */
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  /* ── Naviguer vers un lien ─────────────────────────────────── */
  const handleAction = (href) => {
    setIsOpen(false);
    navigate(href);
  };

  /* ════════════════════════════════════════════════════════════
     RENDU
     ════════════════════════════════════════════════════════════ */
  return (
    <>
      {/* ── Fenêtre chat ── */}
      <div style={{
        position:   'fixed',
        bottom:     '90px',
        right:      '24px',
        width:      '380px',
        maxWidth:   'calc(100vw - 32px)',
        height:     isMinimized ? '64px' : '580px',
        maxHeight:  'calc(100vh - 120px)',
        background: '#fff',
        borderRadius: '20px',
        boxShadow:  '0 24px 64px rgba(15,76,92,.22), 0 4px 16px rgba(0,0,0,.08)',
        display:    'flex',
        flexDirection: 'column',
        overflow:   'hidden',
        zIndex:     9998,
        opacity:    isOpen ? 1 : 0,
        transform:  isOpen ? 'scale(1) translateY(0)' : 'scale(.92) translateY(20px)',
        pointerEvents: isOpen ? 'all' : 'none',
        transition: 'opacity .3s cubic-bezier(.4,0,.2,1), transform .3s cubic-bezier(.4,0,.2,1), height .3s cubic-bezier(.4,0,.2,1)',
      }}>

        {/* ── Header ── */}
        <div style={{
          background:    'linear-gradient(135deg, #0F4C5C 0%, #1a6b80 100%)',
          padding:       '14px 18px',
          display:       'flex',
          alignItems:    'center',
          gap:           '12px',
          flexShrink:    0,
          borderRadius:  isMinimized ? '20px' : '20px 20px 0 0',
          cursor:        isMinimized ? 'pointer' : 'default',
        }} onClick={isMinimized ? () => setIsMinimized(false) : undefined}>

          {/* Avatar Tika */}
          <div style={{
            width: '40px', height: '40px',
            background:   'linear-gradient(135deg, #1ECAD3, #0F4C5C)',
            borderRadius: '50%',
            display:      'flex', alignItems: 'center', justifyContent: 'center',
            color:        '#fff', flexShrink: 0,
            border:       '2px solid rgba(255,255,255,.3)',
            position:     'relative',
          }}>
            <IconBot />
            {/* Point vert online */}
            <span style={{
              position:   'absolute', bottom: 1, right: 1,
              width:      '10px', height: '10px',
              background: '#22c55e',
              borderRadius: '50%',
              border:     '2px solid #0F4C5C',
            }}/>
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: '14px', lineHeight: 1.2 }}>Tika</div>
            <div style={{ color: 'rgba(255,255,255,.75)', fontSize: '11px' }}>
              Conseillère Tic-Tac Voyages · En ligne
            </div>
          </div>

          {/* Actions header */}
          <div style={{ display: 'flex', gap: '6px' }}>
            <button onClick={resetChat} title="Nouvelle conversation"
              style={{ background: 'rgba(255,255,255,.15)', border: 'none', borderRadius: '8px', width: '30px', height: '30px', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <IconRefresh />
            </button>
            <button onClick={() => setIsMinimized(p => !p)} title="Réduire"
              style={{ background: 'rgba(255,255,255,.15)', border: 'none', borderRadius: '8px', width: '30px', height: '30px', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <IconMinimize />
            </button>
            <button onClick={() => setIsOpen(false)} title="Fermer"
              style={{ background: 'rgba(255,255,255,.15)', border: 'none', borderRadius: '8px', width: '30px', height: '30px', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <IconClose />
            </button>
          </div>
        </div>

        {!isMinimized && (<>

          {/* ── Messages ── */}
          <div ref={messagesRef} style={{
            flex:       1,
            overflowY:  'auto',
            padding:    '16px',
            display:    'flex',
            flexDirection: 'column',
            gap:        '12px',
            background: '#f8fafb',
          }}>

            {messages.map((msg) => (
              <div key={msg.id || Math.random()} style={{
                display:       'flex',
                flexDirection: 'column',
                alignItems:    msg.role === 'user' ? 'flex-end' : 'flex-start',
                gap:           '6px',
                animation:     'msgIn .3s cubic-bezier(.4,0,.2,1)',
              }}>
                {/* Bulle message */}
                <div style={{
                  maxWidth:     '85%',
                  padding:      '10px 14px',
                  borderRadius: msg.role === 'user'
                    ? '16px 16px 4px 16px'
                    : '4px 16px 16px 16px',
                  background:   msg.role === 'user'
                    ? 'linear-gradient(135deg, #0F4C5C, #1a6b80)'
                    : '#fff',
                  color:        msg.role === 'user' ? '#fff' : '#1e293b',
                  fontSize:     '13.5px',
                  lineHeight:   1.65,
                  boxShadow:    msg.role === 'user'
                    ? '0 2px 8px rgba(15,76,92,.25)'
                    : '0 2px 8px rgba(0,0,0,.06)',
                  border:       msg.role === 'bot' ? '1px solid #e2e8f0' : 'none',
                }}
                  dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }}
                />

                {/* Quick Actions */}
                {msg.quickActions?.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', maxWidth: '85%' }}>
                    {msg.quickActions.map((action, i) => (
                      <button key={i} onClick={() => handleAction(action.href)}
                        style={{
                          padding:      '6px 12px',
                          background:   '#fff',
                          border:       '1.5px solid #1ECAD3',
                          borderRadius: '20px',
                          color:        '#0F4C5C',
                          fontSize:     '12px',
                          fontWeight:   600,
                          cursor:       'pointer',
                          transition:   'all .2s',
                          fontFamily:   'inherit',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#0F4C5C'; e.currentTarget.style.color = '#fff'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = '#fff';    e.currentTarget.style.color = '#0F4C5C'; }}
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Indicateur de frappe */}
            {isLoading && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', animation: 'msgIn .3s ease' }}>
                <div style={{
                  padding: '12px 16px', background: '#fff',
                  borderRadius: '4px 16px 16px 16px',
                  boxShadow: '0 2px 8px rgba(0,0,0,.06)',
                  border: '1px solid #e2e8f0',
                  display: 'flex', gap: '5px', alignItems: 'center',
                }}>
                  {[0, 1, 2].map(i => (
                    <span key={i} style={{
                      width: '7px', height: '7px', borderRadius: '50%',
                      background: '#1ECAD3',
                      animation: `typingDot 1.4s infinite`,
                      animationDelay: `${i * 0.2}s`,
                    }}/>
                  ))}
                </div>
              </div>
            )}

            <div ref={endRef} />
          </div>

          {/* ── Suggestions rapides ── */}
          {showSugg && messages.length <= 1 && (
            <div style={{
              padding:    '0 16px 10px',
              background: '#f8fafb',
              display:    'flex',
              flexWrap:   'wrap',
              gap:        '6px',
            }}>
              {DEFAULT_SUGGESTIONS.map((s, i) => (
                <button key={i} onClick={() => sendMessage(s)}
                  style={{
                    padding:      '6px 12px',
                    background:   '#fff',
                    border:       '1.5px solid #e2e8f0',
                    borderRadius: '20px',
                    color:        '#475569',
                    fontSize:     '12px',
                    cursor:       'pointer',
                    transition:   'all .2s',
                    fontFamily:   'inherit',
                    fontWeight:   500,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#1ECAD3'; e.currentTarget.style.color = '#0F4C5C'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#475569'; }}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* ── Zone de saisie ── */}
          <div style={{
            padding:       '12px 14px',
            borderTop:     '1px solid #e2e8f0',
            display:       'flex',
            gap:           '10px',
            alignItems:    'flex-end',
            background:    '#fff',
            flexShrink:    0,
            borderRadius:  '0 0 20px 20px',
          }}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Écrivez votre message..."
              rows={1}
              style={{
                flex:        1,
                padding:     '10px 14px',
                background:  '#f8fafb',
                border:      '1.5px solid #e2e8f0',
                borderRadius: '12px',
                fontSize:    '13.5px',
                color:       '#1e293b',
                resize:      'none',
                outline:     'none',
                fontFamily:  'inherit',
                lineHeight:  1.5,
                maxHeight:   '100px',
                overflowY:   'auto',
                transition:  'border-color .2s',
              }}
              onFocus={e => e.target.style.borderColor = '#1ECAD3'}
              onBlur={e  => e.target.style.borderColor = '#e2e8f0'}
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || isLoading}
              style={{
                width:        '42px',
                height:       '42px',
                borderRadius: '12px',
                background:   input.trim() && !isLoading
                  ? 'linear-gradient(135deg, #0F4C5C, #1ECAD3)'
                  : '#e2e8f0',
                border:       'none',
                color:        input.trim() && !isLoading ? '#fff' : '#94a3b8',
                cursor:       input.trim() && !isLoading ? 'pointer' : 'not-allowed',
                display:      'flex',
                alignItems:   'center',
                justifyContent: 'center',
                flexShrink:   0,
                transition:   'all .2s',
                boxShadow:    input.trim() && !isLoading
                  ? '0 4px 12px rgba(15,76,92,.3)'
                  : 'none',
              }}
            >
              <IconSend />
            </button>
          </div>

        </>)}
      </div>

      {/* ── Bouton flottant ── */}
      <button onClick={toggleOpen} style={{
        position:      'fixed',
        bottom:        '24px',
        right:         '24px',
        width:         '60px',
        height:        '60px',
        borderRadius:  '50%',
        background:    isOpen
          ? '#e92f64'
          : 'linear-gradient(135deg, #0F4C5C 0%, #1ECAD3 100%)',
        border:        'none',
        cursor:        'pointer',
        color:         '#fff',
        display:       'flex',
        alignItems:    'center',
        justifyContent:'center',
        zIndex:        9999,
        boxShadow:     '0 8px 28px rgba(15,76,92,.35)',
        transition:    'all .3s cubic-bezier(.34,1.56,.64,1)',
        transform:     isOpen ? 'rotate(0deg)' : 'rotate(0deg)',
      }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        {isOpen
          ? <IconClose />
          : <svg viewBox="0 0 24 24" fill="currentColor" width="26" height="26">
              <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
            </svg>
        }

        {/* Badge notification */}
        {showBadge && !isOpen && (
          <span style={{
            position:     'absolute',
            top:          '-4px',
            right:        '-4px',
            width:        '20px',
            height:       '20px',
            background:   '#e92f64',
            borderRadius: '50%',
            border:       '2px solid #fff',
            fontSize:     '10px',
            fontWeight:   700,
            color:        '#fff',
            display:      'flex',
            alignItems:   'center',
            justifyContent: 'center',
            animation:    'badgePulse 2s infinite',
          }}>1</span>
        )}
      </button>

      {/* ── Styles globaux ── */}
      <style>{`
        @keyframes msgIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes typingDot {
          0%, 60%, 100% { transform: translateY(0);    opacity: .4; }
          30%            { transform: translateY(-6px); opacity: 1;  }
        }
        @keyframes badgePulse {
          0%, 100% { transform: scale(1);    box-shadow: 0 0 0 0 rgba(233,47,100,.4); }
          50%       { transform: scale(1.1); box-shadow: 0 0 0 6px rgba(233,47,100,0); }
        }
      `}</style>
    </>
  );
};

export default Chatbot;