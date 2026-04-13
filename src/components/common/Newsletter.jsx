import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Send } from "lucide-react";
import toast from "react-hot-toast";
import API from "../../utils/api";

const Newsletter = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) {
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await API.post("/newsletter/subscribe", { email });

      toast.success(
        response?.message || "Subscribed successfully. You will get event updates by email."
      );

      setEmail("");
    } catch (error) {
      toast.error(typeof error === "string" ? error : "Failed to subscribe");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h3 className="section-title-md mb-4 text-gray-800">Stay Updated</h3>
      <p className="text-gray-600 text-sm mb-4">
        Subscribe to get updates on new volunteering opportunities.
      </p>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 w-4 h-4" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-[#4bbeff] focus:border-[#4bbeff] outline-none transition-all placeholder-gray-500"
            required
          />
        </div>
        <motion.button
          type="submit"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#4bbeff] hover:bg-[#3aa8e6] text-white rounded-lg font-medium text-sm transition-colors"
        >
          <Send className="w-4 h-4" />
          {isSubmitting ? "Subscribing..." : "Subscribe"}
        </motion.button>
      </form>
    </div>
  );
};

export default Newsletter;