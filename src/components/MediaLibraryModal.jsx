import React, { useState, useEffect } from 'react';
import { X, RefreshCw, Check } from 'lucide-react';

export default function MediaLibraryModal({ isOpen, onClose, onSelect, multiSelect = false }) {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState([]);

  const fetchMedia = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch('/api/admin/media', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to fetch media');
      }
      const data = await res.json();
      setMedia(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchMedia();
      setSelected([]);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleSelect = (url) => {
    if (multiSelect) {
      setSelected(prev => prev.includes(url) ? prev.filter(u => u !== url) : [...prev, url]);
    } else {
      setSelected([url]);
    }
  };

  const handleConfirm = () => {
    if (multiSelect) {
      onSelect(selected);
    } else {
      onSelect(selected[0]);
    }
    onClose();
  };

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <div style={headerStyle}>
          <h3 style={{ margin: 0, color: '#f8fafc', fontSize: '1.25rem' }}>Media Library</h3>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="button" onClick={fetchMedia} style={iconBtnStyle} title="Refresh"><RefreshCw size={18} /></button>
            <button type="button" onClick={onClose} style={iconBtnStyle} title="Close"><X size={24} /></button>
          </div>
        </div>
        
        <div style={contentStyle}>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Loading media...</div>
          ) : error ? (
            <div style={{ padding: '20px', color: '#ef4444', textAlign: 'center' }}>{error}</div>
          ) : media.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>No media found in R2 storage.</div>
          ) : (
            <div style={gridStyle}>
              {media.map((item) => {
                const isSelected = selected.includes(item.url);
                return (
                  <div 
                    key={item.key} 
                    style={isSelected ? { ...itemStyle, ...itemSelectedStyle } : itemStyle}
                    onClick={() => toggleSelect(item.url)}
                  >
                    <img src={item.url} alt={item.key} style={imgStyle} loading="lazy" />
                    {isSelected && (
                      <div style={checkOverlayStyle}>
                        <Check size={20} color="white" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
        <div style={footerStyle}>
          <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
            {selected.length} item{selected.length !== 1 ? 's' : ''} selected
          </span>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button type="button" onClick={onClose} style={cancelBtnStyle}>Cancel</button>
            <button type="button" onClick={handleConfirm} disabled={selected.length === 0} style={confirmBtnStyle}>
              Select {selected.length > 0 && `(${selected.length})`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Styles
const overlayStyle = {
  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(4px)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  zIndex: 9999, padding: '20px'
};

const modalStyle = {
  backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '16px', width: '100%', maxWidth: '800px',
  maxHeight: '85vh', display: 'flex', flexDirection: 'column',
  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
};

const headerStyle = {
  padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.1)',
  display: 'flex', justifyContent: 'space-between', alignItems: 'center'
};

const iconBtnStyle = {
  background: 'transparent', border: 'none', color: '#94a3b8',
  cursor: 'pointer', padding: '4px', borderRadius: '4px', display: 'flex'
};

const contentStyle = {
  padding: '24px', overflowY: 'auto', flex: 1, minHeight: '300px'
};

const gridStyle = {
  display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '16px'
};

const itemStyle = {
  aspectRatio: '1', borderRadius: '8px', overflow: 'hidden',
  cursor: 'pointer', position: 'relative', border: '2px solid transparent',
  backgroundColor: 'rgba(0,0,0,0.2)', transition: 'all 0.2s'
};

const itemSelectedStyle = {
  border: '2px solid var(--neon-blue)', transform: 'scale(0.95)'
};

const imgStyle = {
  width: '100%', height: '100%', objectFit: 'cover'
};

const checkOverlayStyle = {
  position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(56, 189, 248, 0.4)', display: 'flex',
  alignItems: 'center', justifyContent: 'center'
};

const footerStyle = {
  padding: '20px 24px', borderTop: '1px solid rgba(255,255,255,0.1)',
  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  backgroundColor: 'rgba(15, 23, 42, 0.4)', borderBottomLeftRadius: '16px', borderBottomRightRadius: '16px'
};

const cancelBtnStyle = {
  padding: '10px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)',
  background: 'transparent', color: '#cbd5e1', cursor: 'pointer'
};

const confirmBtnStyle = {
  padding: '10px 20px', borderRadius: '8px', border: 'none',
  background: 'var(--neon-blue)', color: 'white', fontWeight: 500, cursor: 'pointer'
};
