import { FaRocket, FaTasks, FaFileAlt, FaMicrophone, FaCheck } from "react-icons/fa"

export default function Home() {
  return (
    <div className="font-sans bg-gradient-to-br from-slate-50 via-cyan-50 to-blue-50 min-h-screen text-slate-800">
      {/* Header */}
      <header className="fixed w-full z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200/50">
        <nav className="container mx-auto flex justify-between items-center py-4 px-4 max-w-6xl">
          <div className="flex items-center gap-3 font-extrabold text-2xl">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7DD5DB] to-[#3B6597] flex items-center justify-center">
              <FaRocket className="text-white text-lg" />
            </div>
            <span className="bg-gradient-to-r from-[#3B6597] to-[#7DD5DB] bg-clip-text text-transparent">
              CareerPilot
            </span>
          </div>
          <ul className="hidden md:flex gap-8 text-slate-600 font-medium">
            <li>
              <a
                href="#features"
                className="hover:text-[#3B6597] transition-all hover:-translate-y-0.5 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-[#7DD5DB] after:transition-all hover:after:w-full"
              >
                Features
              </a>
            </li>
            <li>
              <a
                href="#pricing"
                className="hover:text-[#3B6597] transition-all hover:-translate-y-0.5 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-[#7DD5DB] after:transition-all hover:after:w-full"
              >
                Pricing
              </a>
            </li>
            <li>
              <a
                href="#about"
                className="hover:text-[#3B6597] transition-all hover:-translate-y-0.5 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-[#7DD5DB] after:transition-all hover:after:w-full"
              >
                About
              </a>
            </li>
            <li>
              <a
                href="#contact"
                className="hover:text-[#3B6597] transition-all hover:-translate-y-0.5 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-[#7DD5DB] after:transition-all hover:after:w-full"
              >
                Contact
              </a>
            </li>
          </ul>
          <a
            href="/register"
            className="bg-gradient-to-r from-[#7DD5DB] to-[#3B6597] text-white px-8 py-3 rounded-full font-semibold shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl relative overflow-hidden group"
          >
            <span className="relative z-10">Get Started Free</span>
            <div className="absolute inset-0 bg-gradient-to-r from-[#3B6597] to-[#7DD5DB] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </a>
        </nav>
      </header>

      {/* Hero */}
      <section className="hero relative text-center pt-40 pb-24 overflow-hidden" id="hero">
        <div className="absolute inset-0 bg-gradient-to-br from-[#7DD5DB]/10 via-transparent to-[#3B6597]/10"></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#7DD5DB]/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#3B6597]/20 rounded-full blur-3xl"></div>
        <div className="relative z-10 container mx-auto px-4 max-w-4xl">
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full border border-slate-200 mb-8">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-slate-600">AI-Powered Career Assistant</span>
          </div>
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black mb-8 leading-tight">
            <span className="bg-gradient-to-r from-[#3B6597] via-[#7DD5DB] to-[#3B6597] bg-clip-text text-transparent">
              Transform Your
            </span>
            <br />
            <span className="text-slate-800">Job Search Journey</span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-600 mb-12 max-w-2xl mx-auto leading-relaxed">
            Track applications, optimize your resume with AI, and land your dream job faster with
            <span className="font-semibold text-[#3B6597]"> CareerPilot</span> - your intelligent career companion.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="/register"
              className="inline-flex items-center gap-3 bg-gradient-to-r from-[#7DD5DB] to-[#3B6597] text-white px-10 py-5 rounded-full font-bold text-lg shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:shadow-3xl group"
            >
              <FaRocket className="text-white group-hover:rotate-12 transition-transform" />
              Get Started Free
            </a>
            <a
              href="#features"
              className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm text-[#3B6597] px-10 py-5 rounded-full font-bold text-lg border border-slate-200 hover:bg-white hover:shadow-lg transition-all duration-300"
            >
              Learn More
            </a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features bg-white py-32" id="features">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black text-slate-800 mb-6">
              Everything You Need to
              <span className="bg-gradient-to-r from-[#7DD5DB] to-[#3B6597] bg-clip-text text-transparent">
                {" "}
                Land Your Dream Job
              </span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Streamline your job search with our comprehensive suite of AI-powered tools designed to give you the
              competitive edge.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3 mt-16">
            <div className="group relative bg-gradient-to-br from-white to-slate-50 p-10 rounded-3xl shadow-lg border border-slate-100 transition-all duration-500 hover:-translate-y-4 hover:shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-[#7DD5DB]/5 to-[#3B6597]/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative">
                <div className="w-20 h-20 mx-auto mb-8 flex items-center justify-center rounded-2xl bg-gradient-to-br from-[#7DD5DB] to-[#3B6597] text-white text-3xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <FaTasks />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-slate-800">Smart Job Tracker</h3>
                <p className="text-slate-600 leading-relaxed">
                  Organize your applications with our intuitive Kanban board. Track progress from saved jobs to offers,
                  never miss a deadline, and stay on top of every opportunity.
                </p>
              </div>
            </div>
            <div className="group relative bg-gradient-to-br from-white to-slate-50 p-10 rounded-3xl shadow-lg border border-slate-100 transition-all duration-500 hover:-translate-y-4 hover:shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-[#7DD5DB]/5 to-[#3B6597]/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative">
                <div className="w-20 h-20 mx-auto mb-8 flex items-center justify-center rounded-2xl bg-gradient-to-br from-[#7DD5DB] to-[#3B6597] text-white text-3xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <FaFileAlt />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-slate-800">AI Resume Review</h3>
                <p className="text-slate-600 leading-relaxed">
                  Get instant feedback on your resume with our AI-powered analyzer. Optimize for specific job
                  descriptions and increase your chances of getting noticed by recruiters.
                </p>
              </div>
            </div>
            <div className="group relative bg-gradient-to-br from-white to-slate-50 p-10 rounded-3xl shadow-lg border border-slate-100 transition-all duration-500 hover:-translate-y-4 hover:shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-[#7DD5DB]/5 to-[#3B6597]/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative">
                <div className="w-20 h-20 mx-auto mb-8 flex items-center justify-center rounded-2xl bg-gradient-to-br from-[#7DD5DB] to-[#3B6597] text-white text-3xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <FaMicrophone />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-slate-800">Mock Interview Simulator</h3>
                <p className="text-slate-600 leading-relaxed">
                  Practice with our AI interviewer that adapts to your target role. Get real-time feedback on your
                  answers and build confidence before the real interview.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="pricing bg-gradient-to-br from-slate-50 to-cyan-50 py-32" id="pricing">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black text-slate-800 mb-6">Choose Your Plan</h2>
            <p className="text-xl text-slate-600">Start free, upgrade when you're ready to accelerate your career</p>
          </div>
          <div className="grid gap-8 md:grid-cols-3 mt-16">
            {/* Basic */}
            <div className="bg-white p-10 rounded-3xl shadow-lg border border-slate-200 transition-all duration-300 hover:shadow-xl">
              <h3 className="text-2xl font-bold mb-4 text-slate-800">Basic</h3>
              <div className="mb-2">
                <span className="text-5xl font-black text-slate-800">Free</span>
              </div>
              <p className="text-slate-600 mb-8">Perfect for getting started</p>
              <ul className="space-y-4 mb-10">
                <li className="flex items-center gap-3">
                  <FaCheck className="text-green-500 flex-shrink-0" /> Track up to 20 jobs
                </li>
                <li className="flex items-center gap-3">
                  <FaCheck className="text-green-500 flex-shrink-0" /> Basic dashboard
                </li>
                <li className="flex items-center gap-3">
                  <FaCheck className="text-green-500 flex-shrink-0" /> Document upload
                </li>
                <li className="flex items-center gap-3">
                  <FaCheck className="text-green-500 flex-shrink-0" /> Job insights
                </li>
                <li className="flex items-center gap-3 opacity-40">
                  <span className="w-4 h-4 flex-shrink-0">✗</span> AI Resume Review
                </li>
                <li className="flex items-center gap-3 opacity-40">
                  <span className="w-4 h-4 flex-shrink-0">✗</span> AI Cover Letter
                </li>
                <li className="flex items-center gap-3 opacity-40">
                  <span className="w-4 h-4 flex-shrink-0">✗</span> Mock Interview
                </li>
              </ul>
              <a
                href="/register"
                className="w-full bg-gradient-to-r from-slate-600 to-slate-700 text-white py-4 rounded-full font-bold text-center block transition-all duration-300 hover:from-slate-700 hover:to-slate-800 hover:-translate-y-1 hover:shadow-lg"
              >
                Get Started Free
              </a>
            </div>

            {/* Pro */}
            <div className="bg-white p-10 rounded-3xl shadow-2xl border-4 border-[#7DD5DB] scale-105 relative transition-all duration-300 hover:shadow-3xl">
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#7DD5DB] to-[#3B6597] text-white px-8 py-2 rounded-full font-bold text-sm shadow-lg">
                Most Popular
              </div>
              <h3 className="text-2xl font-bold mb-4 text-slate-800">Pro</h3>
              <div className="mb-2">
                <span className="text-5xl font-black bg-gradient-to-r from-[#7DD5DB] to-[#3B6597] bg-clip-text text-transparent">
                  $19
                </span>
                <span className="text-lg text-slate-600 font-normal">/month</span>
              </div>
              <p className="text-slate-600 mb-8">For serious job seekers</p>
              <ul className="space-y-4 mb-10">
                <li className="flex items-center gap-3">
                  <FaCheck className="text-green-500 flex-shrink-0" /> Unlimited job tracking
                </li>
                <li className="flex items-center gap-3">
                  <FaCheck className="text-green-500 flex-shrink-0" /> Advanced analytics
                </li>
                <li className="flex items-center gap-3">
                  <FaCheck className="text-green-500 flex-shrink-0" /> Document management
                </li>
                <li className="flex items-center gap-3">
                  <FaCheck className="text-green-500 flex-shrink-0" /> Priority support
                </li>
                <li className="flex items-center gap-3">
                  <FaCheck className="text-green-500 flex-shrink-0" /> AI Resume Review
                </li>
                <li className="flex items-center gap-3">
                  <FaCheck className="text-green-500 flex-shrink-0" /> AI Cover Letter Generator
                </li>
                <li className="flex items-center gap-3">
                  <FaCheck className="text-green-500 flex-shrink-0" /> Mock Interview Simulator
                </li>
              </ul>
              <a
                href="/register"
                className="w-full bg-gradient-to-r from-[#7DD5DB] to-[#3B6597] text-white py-4 rounded-full font-bold text-center block transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                Start Pro Trial
              </a>
            </div>

            {/* Enterprise */}
            <div className="bg-white p-10 rounded-3xl shadow-lg border border-slate-200 transition-all duration-300 hover:shadow-xl">
              <h3 className="text-2xl font-bold mb-4 text-slate-800">Enterprise</h3>
              <div className="mb-2">
                <span className="text-5xl font-black text-slate-800">$99</span>
                <span className="text-lg text-slate-600 font-normal">/month</span>
              </div>
              <p className="text-slate-600 mb-8">For teams and organizations</p>
              <ul className="space-y-4 mb-10">
                <li className="flex items-center gap-3">
                  <FaCheck className="text-green-500 flex-shrink-0" /> Everything in Pro
                </li>
                <li className="flex items-center gap-3">
                  <FaCheck className="text-green-500 flex-shrink-0" /> Team management
                </li>
                <li className="flex items-center gap-3">
                  <FaCheck className="text-green-500 flex-shrink-0" /> Bulk operations
                </li>
                <li className="flex items-center gap-3">
                  <FaCheck className="text-green-500 flex-shrink-0" /> API access
                </li>
                <li className="flex items-center gap-3">
                  <FaCheck className="text-green-500 flex-shrink-0" /> Custom integrations
                </li>
                <li className="flex items-center gap-3">
                  <FaCheck className="text-green-500 flex-shrink-0" /> Dedicated support
                </li>
                <li className="flex items-center gap-3">
                  <FaCheck className="text-green-500 flex-shrink-0" /> Analytics dashboard
                </li>
              </ul>
              <a
                href="/register"
                className="w-full bg-gradient-to-r from-slate-600 to-slate-700 text-white py-4 rounded-full font-bold text-center block transition-all duration-300 hover:from-slate-700 hover:to-slate-800 hover:-translate-y-1 hover:shadow-lg"
              >
                Contact Sales
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-20">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 font-extrabold text-2xl mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7DD5DB] to-[#3B6597] flex items-center justify-center">
                  <FaRocket className="text-white text-lg" />
                </div>
                <span className="bg-gradient-to-r from-[#7DD5DB] to-white bg-clip-text text-transparent">
                  CareerPilot
                </span>
              </div>
              <p className="text-slate-400 text-lg leading-relaxed max-w-md">
                Transform your job search with AI-powered tools designed to help you land your dream career faster and
                more efficiently.
              </p>
            </div>
            <div>
              <h4 className="text-[#7DD5DB] font-bold mb-6 text-lg">Product</h4>
              <ul className="space-y-3 text-slate-400">
                <li>
                  <a href="#features" className="hover:text-[#7DD5DB] transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="hover:text-[#7DD5DB] transition-colors">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#demo" className="hover:text-[#7DD5DB] transition-colors">
                    Demo
                  </a>
                </li>
                <li>
                  <a href="#api" className="hover:text-[#7DD5DB] transition-colors">
                    API
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-[#7DD5DB] font-bold mb-6 text-lg">Support</h4>
              <ul className="space-y-3 text-slate-400">
                <li>
                  <a href="#help" className="hover:text-[#7DD5DB] transition-colors">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#contact" className="hover:text-[#7DD5DB] transition-colors">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="#status" className="hover:text-[#7DD5DB] transition-colors">
                    Status
                  </a>
                </li>
                <li>
                  <a href="#privacy" className="hover:text-[#7DD5DB] transition-colors">
                    Privacy Policy
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8">
            <p className="text-center text-slate-400">
              &copy; 2025 CareerPilot. All rights reserved. Made with <span className="text-red-400">❤️</span> for job
              seekers worldwide.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
