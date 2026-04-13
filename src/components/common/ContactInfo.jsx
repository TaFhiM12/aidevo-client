import React from "react";
import { Mail, Phone, MapPin, Clock } from "lucide-react";

const ContactInfo = () => {
  const contactItems = [
    {
      icon: Mail,
      text: "contact@aidevo.org",
      href: "mailto:contact@aidevo.org"
    },
    {
      icon: Phone,
      text: "+1 (555) 123-4567",
      href: "tel:+15551234567"
    },
    {
      icon: MapPin,
      text: "University Campus",
      href: "#"
    },
    {
      icon: Clock,
      text: "Mon - Fri: 9AM - 6PM",
      href: "#"
    }
  ];

  return (
    <div className="space-y-3">
      {contactItems.map((item) => (
        <a
          key={item.text}
          href={item.href}
          className="flex items-center gap-3 text-gray-600 hover:text-[#4bbeff] transition-colors duration-200 group"
        >
          <div className="p-1.5 bg-gray-100 rounded-lg group-hover:bg-[#4bbeff] transition-colors">
            <item.icon className="w-3 h-3" />
          </div>
          <span className="text-sm">{item.text}</span>
        </a>
      ))}
    </div>
  );
};

export default ContactInfo;