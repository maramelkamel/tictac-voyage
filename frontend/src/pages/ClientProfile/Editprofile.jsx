import React, { useState } from 'react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const fDate = (d) => d ? new Date(d).toLocaleDateString('fr-FR') : '—';

export default function Editprofile({ client, setClient, token, notify }) {
  const [editMode, setEditMode] = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [editForm, setEditForm] = useState({
    first_name:         client.firstName        || client.first_name        || '',
    last_name:          client.lastName         || client.last_name         || '',
    phone:              client.phone            || '',
    city:               client.city             || '',
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      const res  = await fetch(`${API}/clients/${client.id}`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body:    JSON.stringify(editForm),
      });
      const json = await res.json();
      if (json.success) {
        const updated = { ...client, ...editForm, firstName: editForm.first_name, lastName: editForm.last_name };
        localStorage.setItem('client', JSON.stringify(updated));
        setClient(updated);
        setEditMode(false);
        notify('Profil mis à jour ✅');
      } else {
        notify(json.message || 'Erreur', 'error');
      }
    } catch { notify('Erreur réseau', 'error'); }
    finally  { setSaving(false); }
  };

  const firstName = client.firstName || client.first_name || '';
  const lastName  = client.lastName  || client.last_name  || '';

  return (
    <div className="cp-profile-card">
      <div className="cp-profile-card__header">
        <h2 className="cp-profile-card__title">Informations personnelles</h2>
        {!editMode && (
          <button onClick={() => setEditMode(true)} className="cp-btn-edit">
            <i className="fas fa-pen" /> Modifier
          </button>
        )}
      </div>

      <div className="cp-profile-card__body">
        {editMode ? (
          <div className="cp-edit-grid">
            {[
              { key: 'first_name',         label: 'Prénom',           type: 'text'   },
              { key: 'last_name',          label: 'Nom',              type: 'text'   },
              { key: 'phone',              label: 'Téléphone',        type: 'tel'    },
              { key: 'city',               label: 'Ville',            type: 'text'   },
              { key: 'number_of_children', label: "Nombre d'enfants", type: 'number' },
            ].map(f => (
              <div key={f.key}>
                <label className="cp-edit-label">{f.label}</label>
                <input
                  type={f.type}
                  value={editForm[f.key] || ''}
                  onChange={e => setEditForm(p => ({ ...p, [f.key]: e.target.value }))}
                  className="cp-input"
                />
              </div>
            ))}
            <div>
              <label className="cp-edit-label">Situation matrimoniale</label>
              <select
                value={editForm.marital_status || ''}
                onChange={e => setEditForm(p => ({ ...p, marital_status: e.target.value }))}
                className="cp-select"
              >
                <option value="">—</option>
                <option value="celibataire">Célibataire</option>
                <option value="marie">Marié(e)</option>
                <option value="divorce">Divorcé(e)</option>
                <option value="veuf">Veuf / Veuve</option>
              </select>
            </div>
            <div className="cp-edit-actions">
              <button onClick={() => setEditMode(false)} className="cp-btn-cancel">Annuler</button>
              <button onClick={handleSave} disabled={saving} className="cp-btn-save">
                {saving ? 'Enregistrement...' : '✅ Sauvegarder'}
              </button>
            </div>
          </div>
        ) : (
          <div className="cp-info-grid">
            {[
              { label: 'Prénom',           value: firstName },
              { label: 'Nom',              value: lastName },
              { label: 'Email',            value: client.email },
              { label: 'Téléphone',        value: client.phone || '—' },
              { label: 'Ville',            value: client.city  || '—' },
              { label: 'Situation',        value: client.marital_status || '—' },
              { label: "Nombre d'enfants", value: client.number_of_children ?? '—' },
              { label: 'Membre depuis',    value: fDate(client.created_at) },
            ].map(item => (
              <div key={item.label}>
                <p className="cp-info-field__label">{item.label}</p>
                <p className="cp-info-field__value">{item.value}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}