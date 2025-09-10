import React from 'react';

const Contact = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#0d0d0d] via-[#121212] to-[#1a1a1a] px-4 sm:px-8 md:px-16 text-[#e5e5e5]">
    <h1 className="text-4xl font-bold text-white mb-6 text-center drop-shadow-lg">Contact Us</h1>
    <p className="max-w-xl text-lg text-[#a1a1aa] text-center mb-8">
      Have questions or feedback? Reach out to us!
    </p>
    <form className="w-full max-w-md bg-[#1e1e1e]/90 backdrop-blur-md p-6 sm:p-8 rounded-2xl shadow-2xl border border-neutral-800">
      <input className="w-full mb-4 px-4 py-2 bg-[#0f0f10] border border-neutral-700 rounded-lg text-[#e5e5e5] placeholder-[#6b7280] focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition" type="text" placeholder="Your Name" required />
      <input className="w-full mb-4 px-4 py-2 bg-[#0f0f10] border border-neutral-700 rounded-lg text-[#e5e5e5] placeholder-[#6b7280] focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition" type="email" placeholder="Your Email" required />
      <textarea className="w-full mb-4 px-4 py-2 bg-[#0f0f10] border border-neutral-700 rounded-lg text-[#e5e5e5] placeholder-[#6b7280] focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition" placeholder="Your Message" rows="4" required></textarea>
      <button className="w-full py-2 sm:py-3 rounded-xl font-semibold shadow-lg bg-gradient-to-r from-[#6366f1] to-[#4f46e5] hover:from-[#818cf8] hover:to-[#6366f1] text-white transition" type="submit">Send</button>
    </form>
  </div>
);

export default Contact;
