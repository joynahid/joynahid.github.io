"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

const CodingLanguagesMotion = () => {
  const languages = [
    "Python",
    "JavaScript",
    "TypeScript",
    "React",
    "Node.js",
    "SQL",
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % languages.length);
    }, 2000); // Change language every 3 seconds

    return () => clearInterval(interval);
  }, [languages.length]);

  return (
    <div className="flex text-xl">
      <span className="mr-2">I Know</span>
      <AnimatePresence mode="wait">
        <motion.span
          key={languages[currentIndex]}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          transition={{
            y: { type: "spring", stiffness: 100, damping: 15 },
            opacity: { duration: 0.1 }
          }}
          className="text-primary font-bold"
        >
          {languages[currentIndex]}
        </motion.span>
      </AnimatePresence>
    </div>
  );
};

export default CodingLanguagesMotion;
