import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';

const ContactSection = () => {
  const { t, lang } = useLanguage();
  const [status, setStatus] = useState('');
  const [copiedText, setCopiedText] = useState('');

  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopiedText(type);
    setTimeout(() => setCopiedText(''), 2000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const data = new FormData(form);
    
    setStatus('submitting');
    try {
      const response = await fetch('https://formspree.io/f/xnjwkzbw', {
        method: 'POST',
        body: data,
        headers: {
          'Accept': 'application/json'
        }
      });
      if (response.ok) {
        setStatus('success');
        form.reset();
        setTimeout(() => setStatus(''), 5000);
      } else {
        setStatus('error');
        setTimeout(() => setStatus(''), 5000);
      }
    } catch (error) {
      setStatus('error');
      setTimeout(() => setStatus(''), 5000);
    }
  };

  return (
    <section className="relative" id="contact">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12" style={{ perspective: 1200 }}>
        <div>
          <div className="section-header">
            <div className="corner-bracket-tl"></div>
            <h2 className="font-headline-lg text-headline-lg mb-8 text-text-primary uppercase tracking-tight">{t('contact.title')}</h2>
          </div>
          <p className="text-on-surface-variant mb-6 md:mb-12 font-label-md text-label-md uppercase tracking-[0.2em] max-w-md">{t('contact.description')}</p>
          <div className="space-y-6">
            <button 
              onClick={() => handleCopy('arthur.rosisca@gmail.com', 'email')}
              className="flex items-center gap-6 group cursor-pointer text-left w-full focus:outline-none"
              title={lang === 'PT' ? "Clique para copiar e-mail" : "Click to copy email"}
            >
              <div className="w-14 h-14 rounded-full glass-panel border border-primary-fixed/20 flex items-center justify-center group-hover:border-primary-light transition-[border-color,transform] group-hover:scale-105 duration-100">
                <span className="material-symbols-outlined text-primary-fixed">mail</span>
              </div>
              <div>
                <span 
                  key={copiedText === 'email' ? 'copied' : 'label'}
                  className={`block text-[10px] uppercase tracking-[0.2em] animate-subtle-fade-up ${copiedText === 'email' ? 'text-primary-light font-bold' : 'text-on-surface-variant'}`}
                >
                  {copiedText === 'email' ? t('contact.copied') : 'E-MAIL'}
                </span>
                <span className="text-base md:text-lg font-bold text-text-primary break-all">arthur.rosisca@gmail.com</span>
              </div>
            </button>
            <button 
              onClick={() => handleCopy('+55 14 99745-0052', 'phone')}
              className="flex items-center gap-6 group cursor-pointer text-left w-full focus:outline-none"
              title={lang === 'PT' ? "Clique para copiar WhatsApp" : "Click to copy WhatsApp"}
            >
              <div className="w-14 h-14 rounded-full glass-panel border border-primary-fixed/20 flex items-center justify-center group-hover:border-primary-light transition-[border-color,transform] group-hover:scale-105 duration-100">
                <span className="material-symbols-outlined text-primary-fixed">phone</span>
              </div>
              <div>
                <span 
                  key={copiedText === 'phone' ? 'copied' : 'label'}
                  className={`block text-[10px] uppercase tracking-[0.2em] animate-subtle-fade-up ${copiedText === 'phone' ? 'text-primary-light font-bold' : 'text-on-surface-variant'}`}
                >
                  {copiedText === 'phone' ? t('contact.copied') : 'WHATSAPP'}
                </span>
                <span className="text-lg font-bold text-text-primary uppercase">+55 14 99745-0052</span>
              </div>
            </button>
          </div>
          {/* Terminal Indicator */}
          <motion.div 
            initial={{ opacity: 0, rotateX: -12, y: 40, scale: 0.96 }}
            whileInView={{ opacity: 1, rotateX: 0, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ type: "spring", stiffness: 90, damping: 14, mass: 1, delay: 0 }}
            className="mt-12 p-6 rounded-xl glass-panel border border-primary-fixed/20 relative overflow-hidden"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-primary-light animate-pulse"></div>
              <span className="font-code-sm text-[10px] uppercase text-primary-light tracking-widest">{t('contact.status')}</span>
            </div>
            <p className="font-code-sm text-[10px] text-text-primary uppercase tracking-widest">{t('contact.ready')}</p>
          </motion.div>
        </div>
        <motion.div 
          className="glass-panel p-6 md:p-10 border border-primary-fixed/20 relative rounded-tr-none rounded-tl-xl rounded-bl-xl rounded-br-xl"
          initial={{ opacity: 0, rotateX: -12, y: 40, scale: 0.96 }}
          whileInView={{ opacity: 1, rotateX: 0, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ type: "spring", stiffness: 90, damping: 14, mass: 1, delay: 0.15 }}
        >
          <div className="absolute -top-1 -right-1 w-12 h-12 border-t-2 border-r-2 border-primary-fixed"></div>
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-on-surface-variant ml-4">{t('contact.form_name')}</label>
                <input name="name" required className="w-full bg-surface-container border border-primary-fixed/20 rounded-xl px-6 py-4 focus:ring-1 focus:ring-primary-fixed focus:border-primary-fixed outline-none text-sm transition-all" placeholder={t('contact.form_name_placeholder')} type="text" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-on-surface-variant ml-4">{t('contact.form_email')}</label>
                <input name="email" required className="w-full bg-surface-container border border-primary-fixed/20 rounded-xl px-6 py-4 focus:ring-1 focus:ring-primary-fixed focus:border-primary-fixed outline-none text-sm transition-all" placeholder={t('contact.form_email_placeholder')} type="email" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-on-surface-variant ml-4">{t('contact.form_message')}</label>
              <textarea name="message" required className="w-full bg-surface-container border border-primary-fixed/20 rounded-xl px-6 py-4 focus:ring-1 focus:ring-primary-fixed focus:border-primary-fixed outline-none text-sm transition-all" placeholder={t('contact.form_message_placeholder')} rows="4"></textarea>
            </div>
            </div>
            <button 
              disabled={status === 'submitting'}
              className="mt-6 md:mt-10 w-full bg-primary-fixed text-on-primary-fixed depth-btn-primary font-bold py-5 text-sm uppercase tracking-[0.3em] rounded-[15px] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed" 
              type="submit"
            >
              {status === 'submitting' ? '...' : t('contact.form_send')}
            </button>
            {status === 'success' && (
              <div className="text-primary-fixed text-center text-sm font-bold mt-4 animate-in fade-in">Mensagem enviada com sucesso!</div>
            )}
            {status === 'error' && (
              <div className="text-red-500 text-center text-sm font-bold mt-4 animate-in fade-in">Ocorreu um erro. Tente novamente mais tarde.</div>
            )}
          </form>
        </motion.div>
      </div>
    </section>
  );
};

export default ContactSection;
