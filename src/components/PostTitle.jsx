"use client";

import { motion } from "framer-motion";

export default function PostTitle({ date, title }) {
  return (
    <div className="select-none">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="py-4 flex flex-col gap-3"
      >
        <div className="flex flex-col gap-3 pt-4">
          <h1 className="text-3xl font-semibold tracking-tight leading-snug">
            {title}
          </h1>

          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 shrink-0" />
            <p className="text-xs text-muted-foreground whitespace-nowrap cursor-default">
              {date}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
