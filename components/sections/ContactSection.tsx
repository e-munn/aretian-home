'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowRight, Send, MessageSquarePlus, Check } from 'lucide-react';

// Validation schemas
const emailSchema = z.object({
  email: z.string().email('Please enter a valid email'),
});

const messageSchema = z.object({
  message: z.string().min(1, 'Please enter a message'),
});

type EmailForm = z.infer<typeof emailSchema>;
type MessageForm = z.infer<typeof messageSchema>;

type Step = 'email' | 'message' | 'sending' | 'sent' | 'more';

export function ContactSection() {
  const [step, setStep] = useState<Step>('email');
  const [userEmail, setUserEmail] = useState('');
  const [messageCount, setMessageCount] = useState(0);

  const emailForm = useForm<EmailForm>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: '' },
  });

  const messageForm = useForm<MessageForm>({
    resolver: zodResolver(messageSchema),
    defaultValues: { message: '' },
  });

  const getBrowserData = () => ({
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: navigator.language,
    screenSize: `${window.screen.width}x${window.screen.height}`,
    page: window.location.href,
  });

  const sendEmail = async (email: string, message: string, isFollowUp = false) => {
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, message, isFollowUp, browserData: getBrowserData() }),
      });
      return res.ok;
    } catch {
      return false;
    }
  };

  const onEmailSubmit = (data: EmailForm) => {
    setUserEmail(data.email);
    setStep('message');
  };

  const onMessageSubmit = async (data: MessageForm) => {
    setStep('sending');
    const success = await sendEmail(userEmail, data.message, messageCount > 0);
    if (success) {
      setMessageCount((c) => c + 1);
      messageForm.reset();
      setStep('sent');
      // Auto-transition to "more" after delay
      setTimeout(() => setStep('more'), 2000);
    } else {
      setStep('message'); // Go back on error
    }
  };

  const handleSayMore = () => {
    setStep('message');
  };

  const inputClasses =
    'w-full py-4 px-5 bg-white/5 text-white text-lg rounded-2xl placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#00C217]/40 border border-white/10 focus:border-[#00C217]/50 transition-all';

  const buttonClasses =
    'w-full py-4 px-6 bg-[#00C217] hover:bg-[#00C217]/90 text-black font-semibold rounded-2xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed';

  return (
    <div className="w-full h-full bg-transparent flex items-center justify-end p-8 md:p-16 md:pr-24">
      <div
        className="w-full rounded-3xl p-8 md:p-10 flex flex-col justify-center"
        style={{
          maxWidth: '480px',
          minHeight: '400px',
          backgroundColor: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(20px)',
        }}
      >
        <AnimatePresence mode="wait">
          {/* Step 1: Email */}
          {step === 'email' && (
            <motion.div
              key="email"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h2
                className="text-4xl md:text-5xl text-white mb-2 uppercase tracking-wide"
                style={{ fontFamily: 'var(--font-bebas-neue)' }}
              >
                Let's talk
              </h2>
              <p className="text-white/40 mb-8">
                Start with your email
              </p>

              <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-4">
                <div>
                  <input
                    {...emailForm.register('email')}
                    type="email"
                    placeholder="your@email.com"
                    autoFocus
                    className={inputClasses}
                  />
                  {emailForm.formState.errors.email && (
                    <p className="text-red-400 text-sm mt-2 ml-1">
                      {emailForm.formState.errors.email.message}
                    </p>
                  )}
                </div>
                <button type="submit" className={buttonClasses}>
                  Continue
                  <ArrowRight className="w-5 h-5" />
                </button>
              </form>
            </motion.div>
          )}

          {/* Step 2: Message */}
          {step === 'message' && (
            <motion.div
              key="message"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-white/40 text-sm">{userEmail}</span>
                <button
                  type="button"
                  onClick={() => setStep('email')}
                  className="text-[#00C217]/70 hover:text-[#00C217] text-sm"
                >
                  edit
                </button>
              </div>
              <h2
                className="text-4xl md:text-5xl text-white mb-2 uppercase tracking-wide"
                style={{ fontFamily: 'var(--font-bebas-neue)' }}
              >
                {messageCount > 0 ? 'Say more' : 'Your message'}
              </h2>
              <p className="text-white/40 mb-8">
                {messageCount > 0 ? "Anything else you'd like to add?" : 'Tell us about your project'}
              </p>

              <form onSubmit={messageForm.handleSubmit(onMessageSubmit)} className="space-y-4">
                <div>
                  <textarea
                    {...messageForm.register('message')}
                    placeholder={messageCount > 0 ? 'Additional thoughts...' : "Describe what you're working on..."}
                    rows={4}
                    autoFocus
                    className={`${inputClasses} resize-none`}
                  />
                  {messageForm.formState.errors.message && (
                    <p className="text-red-400 text-sm mt-2 ml-1">
                      {messageForm.formState.errors.message.message}
                    </p>
                  )}
                </div>
                <button type="submit" className={buttonClasses}>
                  Send
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </motion.div>
          )}

          {/* Sending state */}
          {step === 'sending' && (
            <motion.div
              key="sending"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="text-center py-12"
            >
              <div className="w-16 h-16 rounded-full border-4 border-[#00C217]/30 border-t-[#00C217] animate-spin mx-auto mb-6" />
              <p className="text-white/60">Sending...</p>
            </motion.div>
          )}

          {/* Sent confirmation */}
          {step === 'sent' && (
            <motion.div
              key="sent"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center py-12"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 15 }}
                className="w-20 h-20 rounded-full bg-[#00C217]/20 flex items-center justify-center mx-auto mb-6"
              >
                <Check className="w-10 h-10 text-[#00C217]" />
              </motion.div>
              <h2
                className="text-3xl md:text-4xl text-white mb-2 uppercase tracking-wide"
                style={{ fontFamily: 'var(--font-bebas-neue)' }}
              >
                {messageCount > 1 ? 'Follow-up sent!' : 'Message sent!'}
              </h2>
              <p className="text-white/50">
                We'll get back to you soon
              </p>
            </motion.div>
          )}

          {/* Say more option */}
          {step === 'more' && (
            <motion.div
              key="more"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="text-center py-8"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 15 }}
                className="w-16 h-16 rounded-full bg-[#00C217]/20 flex items-center justify-center mx-auto mb-6"
              >
                <Check className="w-8 h-8 text-[#00C217]" />
              </motion.div>

              <p className="text-white/50 mb-8">
                {messageCount === 1 ? "We've received your message" : `${messageCount} messages sent`}
              </p>

              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                onClick={handleSayMore}
                className="py-3 px-6 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white rounded-xl flex items-center justify-center gap-2 mx-auto transition-all border border-white/10 hover:border-white/20"
              >
                <MessageSquarePlus className="w-5 h-5" />
                Say more
              </motion.button>

              <p className="text-white/30 text-xs mt-6">
                Thought of something else? Send another message.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
