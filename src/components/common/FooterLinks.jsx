import React from "react";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";

const FooterLinks = ({ title, links }) => {
  return (
    <div>
      <h3 className="section-title-md mb-4 text-gray-800">{title}</h3>
      <nav className="space-y-3">
        {links.map((link, index) => (
          <motion.a
            key={link.label}
            href={link.href}
            className="flex items-center gap-2 text-gray-600 hover:text-[#4bbeff] transition-colors duration-200 text-sm group"
            whileHover={{ x: 5 }}
            transition={{ delay: index * 0.1 }}
          >
            <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            <span>{link.label}</span>
          </motion.a>
        ))}
      </nav>
    </div>
  );
};

export default FooterLinks;