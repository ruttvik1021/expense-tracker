import { Brand, Navlink } from "@/components/common/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, BarChart3, PieChart, TrendingUp } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const LandingPage = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900">
      <header className="px-4 lg:px-6 h-14 flex items-center justify-between bg-white/80 backdrop-blur-md dark:bg-gray-800/80">
        <Link className="flex items-center justify-center" href="/">
          <Brand />
          <span className="ml-2 text-lg font-bold text-selected dark:text-purple-400">
            ExpenseTracker
          </span>
        </Link>
      </header>
      <main className="flex-1">
        <section className="py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container max-w-[1920px] px-4 md:px-6 xl:px-20">
            <div className="flex flex-col items-center space-y-6 xl:space-y-8 text-center">
              <div className="space-y-4">
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl bg-clip-text text-transparent bg-gradient-to-r from-selected to-pink-600">
                  Master Your Finances with Vibrant Clarity
                </h1>
                <p className="mx-auto max-w-[900px] text-gray-700 md:text-xl xl:text-2xl dark:text-gray-300">
                  Track expenses, set colorful budgets, and gain vivid insights
                  into your spending habits with our powerful and intuitive
                  expense tracking application.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Button className="w-full sm:w-auto bg-selected hover:bg-purple-700 text-white text-lg xl:text-xl px-8 py-4 xl:px-12 xl:py-6">
                  <Navlink
                    link={{ href: "/login", label: "Get Started" }}
                    className="text-white"
                  />
                </Button>
              </div>
            </div>
          </div>
        </section>
        <section
          id="features"
          className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-white dark:bg-gray-800"
        >
          <div className="container max-w-[1920px] px-4 md:px-6 xl:px-20">
            <h2 className="text-4xl font-bold tracking-tighter sm:text-5xl text-center mb-12 text-selected dark:text-purple-400">
              Vibrant Features
            </h2>
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
              <Card className="bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 border-none">
                <CardContent className="flex flex-col items-center space-y-6 p-8 xl:space-y-8">
                  <BarChart3 className="h-14 w-14 text-selected dark:text-purple-400" />
                  <h3 className="text-xl font-bold text-purple-700 dark:text-purple-300 xl:text-2xl">
                    Colorful Expense Tracking
                  </h3>
                  <p className="text-center text-gray-600 dark:text-gray-300 xl:text-lg">
                    Log and categorize your expenses with a vibrant,
                    user-friendly interface.
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-pink-100 to-orange-100 dark:from-pink-900 dark:to-orange-900 border-none">
                <CardContent className="flex flex-col items-center space-y-6 p-8 xl:space-y-8">
                  <PieChart className="h-14 w-14 text-pink-600 dark:text-pink-400" />
                  <h3 className="text-xl font-bold text-pink-700 dark:text-pink-300 xl:text-2xl">
                    Vivid Budget Management
                  </h3>
                  <p className="text-center text-gray-600 dark:text-gray-300 xl:text-lg">
                    Set and track budgets with eye-catching visuals to keep your
                    spending in check.
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-orange-100 to-yellow-100 dark:from-orange-900 dark:to-yellow-900 border-none">
                <CardContent className="flex flex-col items-center space-y-6 p-8 xl:space-y-8">
                  <TrendingUp className="h-14 w-14 text-orange-600 dark:text-orange-400" />
                  <h3 className="text-xl font-bold text-orange-700 dark:text-orange-300 xl:text-2xl">
                    Insightful Analytics
                  </h3>
                  <p className="text-center text-gray-600 dark:text-gray-300 xl:text-lg">
                    Gain deep insights into your spending patterns with
                    beautiful, interactive charts.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-b from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900">
          <div className="container max-w-[1920px] px-4 md:px-6 xl:px-20">
            <div className="grid gap-10 lg:grid-cols-2">
              <div className="flex flex-col justify-center space-y-6 xl:space-y-8">
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tighter lg:text-5xl xl:text-6xl text-purple-700 dark:text-purple-300">
                  Visualize Your Spending in Vivid Detail
                </h2>
                <p className="max-w-[800px] text-gray-700 text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl dark:text-gray-300">
                  Our intuitive dashboard provides clear, colorful insights into
                  your financial habits. View your top spending categories with
                  vibrant charts, track your progress against budgets with
                  eye-catching graphics, and identify areas for improvement with
                  ease.
                </p>
              </div>
              <div className="flex items-center justify-center mt-8 lg:mt-0">
                <Image
                  width={400}
                  height={400}
                  src={"/dashboard.jpg"}
                  alt={"Dashboard Preview"}
                  className="w-full max-w-xl mx-auto rounded-xl object-cover object-center shadow-2xl"
                />
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-white dark:bg-gray-800">
          <div className="container max-w-[1920px] px-4 md:px-6 xl:px-20">
            <div className="flex flex-col items-center justify-center space-y-6 xl:space-y-8 text-center">
              <div className="space-y-4">
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tighter lg:text-5xl xl:text-6xl text-selected dark:text-purple-400">
                  Start Managing Your Finances in Living Color
                </h2>
                <p className="mx-auto max-w-[800px] text-gray-700 text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl dark:text-gray-300">
                  Join thousands of users who have taken control of their
                  financial future with our vibrant expense tracking app.
                  Experience the difference that clear, colorful insights can
                  make in your financial life.
                </p>
              </div>
              <div className="w-full max-w-sm space-y-4 xl:max-w-lg">
                <Button className="w-full bg-gradient-to-r from-selected to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 xl:px-12 xl:py-6">
                  <Navlink
                    link={{ href: "/login", label: "Get Started Now" }}
                    className="text-white"
                  />
                  <ArrowRight className="ml-2 h-5 w-5 xl:h-6 xl:w-6" />
                </Button>
              </div>
            </div>
          </div>
        </section>
        <section
          id="features"
          className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-b from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900"
        >
          <div className="container max-w-[1920px] px-4 md:px-6 xl:px-20">
            <h2 className="text-4xl font-bold tracking-tighter sm:text-5xl text-center text-selected dark:text-purple-400 mb-6">
              Install Our PWA for Seamless Access
            </h2>
            <p className="mx-auto max-w-[800px] text-gray-700 text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl dark:text-gray-300 mb-6">
              ExpenseTracker is a Progressive Web App (PWA), which means you can
              install it on your device for quick access and a native app-like
              experience. Follow these simple steps to install on your preferred
              device:
            </p>
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardContent className="flex flex-col items-center space-y-6 p-8 xl:space-y-8">
                  <h3 className="text-xl font-semibold text-purple-600 dark:text-purple-400">
                    On Desktop (Chrome, Edge, Firefox):
                  </h3>
                  <ol className="list-decimal list-inside space-y-1 text-gray-700 dark:text-gray-300">
                    <li>Open ExpenseTracker in your browser</li>
                    <li>Click the install icon in the address bar</li>
                    <li>Follow the prompts to install the app</li>
                  </ol>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex flex-col items-center space-y-6 p-8 xl:space-y-8">
                  <h3 className="text-xl font-semibold text-purple-600 dark:text-purple-400">
                    On iOS (Safari):
                  </h3>
                  <ol className="list-decimal list-inside space-y-1 text-gray-700 dark:text-gray-300">
                    <li>Open ExpenseTracker in Safari</li>
                    <li>Tap the Share button</li>
                    <li>Scroll down and tap "Add to Home Screen"</li>
                    <li>Tap "Add" to confirm</li>
                  </ol>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex flex-col items-center space-y-6 p-8 xl:space-y-8">
                  <h3 className="text-xl font-semibold text-purple-600 dark:text-purple-400">
                    On Android (Chrome):
                  </h3>
                  <ol className="list-decimal list-inside space-y-1 text-gray-700 dark:text-gray-300">
                    <li>Open ExpenseTracker in Chrome</li>
                    <li>Tap the menu icon (three dots)</li>
                    <li>Tap "Add to Home screen"</li>
                    <li>Follow the prompts to install</li>
                  </ol>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <footer className="w-full py-8 bg-gray-900 text-white">
        <div className="container max-w-[1920px] px-4 md:px-6 xl:px-20">
          <div className="flex justify-between items-center">
            <Link className="flex items-center justify-center" href="/">
              <Brand />
              <span className="ml-2 text-lg font-bold">ExpenseTracker</span>
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
