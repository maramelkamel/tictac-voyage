import React from 'react';

const fDate = (d) => d ? new Date(d).toLocaleDateString('fr-FR') : '—';

const StatusBadge = ({ status }) => {
  const labels = { lu:'Lu', repondu:'Répondu', nouveau:'Nouveau', archive:'Archivé' };
  return <span className={`cp-badge cp-badge--${status}`}>{labels[status] || status}</span>;
};

export default function Mymessages({ messages, initials, navigate }) {
  if (messages.length === 0) {
    return (
      <div className="cp-empty">
        <i className="fas fa-envelope-open cp-empty__icon" />
        <p className="cp-empty__title">Aucun message envoyé</p>
        <button onClick={() => navigate('/Contact')} className="cp-btn-contact">Nous contacter</button>
      </div>
    );
  }

  return (
    <div className="cp-messages">
      {messages.map(msg => (
        <div key={msg.id} className="cp-msg-card">
          <div className="cp-msg-card__header">
            <div className="cp-msg-card__title-row">
              <span className="cp-msg-card__subject">{msg.sujet}</span>
              <StatusBadge status={msg.status}/>
            </div>
            <span className="cp-msg-card__date">{fDate(msg.created_at)}</span>
          </div>
          <div className="cp-msg-card__body">
            <div className="cp-msg-bubble-row">
              <div className="cp-msg-avatar cp-msg-avatar--client">{initials}</div>
              <div className="cp-msg-bubble cp-msg-bubble--client">
                <p className="cp-msg-bubble__from cp-msg-bubble__from--client">Vous</p>
                <p className="cp-msg-bubble__text">{msg.message}</p>
              </div>
            </div>
            {msg.admin_notes && (
              <div className="cp-msg-bubble-row cp-msg-bubble-row--right">
                <div className="cp-msg-avatar cp-msg-avatar--support">
                  <i className="fas fa-headset"/>
                </div>
                <div className="cp-msg-bubble cp-msg-bubble--support">
                  <p className="cp-msg-bubble__from cp-msg-bubble__from--support">Réponse de Tictac Voyages</p>
                  <p className="cp-msg-bubble__text">{msg.admin_notes}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}