import React, { useState, useCallback } from 'react';
import { Button } from "./components/ui/button";

// Import your real components
import Menu from "./components/Menu";
import Orders from "./components/Orders";
import Inventory from "./components/Inventory";
import Reports from "./components/Reports";

// =================================================================
// MAIN APPLICATION COMPONENT
// =================================================================

const TABS = [
  { name: 'Menu', view: 'menu' },
  { name: 'Orders', view: 'orders' },
  { name: 'Reports', view: 'reports' },
  // { name: 'Inventory', view: 'inventory' },
];

function App() {
  const [view, setView] = useState('menu');

  const renderContent = useCallback(() => {
    switch (view) {
      case 'menu':
        return <Menu />;
      case 'orders':
        return <Orders />;
      case 'reports':
        return <Reports />;
      case 'inventory':
        return <Inventory />;
      default:
        return <Menu />;
    }
  }, [view]);

  return (
    <div className="min-h-screen min-w-screen bg-gray-50 font-sans">
      {/* Header */}
      <header className="p-6 bg-white border-b border-gray-100 shadow-lg text-center">
        <h1 className="text-4xl font-extrabold text-blue-700 tracking-tight">
          The Dutch Uncle Pizzeria
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Pop-up POS System - Quick & Simple Point of Sale Management
        </p>
      </header>

      {/* Navigation Bar */}
      <nav className="bg-white border-b border-gray-200 shadow-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-2 py-2 overflow-x-auto justify-center">
          {TABS.map((tab) => (
            <Button
              key={tab.view}
              onClick={() => setView(tab.view)}
              variant={view === tab.view ? "default" : "ghost"}
              className="transition-all duration-300 min-w-[100px] text-base text-white"
            >
              {tab.name}
            </Button>
          ))}
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="p-4 md:p-6 lg:p-8 space-y-6">
        {renderContent()}
      </main>
    </div>
  );
}

export default App;
