import React, { useState, useEffect } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import styles from './Admin.module.css';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', section: 'Website' });
  const [isCreating, setIsCreating] = useState(false);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      if (!res.ok) throw new Error('Failed to fetch categories');
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete category "${name}"?`)) return;
    
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete category');
      }
      setCategories(categories.filter(c => c.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    setIsCreating(true);
    setError('');

    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(newCategory)
      });
      
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Failed to create category');
      
      setCategories([...categories, data]);
      setIsModalOpen(false);
      setNewCategory({ name: '', section: 'Website' });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className={styles.animateFadeIn}>
      <header className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Categories</h1>
          <p style={{ color: '#94a3b8', marginTop: '8px' }}>Manage tool categories for Websites and Android Apps.</p>
        </div>
        <button className={styles.btnPrimary} style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => setIsModalOpen(true)}>
          <Plus size={18} />
          Add Category
        </button>
      </header>

      {error && !isModalOpen && <div className={styles.errorMsg}>{error}</div>}

      <div className={styles.tableContainer}>
        {isLoading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Loading categories...</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Category Name</th>
                <th>Section</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map(cat => (
                <tr key={cat.id}>
                  <td style={{ fontWeight: 500 }}>{cat.name}</td>
                  <td>
                    <span className={`${styles.roleBadge} ${cat.section === 'Website' ? styles.editor : styles.admin}`}>
                      {cat.section}
                    </span>
                  </td>
                  <td>
                    <button 
                      className={styles.deleteBtn}
                      onClick={() => handleDelete(cat.id, cat.name)}
                      title="Delete Category"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr>
                  <td colSpan="3" style={{ textAlign: 'center', padding: '40px' }}>No categories found.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Create Category Modal */}
      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Add New Category</h3>
              <button className={styles.closeBtn} onClick={() => setIsModalOpen(false)}>
                <X size={24} />
              </button>
            </div>

            {error && <div className={styles.errorMsg}>{error}</div>}

            <form onSubmit={handleCreateCategory}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Category Name</label>
                <input
                  type="text"
                  className={styles.formInput}
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                  required
                  placeholder="e.g. Productivity, Image Editors"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Section</label>
                <select
                  className={styles.formInput}
                  value={newCategory.section}
                  onChange={(e) => setNewCategory({...newCategory, section: e.target.value})}
                >
                  <option value="Website">Website</option>
                  <option value="Android App">Android App</option>
                </select>
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
                  {isCreating ? 'Creating...' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
