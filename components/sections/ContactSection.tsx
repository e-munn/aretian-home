'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Send, Check, MessageSquarePlus, ArrowLeft, ArrowRight } from 'lucide-react';
import Stepper, { Step } from '@/components/ui/Stepper';
import Magnet from '@/components/Magnet';

// Validation schemas
const emailSchema = z.object({
  email: z.string().email('Please enter a valid email'),
});

const messageSchema = z.object({
  message: z.string().min(1, 'Please enter a message'),
});

type EmailForm = z.infer<typeof emailSchema>;
type MessageForm = z.infer<typeof messageSchema>;

export function ContactSection() {
  const [userEmail, setUserEmail] = useState('');
  const [messageCount, setMessageCount] = useState(0);
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);

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
      console.log('Sending email to API...', { email, message, isFollowUp });
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, message, isFollowUp, browserData: getBrowserData() }),
      });
      const data = await res.json();
      console.log('API response:', data);
      return res.ok;
    } catch (err) {
      console.error('Send email error:', err);
      return false;
    }
  };

  const inputClasses =
    'w-full py-4 px-5 bg-white/5 text-white text-lg rounded-2xl placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#00C217]/40 border border-white/10 focus:border-[#00C217]/50 transition-all';

  const handleFinalStep = async () => {
    const emailValid = await emailForm.trigger();
    const messageValid = await messageForm.trigger();

    if (!emailValid || !messageValid) return;

    setIsSending(true);
    const success = await sendEmail(
      emailForm.getValues('email'),
      messageForm.getValues('message'),
      messageCount > 0
    );
    setIsSending(false);

    if (success) {
      setUserEmail(emailForm.getValues('email'));
      setMessageCount((c) => c + 1);
      setIsSent(true);
    }
  };

  const handleSendAnother = () => {
    messageForm.reset();
    setIsSent(false);
  };

  if (isSent) {
    return (
      <div className="w-full h-full bg-transparent flex items-center justify-end p-8 md:p-16 md:pr-24">
        <div
          className="w-full rounded-3xl p-8 md:p-10 flex flex-col justify-center items-center"
          style={{
            maxWidth: '480px',
            minHeight: '400px',
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 15 }}
            className="w-20 h-20 rounded-full bg-[#00C217]/20 flex items-center justify-center mb-6"
          >
            <Check className="w-10 h-10 text-[#00C217]" />
          </motion.div>
          <h2
            className="text-3xl md:text-4xl text-white mb-2 uppercase tracking-wide text-center"
            style={{ fontFamily: 'var(--font-bebas-neue)' }}
          >
            {messageCount > 1 ? 'Follow-up sent!' : 'Message sent!'}
          </h2>
          <p className="text-white/50 mb-8 text-center">
            We'll get back to you soon at {userEmail}
          </p>
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            onClick={handleSendAnother}
            className="py-3 px-6 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white rounded-xl flex items-center justify-center gap-2 transition-all border border-white/10 hover:border-white/20"
          >
            <MessageSquarePlus className="w-5 h-5" />
            Send another message
          </motion.button>
        </div>
      </div>
    );
  }

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
        <h2
          className="text-4xl md:text-5xl text-white mb-6 uppercase tracking-wide"
          style={{ fontFamily: 'var(--font-bebas-neue)' }}
        >
          Say Hello
        </h2>

        <Stepper
          initialStep={1}
          onFinalStepCompleted={handleFinalStep}
          stepCircleContainerClassName="mb-6"
          renderFooter={({ currentStep: step, isLastStep, onBack, onNext, onComplete }) => (
            <div className={`flex items-center mt-6 ${step !== 1 ? 'justify-between' : 'justify-end'}`}>
              {step !== 1 && (
                <Magnet padding={8} magnetStrength={2}>
                  <motion.button
                    onClick={onBack}
                    className="relative flex items-center justify-center w-12 h-12 rounded-full cursor-pointer"
                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                    whileHover={{ scale: 1.1, backgroundColor: 'rgba(255, 255, 255, 0.15)' }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <ArrowLeft size={20} className="text-white/60" />
                  </motion.button>
                </Magnet>
              )}
              <Magnet padding={8} magnetStrength={2}>
                <motion.button
                  onClick={isLastStep ? onComplete : onNext}
                  className="relative flex items-center justify-center w-12 h-12 rounded-full cursor-pointer"
                  style={{ backgroundColor: 'rgba(0, 194, 23, 0.2)' }}
                  whileHover={{ scale: 1.1, backgroundColor: 'rgba(0, 194, 23, 0.3)' }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isLastStep ? (
                    <Send size={18} className="text-[#00C217]" />
                  ) : (
                    <ArrowRight size={20} className="text-[#00C217]" />
                  )}
                  {/* Progress ring */}
                  <svg
                    width={48}
                    height={48}
                    className="absolute inset-0 -rotate-90"
                    style={{ pointerEvents: 'none' }}
                  >
                    <circle
                      cx={24}
                      cy={24}
                      r={22}
                      fill="none"
                      stroke="#00C217"
                      strokeWidth={2}
                      opacity={0.3}
                    />
                    <circle
                      cx={24}
                      cy={24}
                      r={22}
                      fill="none"
                      stroke="#00C217"
                      strokeWidth={2}
                      strokeDasharray={138}
                      strokeDashoffset={138 - (step / 3) * 138}
                      strokeLinecap="round"
                    />
                  </svg>
                </motion.button>
              </Magnet>
            </div>
          )}
        >
          {/* Step 1: Email */}
          <Step>
            <div className="space-y-4">
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
          </Step>

          {/* Step 2: Message */}
          <Step>
            <div className="space-y-4">
              <textarea
                {...messageForm.register('message')}
                placeholder="How can we help?"
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
          </Step>

          {/* Step 3: Review & Send */}
          <Step>
            <div className="space-y-4">
              <p className="text-white/40 mb-4">Review your message</p>
              <div className="bg-white/5 rounded-xl p-4 space-y-3">
                <div>
                  <span className="text-white/40 text-sm">From:</span>
                  <p className="text-white">{emailForm.watch('email') || 'your@email.com'}</p>
                </div>
                <div>
                  <span className="text-white/40 text-sm">Message:</span>
                  <p className="text-white/80 text-sm whitespace-pre-wrap">
                    {messageForm.watch('message') || 'Your message...'}
                  </p>
                </div>
              </div>
              {isSending && (
                <div className="flex items-center justify-center gap-2 text-white/60">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  <span>Sending...</span>
                </div>
              )}
            </div>
          </Step>
        </Stepper>
      </div>
    </div>
  );
}
