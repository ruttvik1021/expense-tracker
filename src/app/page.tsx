import { BarChart3, PieChart, TrendingUp } from "lucide-react";
import Link from "next/link";

const LandingPage = () => {
  return (
    <div className="bg-gray-900 text-white font-sans">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-gray-800 px-10 py-2">
        <div className="flex items-center gap-3">
          <h2 className="text-3xl font-bold tracking-tight text-blue-700">
            AkiraFlow
          </h2>
        </div>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link href="#features" className="text-gray-300 hover:text-white">
            Features
          </Link>
          <Link href="#pwa" className="text-gray-300 hover:text-white">
            Install
          </Link>
        </nav>
        <div className="flex gap-2">
          <Link
            href="/login"
            className="bg-blue-700 hover:bg-blue-700 text-white font-bold text-sm px-4 py-2 rounded-md"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section
        className="relative flex min-h-[600px] items-center justify-center bg-cover bg-center py-20 px-6"
        style={{
          backgroundImage:
            "linear-gradient(rgba(17, 20, 24, 0.8), rgba(17, 20, 24, 1))",
        }}
      >
        <div className="max-w-3xl text-center">
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight">
            Master Your Finances in{" "}
            <span className="text-blue-700">Living Color</span>
          </h1>
          <p className="mt-6 text-lg text-gray-300">
            Track expenses, set colorful budgets, and gain vivid insights into
            your spending habits with our powerful and intuitive app.
          </p>
          <div className="mt-10 flex justify-center gap-4 flex-wrap">
            <Link
              href="/login"
              className="bg-blue-700 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-md text-base"
            >
              Get Started Free
            </Link>
            <Link
              href="#features"
              className="bg-gray-800 hover:bg-gray-700 text-white font-bold px-6 py-3 rounded-md text-base"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-extrabold mb-4">
            Vibrant Features
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-12">
            Explore the powerful tools that make ExpenseTracker stand out.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Colorful Expense Tracking",
                desc: "Log and categorize your expenses with a vibrant, user-friendly interface.",
                icon: (
                  <BarChart3 className="h-14 w-14 text-selected dark:text-purple-400" />
                ),
              },
              {
                title: "Vivid Budget Management",
                desc: "Set and track budgets with eye-catching visuals to keep your spending in check.",
                icon: (
                  <PieChart className="h-14 w-14 text-selected dark:text-purple-400" />
                ),
              },
              {
                title: "Insightful Analytics",
                desc: "Gain deep insights into your spending patterns with interactive charts.",
                icon: (
                  <TrendingUp className="h-14 w-14 text-selected dark:text-purple-400" />
                ),
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="p-6 bg-gray-800/50 border border-gray-800 rounded-lg hover:-translate-y-2 transition-transform"
              >
                <div className="flex justify-center mb-4">
                  <span className="material-symbols-outlined text-4xl text-blue-700">
                    {feature.icon}
                  </span>
                </div>
                <h3 className="text-xl font-bold">{feature.title}</h3>
                <p className="text-gray-400 mt-2">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PWA Section */}
      <section id="pwa" className="bg-gray-800/50 py-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-extrabold mb-6">
            Install Our PWA
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-10">
            Install ExpenseTracker as a Progressive Web App for a faster,
            app-like experience.
          </p>
          <div className="grid md:grid-cols-3 gap-8 text-left">
            {[
              {
                title: "On Desktop",
                steps: [
                  "Open ExpenseTracker in Chrome, Edge, or Firefox",
                  "Click the install icon in the address bar",
                  "Follow prompts to install the app",
                ],
              },
              {
                title: "On iOS (Safari)",
                steps: [
                  "Open ExpenseTracker in Safari",
                  "Tap the Share button",
                  'Tap "Add to Home Screen"',
                  'Tap "Add" to confirm',
                ],
              },
              {
                title: "On Android (Chrome)",
                steps: [
                  "Open ExpenseTracker in Chrome",
                  "Tap the menu icon (three dots)",
                  'Tap "Add to Home Screen"',
                  "Follow prompts to install",
                ],
              },
            ].map((platform) => (
              <div
                key={platform.title}
                className="bg-gray-900 border border-gray-700 rounded-lg p-6"
              >
                <h3 className="text-lg font-semibold text-blue-400 mb-4">
                  {platform.title}
                </h3>
                <ol className="list-decimal list-inside text-gray-300 space-y-1">
                  {platform.steps.map((step, idx) => (
                    <li key={idx}>{step}</li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-gray-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-extrabold mb-4">
            Take Control of Your Finances
          </h2>
          <p className="text-gray-400 text-lg mb-8">
            Join thousands of users who are mastering their budgets with clarity
            and color.
          </p>
          <Link
            href="/login"
            className="bg-gradient-to-r from-blue-600 to-purple-500 hover:from-blue-700 hover:to-purple-600 px-8 py-4 text-white font-bold rounded-md text-lg"
          >
            Get Started Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <Link href="/" className="flex items-center gap-2 text-white">
            <h2 className="text-3xl font-bold tracking-tight text-blue-700">
              AkiraFlow
            </h2>
          </Link>
          <div className="flex gap-4 text-sm text-gray-400">
            <Link href="#">Privacy Policy</Link>
            <Link href="#">Terms of Service</Link>
            <Link href="#">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
