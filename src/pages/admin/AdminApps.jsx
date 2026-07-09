import React, { useState, useEffect } from 'react';
import { Plus, Trash2, X, ExternalLink, Star } from 'lucide-react';
import styles from './Admin.module.css';

export default function AdminApps({ section }) {
  const [apps, setApps] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newApp, setNewApp] = useState({ 
    name: '', 
    description: '',
    section: section || 'Website',
    categoryId: '',
    isFeatured: false,
    link: '',
    icon: ''
  });
  const [isCreating, setIsCreating] = useState(false);
  const [showNewCatForm, setShowNewCatForm] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [isCreatingCat, setIsCreatingCat] = useState(false);
  const [isUploadingIcon, setIsUploadingIcon] = useState(false);
  const iconInputRef = React.useRef(null);

  // Reset form section when section prop changes
  useEffect(() => {
    setNewApp(prev => ({ ...prev, section: section || 'Website', categoryId: '' }));
  }, [section]);

  const fetchData = async () => {
    try {
      const [appsRes, catsRes] = await Promise.all([
        fetch('/api/apps'),
        fetch('/api/categories')
      ]);
      
      if (!appsRes.ok || !catsRes.ok) throw new Error('Failed to fetch data');
      
      const appsData = await appsRes.json();
      const catsData = await catsRes.json();
      
      setApps(appsData);
      setCategories(catsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
    
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`/api/admin/apps/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete app');
      }
      setApps(apps.filter(a => a.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCreateApp = async (e) => {
    e.preventDefault();
    setIsCreating(true);
    setError('');

    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch('/api/admin/apps', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(newApp)
      });
      
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Failed to create app');
      
      setApps([...apps, data]);
      setIsModalOpen(false);
      setNewApp({ 
        name: '', description: '', section: section || 'Website', categoryId: '', isFeatured: false, link: '', icon: '' 
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsCreating(false);
    }
  };

  const handleCreateInlineCategory = async () => {
    if (!newCatName.trim()) return;
    setIsCreatingCat(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ name: newCatName.trim(), section: newApp.section })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setCategories(prev => [...prev, data]);
      setNewApp(prev => ({ ...prev, categoryId: data.id }));
      setNewCatName('');
      setShowNewCatForm(false);
    } catch (err) {
      alert(err.message);
    } finally {
      setIsCreatingCat(false);
    }
  };

  const handleIconUpload = async (file) => {
    if (!file) return;
    setIsUploadingIcon(true);
    try {
      const token = localStorage.getItem('adminToken');
      const formData = new FormData();
      formData.append('icon', file);
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      setNewApp(prev => ({ ...prev, icon: data.url }));
    } catch (err) {
      alert(err.message);
    } finally {
      setIsUploadingIcon(false);
    }
  };

  // Filter categories based on selected section
  const availableCategories = categories.filter(c => c.section === newApp.section);
  // Filter apps by section prop
  const displayedApps = section ? apps.filter(a => a.section === section) : apps;
  const pageTitle = section === 'Website' ? 'Websites' : section === 'Android App' ? 'Android Apps' : 'Apps & Websites';
  const pageDesc = section === 'Website' ? 'Manage your website listings.' : section === 'Android App' ? 'Manage your Android app listings.' : 'Manage all directory listings.';

  return (
    <div className={styles.animateFadeIn}>
      <header className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>{pageTitle}</h1>
          <p style={{ color: '#94a3b8', marginTop: '8px' }}>{pageDesc}</p>
        </div>
        <button className={styles.btnPrimary} style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => setIsModalOpen(true)}>
          <Plus size={18} />
          Add {section === 'Android App' ? 'App' : 'Website'}
        </button>
      </header>

      {error && !isModalOpen && <div className={styles.errorMsg}>{error}</div>}

      <div className={styles.tableContainer}>
        {isLoading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Loading apps...</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>App Name</th>
                <th>Section</th>
                <th>Category</th>
                <th>Featured</th>
                <th>Link</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayedApps.map(app => {
                const cat = categories.find(c => c.id === app.categoryId);
                return (
                  <tr key={app.id}>
                    <td style={{ fontWeight: 500 }}>{app.name}</td>
                    <td>
                      <span className={`${styles.roleBadge} ${app.section === 'Website' ? styles.editor : styles.admin}`}>
                        {app.section}
                      </span>
                    </td>
                    <td>{cat ? cat.name : '-'}</td>
                    <td>
                      {app.isFeatured && <Star size={16} color="#f59e0b" fill="#f59e0b" />}
                    </td>
                    <td>
                      <a href={app.link} target="_blank" rel="noreferrer" style={{ color: 'var(--neon-blue)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        Visit <ExternalLink size={14} />
                      </a>
                    </td>
                    <td>
                      <button 
                        className={styles.deleteBtn}
                        onClick={() => handleDelete(app.id, app.name)}
                        title="Delete App"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {displayedApps.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>No apps found.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Create App Modal */}
      {isModalOpen && (
        <div className={styles.modalOverlay} style={{ overflowY: 'auto', padding: '20px 0' }}>
          <div className={styles.modal} style={{ margin: 'auto' }}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Add New App / Website</h3>
              <button className={styles.closeBtn} onClick={() => setIsModalOpen(false)}>
                <X size={24} />
              </button>
            </div>

            {error && <div className={styles.errorMsg}>{error}</div>}

            <form onSubmit={handleCreateApp}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Name</label>
                <input
                  type="text"
                  className={styles.formInput}
                  value={newApp.name}
                  onChange={(e) => setNewApp({...newApp, name: e.target.value})}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Description</label>
                <textarea
                  className={styles.formInput}
                  value={newApp.description}
                  onChange={(e) => setNewApp({...newApp, description: e.target.value})}
                  rows="3"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Link (URL)</label>
                <input
                  type="url"
                  className={styles.formInput}
                  value={newApp.link}
                  onChange={(e) => setNewApp({...newApp, link: e.target.value})}
                  required
                  placeholder="https://..."
                />
              </div>
              
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Icon</label>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  {/* Preview */}
                  <div
                    onClick={() => iconInputRef.current?.click()}
                    style={{
                      width: '64px', height: '64px', borderRadius: '12px',
                      border: '2px dashed rgba(255,255,255,0.15)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', flexShrink: 0, overflow: 'hidden',
                      background: 'rgba(255,255,255,0.03)', transition: 'border-color 0.2s'
                    }}
                    title="Click to upload icon"
                  >
                    {isUploadingIcon ? (
                      <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>...</span>
                    ) : newApp.icon && (newApp.icon.startsWith('/') || newApp.icon.startsWith('http')) ? (
                      <img src={newApp.icon} alt="icon" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    ) : (
                      <span style={{ fontSize: '1.5rem' }}>🖼</span>
                    )}
                  </div>
                  <input
                    ref={iconInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(e) => handleIconUpload(e.target.files[0])}
                  />
                  <div style={{ flex: 1 }}>
                    <input
                      type="text"
                      className={styles.formInput}
                      value={newApp.icon}
                      onChange={(e) => setNewApp({...newApp, icon: e.target.value})}
                      placeholder="Or type a Lucide icon name (e.g. Zap)"
                    />
                    <p style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '6px' }}>
                      Click the box to upload an image, or type a Lucide icon name below.
                    </p>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px' }}>
                <div className={styles.formGroup} style={{ flex: 1 }}>
                  <label className={styles.formLabel}>Section</label>
                  <select
                    className={styles.formInput}
                    value={newApp.section}
                    onChange={(e) => setNewApp({...newApp, section: e.target.value, categoryId: ''})}
                  >
                    <option value="Website">Website</option>
                    <option value="Android App">Android App</option>
                  </select>
                </div>

                <div className={styles.formGroup} style={{ flex: 1 }}>
                  <label className={styles.formLabel}>Category</label>
                  {showNewCatForm ? (
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input
                        type="text"
                        className={styles.formInput}
                        value={newCatName}
                        onChange={(e) => setNewCatName(e.target.value)}
                        placeholder="Category name..."
                        autoFocus
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleCreateInlineCategory(); } }}
                      />
                      <button
                        type="button"
                        className={styles.saveBtn}
                        onClick={handleCreateInlineCategory}
                        disabled={isCreatingCat || !newCatName.trim()}
                        style={{ whiteSpace: 'nowrap', padding: '10px 14px' }}
                      >
                        {isCreatingCat ? '...' : 'Add'}
                      </button>
                      <button
                        type="button"
                        onClick={() => { setShowNewCatForm(false); setNewCatName(''); }}
                        style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '8px' }}
                      >
                        <X size={18} />
                      </button>
                    </div>
                  ) : (
                    <select
                      className={styles.formInput}
                      value={newApp.categoryId}
                      onChange={(e) => {
                        if (e.target.value === '__create__') {
                          setShowNewCatForm(true);
                          setNewApp({...newApp, categoryId: ''});
                        } else {
                          setNewApp({...newApp, categoryId: e.target.value});
                        }
                      }}
                    >
                      <option value="">Select Category...</option>
                      {availableCategories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                      <option value="__create__">＋ Create new category...</option>
                    </select>
                  )}
                </div>
              </div>

              <div className={styles.formGroup} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
                <input
                  type="checkbox"
                  id="featuredCheck"
                  checked={newApp.isFeatured}
                  onChange={(e) => setNewApp({...newApp, isFeatured: e.target.checked})}
                  style={{ width: '18px', height: '18px' }}
                />
                <label htmlFor="featuredCheck" className={styles.formLabel} style={{ marginBottom: 0, cursor: 'pointer' }}>
                  Feature on Homepage
                </label>
              </div>

              <div className={styles.modalActions}>
                <button 
                  type="button" 
                  className={styles.cancelBtn} 
                  onClick={() => setIsModalOpen(false)}
                  disabled={isCreating}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className={styles.saveBtn}
                  disabled={isCreating}
                >
                  {isCreating ? 'Saving...' : 'Save App'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
