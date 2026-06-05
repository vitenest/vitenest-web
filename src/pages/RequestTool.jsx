import { Helmet } from 'react-helmet-async';
import styles from './RequestTool.module.css';
import { Send } from 'lucide-react';

export default function RequestTool() {
  return (
    <>
      <Helmet><title>Request a Tool | ViteNest</title></Helmet>
      <main className="container" style={{paddingTop: '120px', minHeight: '80vh'}}>
        <div style={{textAlign: 'center', marginBottom: '40px'}}>
          <h1 className="text-gradient">Request a Free Tool</h1>
          <p style={{color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto'}}>
            You dream it, we build it. Submit your idea below and if enough people want it, our engineers will build it for free.
          </p>
        </div>

        <div className={`glass-panel ${styles.formWrapper}`}>
          <form onSubmit={(e) => e.preventDefault()}>
            <div className={styles.formGroup}>
              <label htmlFor="toolName">Tool Name or Idea</label>
              <input type="text" id="toolName" placeholder="e.g. PDF to Word Converter" required />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="problem">What problem does it solve?</label>
              <textarea id="problem" placeholder="Describe how this tool would help you or others..." required></textarea>
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="email">Your Email (Optional)</label>
              <input type="email" id="email" placeholder="So we can notify you when it's built" />
            </div>

            <button type="submit" className="btn-primary" style={{width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px'}}>
              Submit Request <Send size={18} />
            </button>
          </form>
        </div>
      </main>
    </>
  );
}
