"use client";

import { motion } from "framer-motion";

export default function PostTitle({ date, title }) {
  return (
    <div className="select-none font-light">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="py-4 flex flex-col gap-4"
      >
        <motion.div
          whileHover={{
            x: 5,
            transition: {
              type: "spring",
              stiffness: 300,
              damping: 15
            }
          }}
          className="flex flex-col relative"
        >
          <h1 className="text-4xl font-light tracking-tight">
            {title}
          </h1>
        </motion.div>

        <p className="text-sm whitespace-nowrap cursor-default">
          {date}
        </p>
      </motion.div>
    </div>
  );
}
