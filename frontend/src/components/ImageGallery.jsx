import { useState } from 'react';

const ImageGallery = ({
  images = [],
  editable = false,
  onImageChange,
  onImageDelete = () => {},
  onImageAdd = () => {},
  maxImages = 10,
}) => {
  const [newImageUrl, setNewImageUrl] = useState('');
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const handleAddImage = () => {
    if (newImageUrl.trim()) {
      onImageAdd(newImageUrl);
      setNewImageUrl('');
    }
  };

  return (
    <div style={{ margin: '24px 0' }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
          gap: '16px',
          marginBottom: '20px',
        }}
      >
        {images.map((image, idx) => (
          <div
            key={idx}
            style={{
              position: 'relative',
              aspectRatio: '1',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
              background: 'var(--gray-100)',
            }}
            onMouseEnter={() => setHoveredIndex(idx)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <img
              src={image}
              alt={`Gallery ${idx + 1}`}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transition: 'transform var(--duration) var(--ease)',
                transform: hoveredIndex === idx ? 'scale(1.05)' : 'scale(1)',
              }}
            />

            {editable && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'rgba(0,0,0,0.7)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  opacity: hoveredIndex === idx ? 1 : 0,
                  transition: 'opacity var(--duration) var(--ease)',
                }}
              >
                <button
                  onClick={() => onImageDelete(idx)}
                  style={{
                    width: '40px',
                    height: '40px',
                    background: 'var(--accent)',
                    color: 'var(--white)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all var(--duration) var(--ease)',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                  aria-label="Supprimer l'image"
                >
                  <i className="fas fa-trash" />
                </button>
              </div>
            )}
          </div>
        ))}

        {editable && images.length < maxImages && (
          <div
            style={{
              aspectRatio: '1',
              border: '2px dashed var(--gray-300)',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div style={{ textAlign: 'center', color: 'var(--gray-400)' }}>
              <i className="fas fa-image" style={{ fontSize: '32px', marginBottom: '10px', display: 'block' }} />
              <p style={{ fontSize: '12px', fontWeight: 600 }}>Ajouter une image</p>
            </div>
          </div>
        )}
      </div>

      {editable && (
        <div style={{ display: 'flex', gap: '12px' }}>
          <input
            type="url"
            placeholder="URL de l'image..."
            value={newImageUrl}
            onChange={(e) => setNewImageUrl(e.target.value)}
            style={{
              flex: 1,
              padding: '12px 16px',
              background: 'var(--gray-50)',
              border: '1px solid var(--gray-200)',
              borderRadius: 'var(--radius-md)',
              fontSize: '14px',
              outline: 'none',
              transition: 'all var(--duration) var(--ease)',
            }}
          />
          <button
            onClick={handleAddImage}
            disabled={!newImageUrl.trim()}
            style={{
              padding: '12px 24px',
              background: newImageUrl.trim() ? 'var(--secondary)' : 'var(--gray-300)',
              color: 'var(--white)',
              borderRadius: 'var(--radius-md)',
              fontWeight: 600,
              fontSize: '14px',
              border: 'none',
              cursor: newImageUrl.trim() ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <i className="fas fa-plus" /> Ajouter
          </button>
        </div>
      )}
    </div>
  );
};

export default ImageGallery;
