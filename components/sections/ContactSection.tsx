'use client';

export function ContactSection() {
  return (
    <div className="w-full h-full bg-[#0a0a1a] flex items-center justify-center p-16">
      <div className="max-w-md w-full">
        <h2 className="text-3xl font-medium text-white mb-2 font-google">Get in Touch</h2>
        <p className="text-white/50 mb-8 font-google">We'd love to hear from you</p>
        <form className="space-y-4 font-google">
          <input
            type="email"
            placeholder="Your email"
            className="w-full py-3 px-4 bg-white/10 text-white rounded-xl placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#00C217]/30 border border-white/10"
          />
          <textarea
            placeholder="Your message..."
            rows={4}
            className="w-full py-3 px-4 bg-white/10 text-white rounded-xl placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#00C217]/30 resize-none border border-white/10"
          />
          <button
            type="submit"
            className="w-full py-3 px-6 bg-[#00C217] text-black rounded-xl font-medium hover:bg-[#00a813] transition-colors"
          >
            Send Message
          </button>
        </form>
      </div>
    </div>
  );
}
