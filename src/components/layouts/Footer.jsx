import React from "react";
import FooterLinks from "../common/FooterLinks";
import Logo from "../common/Logo";
import Newsletter from "../common/Newsletter";
import SocialLinks from "../common/SocialLinks";
import ContactInfo from "../common/ContactInfo";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="  pt-12 pb-8 px-4">
      <div className="container mx-auto">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <div className="mb-4">
              <Logo />
            </div>
            <p className="text-gray-600 text-sm leading-relaxed mb-6">
              Discover organizations, join events, chat in real time, and use emergency blood support from one platform.
            </p>
            <ContactInfo />
          </div>

          {/* Quick Links */}
          <FooterLinks
            title="Quick Links"
            links={[
              { label: 'Home', href: '/' },
              { label: 'About', href: '/about' },
              { label: 'Events', href: '/events' },
              { label: 'Organizations', href: '/organization' },
              { label: 'Blood Bank', href: '/blood-bank' },
            ]}
          />

          {/* Support Links */}
          <FooterLinks 
            title="Account"
            links={[
              { label: 'Sign In', href: '/signin' },
              { label: 'Create Account', href: '/signup' },
              { label: 'Dashboard', href: '/dashboard' },
              { label: 'Student Chat', href: '/dashboard/my-chat' },
              { label: 'Organization Chat', href: '/dashboard/org-chat' },
            ]}
          />

          {/* Newsletter */}
          <Newsletter />
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 my-8"></div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Copyright */}
          <p className="text-gray-500 text-sm text-center md:text-left">
            © {currentYear} Aidevo. All rights reserved. Made with ❤️ for better communities.
          </p>

          {/* Social Links */}
          <SocialLinks />
        </div>
      </div>
    </footer>
  );
};

export default Footer;