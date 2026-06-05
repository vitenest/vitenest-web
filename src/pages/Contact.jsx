import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Send, MapPin, Mail, Phone } from 'lucide-react';
import styles from './Contact.module.css';

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setFormData({ name: '', email: '', message: '' });
    }, 1500);
  };

  return (
    <>
      <Helmet>
        <title>Contact Us | ViteNest</title>
        <meta name="description" content="Get in touch with the ViteNest team for inquiries, support, or partnership opportunities." />
      </Helmet>

      <main className={styles.main}>
        <div className="container">
          <div className={`animate-fade-in ${styles.header}`}>
            <h1 className="text-gradient">Get in Touch</h1>
            <p>We'd love to hear from you. Our team is always here to chat.</p>
          </div>

          <div className={styles.contactWrapper}>
            <div className={`glass-panel ${styles.infoPanel}`}>
              <h2>Contact Information</h2>
              <p className={styles.infoDesc}>
                Fill out the form and our team will get back to you within 24 hours.
              </p>
              
              <div className={styles.infoList}>
                <div className={styles.infoItem}>
                  <Phone className={styles.infoIcon} />
                  <span>+1 (555) 123-4567</span>
                </div>
                <div className={styles.infoItem}>
                  <Mail className={styles.infoIcon} />
                  <span>hello@vitenest.com</span>
                </div>
                <div className={styles.infoItem}>
                  <MapPin className={styles.infoIcon} />
                  <span>123 Innovation Drive, Tech City, TC 10010</span>
                </div>
              </div>

              <div className={styles.decorativeCircle1}></div>
              <div className={styles.decorativeCircle2}></div>
            </div>

            <div className={`glass-panel ${styles.formPanel}`}>
              {isSubmitted ? (
                <div className={styles.successMessage}>
                  <div className={styles.successIcon}>✓</div>
                  <h3>Message Sent!</h3>
                  <p>Thank you for reaching out. We will be in touch shortly.</p>
                  <button className="btn-secondary" onClick={() => setIsSubmitted(false)}>Send Another Message</button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className={styles.contactForm}>
                  <div className={styles.formGroup}>
                    <label htmlFor="name">Full Name</label>
                    <input 
                      type="text" 
                      id="name" 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required 
                      placeholder="John Doe"
                    />
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label htmlFor="email">Email Address</label>
                    <input 
                      type="email" 
                      id="email" 
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      required 
                      placeholder="john@example.com"
                    />
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label htmlFor="message">Message</label>
                    <textarea 
                      id="message" 
                      rows="5"
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                      required 
                      placeholder="How can we help you?"
                    ></textarea>
                  </div>
                  
                  <button type="submit" className={`btn-primary ${styles.submitBtn}`} disabled={isSubmitting}>
                    {isSubmitting ? 'Sending...' : <><Send size={18} /> Send Message</>}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
