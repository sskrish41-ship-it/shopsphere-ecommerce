import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

const ContactPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/contact', { name, email, subject, message });
      addToast('Thank you! Your message has been sent to support.', 'success');
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    } catch (err) {
      addToast('Failed to send message', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Info Left (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            <span className="px-3 py-1 rounded-full bg-brand-100 dark:bg-brand-950 text-brand-600 dark:text-brand-400 font-extrabold text-xs uppercase tracking-wider">
              24/7 CUSTOMER SUPPORT
            </span>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white mt-2">Get In Touch With Us</h1>
            <p className="text-xs text-gray-500 mt-2 leading-relaxed">
              Have a question regarding your order, product specifications, or returns? Drop us a message and our team will respond within 24 hours.
            </p>
          </div>

          <div className="space-y-4 text-xs">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-600 flex items-center justify-center flex-shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-gray-900 dark:text-white">Customer Support Phone</div>
                <div className="text-gray-400">+1 (800) 555-SPHERE</div>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-gray-900 dark:text-white">Email Address</div>
                <div className="text-gray-400">support@shopsphere.com</div>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-gray-900 dark:text-white">Headquarters Office</div>
                <div className="text-gray-400">742 Evergreen Terrace, Springfield, IL</div>
              </div>
            </div>
          </div>
        </div>

        {/* Form Right (7 cols) */}
        <div className="lg:col-span-7">
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-8 shadow-xl space-y-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Send Us A Message</h2>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">Your Name</label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 font-medium outline-none focus:border-brand-500"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="you@domain.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 font-medium outline-none focus:border-brand-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">Subject</label>
                <input
                  type="text"
                  placeholder="Order Inquiry, Return, Tech Question..."
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 font-medium outline-none focus:border-brand-500"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">Message</label>
                <textarea
                  rows="5"
                  placeholder="How can we help you today?"
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 font-medium outline-none focus:border-brand-500"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-sm shadow-xl shadow-brand-500/25 flex items-center justify-center gap-2"
              >
                {loading ? 'Sending Message...' : 'Submit Message'} <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ContactPage;
