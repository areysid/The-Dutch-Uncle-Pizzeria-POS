import React, { useState, useCallback } from "react";
import { Button } from "./components/ui/button";

// Import your real components
import Menu from "./components/Menu";
import Orders from "./components/Orders";
import Inventory from "./components/Inventory";
import Reports from "./components/Reports";
import Footer from "./components/Footer";

// =================================================================
// TABS CONFIG
// =================================================================
const TABS = [
  { name: "Menu", view: "menu" },
  { name: "Orders", view: "orders" },
  { name: "Reports", view: "reports" },
  // { name: "Inventory", view: "inventory" },
];

function App() {
  const [view, setView] = useState("menu");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const renderContent = useCallback(() => {
    switch (view) {
      case "menu":
        return <Menu />;
      case "orders":
        return <Orders />;
      case "reports":
        return <Reports />;
      case "inventory":
        return <Inventory />;
      default:
        return <Menu />;
    }
  }, [view]);

  const handleTabChange = (tabView) => {
    setView(tabView);
    setMobileMenuOpen(false); // close mobile menu on selection
  };

  return (
    <div className="min-h-screen w-full bg-gray-50 font-sans overflow-x-hidden">
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
      <nav className="bg-white border-b border-gray-200 shadow-md sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
          
          {/* Desktop Tabs */}
          <div className="hidden md:flex space-x-2 mx-auto">
            {TABS.map((tab) => (
              <Button
                key={tab.view}
                onClick={() => setView(tab.view)}
                variant={view === tab.view ? "default" : "ghost"}
                className="transition-all duration-300 min-w-[110px] text-base"
              >
                {tab.name}
              </Button>
            ))}
          </div>

          {/* Mobile Three Dots */}
          <div className="md:hidden relative ml-auto">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md hover:bg-gray-100 focus:outline-none"
            >
              <span className="text-2xl font-bold">⋮</span>
            </button>

            {/* Mobile Dropdown */}
            {mobileMenuOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                {TABS.map((tab) => (
                  <button
                    key={tab.view}
                    onClick={() => handleTabChange(tab.view)}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                      view === tab.view ? "font-semibold text-blue-600" : ""
                    }`}
                  >
                    {tab.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="p-4 md:p-6 lg:p-8 space-y-6">
        {renderContent()}
      </main>

      <Footer />
    </div>
  );
}

export default App;
