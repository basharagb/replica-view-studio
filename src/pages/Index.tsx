import { LabInterface } from "../components/LabInterface";

const LiveTest = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header Section */}
      <header className="bg-white dark:bg-slate-800 shadow-sm border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              Live Readings
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-300">
              Real-time silo monitoring and temperature readings interface
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-full mx-auto px-2 sm:px-4 lg:px-6 py-6">
        <LabInterface />
      </main>
    </div>
  );
};

export default LiveTest;
