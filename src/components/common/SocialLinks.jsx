import React from "react";
import { motion } from "framer-motion";
import { Twitter, Youtube, Facebook, Instagram, Linkedin, Github } from "lucide-react";

const SocialLinks = () => {
  const socialPlatforms = [
    {
      icon: Twitter,
      href: "#",
      label: "Twitter",
      color: "hover:text-blue-400"
    },
    {
      icon: Facebook,
      href: "#",
      label: "Facebook",
      color: "hover:text-blue-600"
    },
    {
      icon: Instagram,
      href: "#",
      label: "Instagram",
      color: "hover:text-pink-500"
    },
    {
      icon: Linkedin,
      href: "#",
      label: "LinkedIn",
      color: "hover:text-blue-500"
    },
    {
      icon: Youtube,
      href: "#",
      label: "YouTube",
      color: "hover:text-red-500"
    },
    {
      icon: Github,
      href: "#",
      label: "GitHub",
      color: "hover:text-gray-300"
    }
  ];

  return (
    <div className="flex gap-3">
      {socialPlatforms.map((platform, index) => (
        <motion.a
          key={platform.label}
          href={platform.href}
          className={`p-2  rounded-lg text-gray-700 ${platform.color} transition-all duration-200 hover:bg-gray-700`}
          whileHover={{ scale: 1.1, y: -2 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          aria-label={platform.label}
        >
          <platform.icon className="w-4 h-4" />
        </motion.a>
      ))}
    </div>
  );
};

export default SocialLinks;