import React, { useEffect, useState } from "react";

function Footer() {
  const [serverTime, setServerTime] = useState(new Date());

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setServerTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <footer className="bg-white border-t shadow-inner py-8 text-center mt-auto border-white">
      <p className="text-sm text-gray-600">
        Server Date & Time:{" "}
        <span className="font-medium text-gray-800">
          {serverTime.toLocaleString()}
        </span>
      </p>
      <p className="text-xs text-gray-500 mt-1">
        © All Rights Reserved — The Dutch Uncle Pizzeria
      </p>
    </footer>
  );
}

export default Footer;
