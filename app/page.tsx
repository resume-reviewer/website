import { FaRocket, FaTasks, FaFileAlt, FaMicrophone, FaCheck } from "react-icons/fa";

export default function Home() {
  return (
    <div className="font-sans bg-gradient-to-b from-[#f5f7fa] to-[#c3cfe2] min-h-screen text-[#333]">
      {/* Header */}
      <header className="fixed w-full z-50 bg-white/95 backdrop-blur-[20px] border-b border-black/5">
        <nav className="container mx-auto flex justify-between items-center py-4 px-4 max-w-6xl">
          <div className="flex items-center gap-2 font-extrabold text-2xl bg-gradient-to-r from-[#667eea] to-[#764ba2] bg-clip-text text-transparent">
            <FaRocket className="text-[#667eea]" />
            CareerPilot
          </div>
          <ul className="hidden md:flex gap-8 text-[#666] font-medium">
            <li><a href="#features" className="hover:text-[#667eea] transition-all hover:-translate-y-0.5">Features</a></li>
            <li><a href="#pricing" className="hover:text-[#667eea] transition-all hover:-translate-y-0.5">Pricing</a></li>
            <li><a href="#about" className="hover:text-[#667eea] transition-all hover:-translate-y-0.5">About</a></li>
            <li><a href="#contact" className="hover:text-[#667eea] transition-all hover:-translate-y-0.5">Contact</a></li>
          </ul>
          <a
            href="/register"
            className="bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white px-6 py-3 rounded-full font-semibold shadow transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
          >
            Get Started Free
          </a>
        </nav>
      </header>

      {/* Hero */}
      <section className="hero relative text-center pt-36 pb-20 overflow-hidden" id="hero">
        <div className="absolute -top-1/2 -left-1/2 w-[200vw] h-[200vw] bg-[radial-gradient(circle,rgba(102,126,234,0.1)_0%,transparent_50%)] animate-spin-slow pointer-events-none" />
        <div className="relative z-10 container mx-auto px-4 max-w-3xl">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-6 bg-gradient-to-r from-[#667eea] to-[#764ba2] bg-clip-text text-transparent leading-tight">
            Say Goodbye to Job Hunting Chaos
          </h1>
          <p className="text-lg md:text-xl text-[#666] mb-8 max-w-xl mx-auto">
            Track applications, optimize your resume with AI, and land your dream job faster with <span className="font-semibold text-[#667eea]">CareerPilot</span> - your intelligent career companion.
          </p>
          <a
            href="/register"
            className="inline-flex items-center gap-3 bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white px-8 py-4 rounded-full font-semibold text-lg shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
          >
            <FaRocket className="text-white" />
            Get Started Free
          </a>
        </div>
      </section>

      {/* Features */}
      <section className="features bg-white py-24" id="features">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-[#333]">Everything You Need to Land Your Dream Job</h2>
          <div className="grid gap-12 md:grid-cols-3 mt-16">
            <div className="feature-card bg-white p-10 rounded-2xl text-center shadow-[0_10px_40px_rgba(0,0,0,0.08)] border-t-4 border-[#667eea] relative transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_60px_rgba(0,0,0,0.15)]">
              <div className="feature-icon w-20 h-20 mx-auto mb-6 flex items-center justify-center rounded-2xl bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white text-3xl">
                <FaTasks />
              </div>
              <h3 className="text-xl font-bold mb-2 text-[#333]">Smart Job Tracker</h3>
              <p className="text-[#666]">Organize your applications with our intuitive Kanban board. Track progress from saved jobs to offers, never miss a deadline, and stay on top of every opportunity.</p>
            </div>
            <div className="feature-card bg-white p-10 rounded-2xl text-center shadow-[0_10px_40px_rgba(0,0,0,0.08)] border-t-4 border-[#667eea] relative transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_60px_rgba(0,0,0,0.15)]">
              <div className="feature-icon w-20 h-20 mx-auto mb-6 flex items-center justify-center rounded-2xl bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white text-3xl">
                <FaFileAlt />
              </div>
              <h3 className="text-xl font-bold mb-2 text-[#333]">AI Resume Review</h3>
              <p className="text-[#666]">Get instant feedback on your resume with our AI-powered analyzer. Optimize for specific job descriptions and increase your chances of getting noticed by recruiters.</p>
            </div>
            <div className="feature-card bg-white p-10 rounded-2xl text-center shadow-[0_10px_40px_rgba(0,0,0,0.08)] border-t-4 border-[#667eea] relative transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_60px_rgba(0,0,0,0.15)]">
              <div className="feature-icon w-20 h-20 mx-auto mb-6 flex items-center justify-center rounded-2xl bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white text-3xl">
                <FaMicrophone />
              </div>
              <h3 className="text-xl font-bold mb-2 text-[#333]">Mock Interview Simulator</h3>
              <p className="text-[#666]">Practice with our AI interviewer that adapts to your target role. Get real-time feedback on your answers and build confidence before the real interview.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="pricing bg-gradient-to-b from-[#f8fafc] to-[#e2e8f0] py-24" id="pricing">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="section-title text-3xl md:text-4xl font-bold text-center mb-12 text-[#333]">Choose Your Plan</h2>
          <div className="pricing-grid grid gap-8 md:grid-cols-3 mt-16">
            {/* Basic */}
            <div className="pricing-card bg-white p-10 rounded-2xl text-center shadow-[0_10px_40px_rgba(0,0,0,0.08)] transition-all duration-300">
              <h3 className="text-xl font-bold mb-2">Basic</h3>
              <div className="price text-4xl font-extrabold bg-gradient-to-r from-[#667eea] to-[#764ba2] bg-clip-text text-transparent mb-2">Free</div>
              <p className="text-[#666] mb-6">Perfect for getting started</p>
              <ul className="pricing-features text-[#666] mb-8 space-y-2 text-left">
                <li className="flex items-center gap-2"><span className="check text-[#10b981] font-bold">✓</span> Track up to 20 jobs</li>
                <li className="flex items-center gap-2"><span className="check text-[#10b981] font-bold">✓</span> Basic dashboard</li>
                <li className="flex items-center gap-2"><span className="check text-[#10b981] font-bold">✓</span> Document upload</li>
                <li className="flex items-center gap-2"><span className="check text-[#10b981] font-bold">✓</span> Job insights</li>
                <li className="opacity-40">✗ AI Resume Review</li>
                <li className="opacity-40">✗ AI Cover Letter</li>
                <li className="opacity-40">✗ Mock Interview</li>
              </ul>
              <a href="/register" className="pricing-cta w-full bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white py-3 rounded-full font-semibold shadow transition-all duration-300 hover:-translate-y-1 hover:shadow-xl block">Get Started Free</a>
            </div>
            {/* Pro */}
            <div className="pricing-card featured bg-white p-10 rounded-2xl text-center shadow-[0_10px_40px_rgba(0,0,0,0.08)] border-4 border-[#667eea] scale-105 relative transition-all duration-300">
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white px-6 py-1 rounded-full font-semibold text-sm shadow">Most Popular</div>
              <h3 className="text-xl font-bold mb-2">Pro</h3>
              <div className="price text-4xl font-extrabold bg-gradient-to-r from-[#667eea] to-[#764ba2] bg-clip-text text-transparent mb-2">$19<span className="text-base text-[#666] font-normal">/month</span></div>
              <p className="text-[#666] mb-6">For serious job seekers</p>
              <ul className="pricing-features text-[#666] mb-8 space-y-2 text-left">
                <li className="flex items-center gap-2"><span className="check text-[#10b981] font-bold">✓</span> Unlimited job tracking</li>
                <li className="flex items-center gap-2"><span className="check text-[#10b981] font-bold">✓</span> Advanced analytics</li>
                <li className="flex items-center gap-2"><span className="check text-[#10b981] font-bold">✓</span> Document management</li>
                <li className="flex items-center gap-2"><span className="check text-[#10b981] font-bold">✓</span> Priority support</li>
                <li className="flex items-center gap-2"><span className="check text-[#10b981] font-bold">✓</span> AI Resume Review</li>
                <li className="flex items-center gap-2"><span className="check text-[#10b981] font-bold">✓</span> AI Cover Letter Generator</li>
                <li className="flex items-center gap-2"><span className="check text-[#10b981] font-bold">✓</span> Mock Interview Simulator</li>
              </ul>
              <a href="/register" className="pricing-cta w-full bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white py-3 rounded-full font-semibold shadow transition-all duration-300 hover:-translate-y-1 hover:shadow-xl block">Start Pro Trial</a>
            </div>
            {/* Enterprise */}
            <div className="pricing-card bg-white p-10 rounded-2xl text-center shadow-[0_10px_40px_rgba(0,0,0,0.08)] transition-all duration-300">
              <h3 className="text-xl font-bold mb-2">Enterprise</h3>
              <div className="price text-4xl font-extrabold bg-gradient-to-r from-[#667eea] to-[#764ba2] bg-clip-text text-transparent mb-2">$99<span className="text-base text-[#666] font-normal">/month</span></div>
              <p className="text-[#666] mb-6">For teams and organizations</p>
              <ul className="pricing-features text-[#666] mb-8 space-y-2 text-left">
                <li className="flex items-center gap-2"><span className="check text-[#10b981] font-bold">✓</span> Everything in Pro</li>
                <li className="flex items-center gap-2"><span className="check text-[#10b981] font-bold">✓</span> Team management</li>
                <li className="flex items-center gap-2"><span className="check text-[#10b981] font-bold">✓</span> Bulk operations</li>
                <li className="flex items-center gap-2"><span className="check text-[#10b981] font-bold">✓</span> API access</li>
                <li className="flex items-center gap-2"><span className="check text-[#10b981] font-bold">✓</span> Custom integrations</li>
                <li className="flex items-center gap-2"><span className="check text-[#10b981] font-bold">✓</span> Dedicated support</li>
                <li className="flex items-center gap-2"><span className="check text-[#10b981] font-bold">✓</span> Analytics dashboard</li>
              </ul>
              <a href="/register" className="pricing-cta w-full bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white py-3 rounded-full font-semibold shadow transition-all duration-300 hover:-translate-y-1 hover:shadow-xl block">Contact Sales</a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1a202c] text-white text-center py-16 mt-24">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="footer-content grid md:grid-cols-3 gap-12 mb-8">
            <div className="footer-section">
              <h4 className="text-[#667eea] font-bold mb-3">Product</h4>
              <ul className="space-y-2 text-[#a0aec0]">
                <li><a href="#features" className="hover:text-[#667eea]">Features</a></li>
                <li><a href="#pricing" className="hover:text-[#667eea]">Pricing</a></li>
                <li><a href="#demo" className="hover:text-[#667eea]">Demo</a></li>
                <li><a href="#api" className="hover:text-[#667eea]">API</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4 className="text-[#667eea] font-bold mb-3">Company</h4>
              <ul className="space-y-2 text-[#a0aec0]">
                <li><a href="#about" className="hover:text-[#667eea]">About Us</a></li>
                <li><a href="#careers" className="hover:text-[#667eea]">Careers</a></li>
                <li><a href="#blog" className="hover:text-[#667eea]">Blog</a></li>
                <li><a href="#press" className="hover:text-[#667eea]">Press</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4 className="text-[#667eea] font-bold mb-3">Support</h4>
              <ul className="space-y-2 text-[#a0aec0]">
                <li><a href="#help" className="hover:text-[#667eea]">Help Center</a></li>
                <li><a href="#contact" className="hover:text-[#667eea]">Contact Us</a></li>
                <li><a href="#status" className="hover:text-[#667eea]">Status</a></li>
                <li><a href="#privacy" className="hover:text-[#667eea]">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          <p className="text-center text-[#a0aec0] mt-8">
            &copy; 2025 CareerPilot. All rights reserved. Made with <span className="text-red-400">❤️</span> for job seekers worldwide.
          </p>
        </div>
      </footer>
    </div>
  );
}