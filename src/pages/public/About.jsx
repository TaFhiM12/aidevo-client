import React from 'react';
import { 
    Target, Heart, Zap, Shield, Users, Calendar, MessageCircle, 
    Award, TrendingUp, CheckCircle, Sparkles, Globe, Lock, 
    Rocket, Clock, BarChart, Code, Lightbulb, Trophy
} from 'lucide-react';

const About = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
            {/* Hero Section */}
            <section className="relative pt-24 pb-16 overflow-hidden">
                <div className="absolute inset-0">
                    <div className="absolute top-20 right-20 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
                    <div className="absolute bottom-20 left-20 w-96 h-96 bg-cyan-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
                </div>
                
                <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg border border-blue-100 mb-6">
                        <Sparkles className="w-4 h-4 text-blue-500" />
                        <span className="text-sm font-medium text-gray-700">About Aidevo</span>
                    </div>
                    <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6">
                        Empowering Campus
                        <span className="block mt-2 bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
                            Communities
                        </span>
                    </h1>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                        Aidevo is the all-in-one platform designed to revolutionize how student organizations connect, collaborate, and thrive on campus.
                    </p>
                </div>
            </section>

            {/* Mission & Vision */}
            <section className="py-16 bg-white">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-2 gap-8">
                        <MissionCard
                            icon={<Target className="w-8 h-8" />}
                            title="Our Mission"
                            description="To simplify and enhance the organizational experience for student clubs, making collaboration effortless and community building meaningful. We believe every organization deserves powerful tools to manage their activities and engage their members."
                            gradient="from-blue-500 to-blue-600"
                        />
                        <MissionCard
                            icon={<Heart className="w-8 h-8" />}
                            title="Our Vision"
                            description="To become the leading campus organization platform globally, fostering vibrant student communities through technology. We envision campuses where every club has the tools to create impact and every student finds their community."
                            gradient="from-cyan-500 to-cyan-600"
                        />
                    </div>
                </div>
            </section>

            {/* What is Aidevo */}
            <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">What is Aidevo?</h2>
                        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                            Aidevo is a comprehensive web platform built specifically for university organizations, clubs, and societies to manage their operations seamlessly.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <InfoCard
                            icon={<Users className="w-6 h-6" />}
                            title="For Organizations"
                            description="Create your club page, manage members, handle applications, and showcase your activities to the entire campus community."
                            color="blue"
                        />
                        <InfoCard
                            icon={<Calendar className="w-6 h-6" />}
                            title="Event Management"
                            description="Plan, promote, and track events with RSVP systems, capacity management, and real-time attendance tracking."
                            color="cyan"
                        />
                        <InfoCard
                            icon={<MessageCircle className="w-6 h-6" />}
                            title="Communication Hub"
                            description="Built-in messenger, announcements board, and notification system to keep everyone connected and informed."
                            color="blue"
                        />
                    </div>
                </div>
            </section>

            {/* Key Features */}
            <section className="py-20 bg-white">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">Platform Features</h2>
                        <p className="text-lg text-gray-600">
                            Everything you need to run a successful student organization
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <FeatureItem icon={<Shield />} text="Role-based access control (Owner, Officer, Member)" />
                        <FeatureItem icon={<Users />} text="Application & member onboarding system" />
                        <FeatureItem icon={<Calendar />} text="Event creation with RSVP tracking" />
                        <FeatureItem icon={<MessageCircle />} text="Real-time group chat & messaging" />
                        <FeatureItem icon={<Award />} text="Public organization pages with branding" />
                        <FeatureItem icon={<TrendingUp />} text="Analytics dashboard for officers" />
                        <FeatureItem icon={<Globe />} text="Searchable directory of all campus orgs" />
                        <FeatureItem icon={<Lock />} text="Secure authentication & data protection" />
                        <FeatureItem icon={<Rocket />} text="Quick setup - launch in minutes" />
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-20 bg-gradient-to-br from-blue-50 to-cyan-50">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
                        <p className="text-lg text-gray-600">
                            Get started in three simple steps
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <StepCard
                            number="01"
                            title="Create Your Org"
                            description="Sign up and set up your organization page with description, cover image, tags, and team members."
                        />
                        <StepCard
                            number="02"
                            title="Invite Members"
                            description="Share your org page link. Students can apply to join, and officers can review and accept applications."
                        />
                        <StepCard
                            number="03"
                            title="Engage & Grow"
                            description="Create events, send announcements, chat with members, and track your organization's growth and impact."
                        />
                    </div>
                </div>
            </section>

            {/* Who We Serve */}
            <section className="py-20 bg-white">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">Who We Serve</h2>
                        <p className="text-lg text-gray-600">
                            Built for diverse campus communities
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <AudienceCard
                            icon={<Trophy className="w-8 h-8" />}
                            title="Student Clubs"
                            items={["Sports clubs", "Cultural societies", "Hobby groups"]}
                        />
                        <AudienceCard
                            icon={<Lightbulb className="w-8 h-8" />}
                            title="Academic Orgs"
                            items={["Departments", "Research groups", "Study circles"]}
                        />
                        <AudienceCard
                            icon={<Code className="w-8 h-8" />}
                            title="Tech Communities"
                            items={["Coding clubs", "Innovation labs", "Hackathon teams"]}
                        />
                        <AudienceCard
                            icon={<Heart className="w-8 h-8" />}
                            title="Service Groups"
                            items={["Volunteer orgs", "Social initiatives", "NGO chapters"]}
                        />
                    </div>
                </div>
            </section>

            {/* Why Choose Aidevo */}
            <section className="py-20 bg-gradient-to-br from-slate-50 to-cyan-50">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose Aidevo?</h2>
                        <p className="text-lg text-gray-600">
                            What makes us different
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        <WhyCard
                            icon={<Zap className="w-6 h-6" />}
                            title="All-in-One Solution"
                            description="No need for multiple tools. Events, chat, member management, and analytics all in one place."
                        />
                        <WhyCard
                            icon={<Clock className="w-6 h-6" />}
                            title="Save Time"
                            description="Automate repetitive tasks like application reviews, event RSVPs, and member notifications."
                        />
                        <WhyCard
                            icon={<Users className="w-6 h-6" />}
                            title="Built for Students"
                            description="Designed with student needs in mind - intuitive, modern, and mobile-friendly interface."
                        />
                        <WhyCard
                            icon={<BarChart className="w-6 h-6" />}
                            title="Data-Driven Insights"
                            description="Track engagement, attendance, and growth with comprehensive analytics dashboards."
                        />
                    </div>
                </div>
            </section>

            {/* Technology Stack */}
            <section className="py-20 bg-white">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">Built with Modern Technology</h2>
                        <p className="text-lg text-gray-600">
                            Powered by cutting-edge web technologies for speed, security, and reliability
                        </p>
                    </div>

                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-3xl p-8 md:p-12">
                        <div className="grid md:grid-cols-2 gap-12">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white">
                                        <Code className="w-5 h-5" />
                                    </div>
                                    Frontend
                                </h3>
                                <ul className="space-y-3">
                                    <TechItem text="React.js - Dynamic user interface" />
                                    <TechItem text="Tailwind CSS - Modern, responsive design" />
                                    <TechItem text="Socket.io - Real-time messaging" />
                                    <TechItem text="React Router - Seamless navigation" />
                                </ul>
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center text-white">
                                        <Shield className="w-5 h-5" />
                                    </div>
                                    Backend
                                </h3>
                                <ul className="space-y-3">
                                    <TechItem text="Node.js & Express - Fast API server" />
                                    <TechItem text="MongoDB - Flexible data storage" />
                                    <TechItem text="JWT - Secure authentication" />
                                    <TechItem text="RESTful API - Clean architecture" />
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-gradient-to-r from-blue-500 to-cyan-500">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-4xl font-bold text-white mb-6">
                        Ready to Transform Your Organization?
                    </h2>
                    <p className="text-xl text-blue-50 mb-8">
                        Join hundreds of student organizations already using Aidevo to build stronger communities.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200">
                            Get Started Free
                        </button>
                        <button className="px-8 py-4 bg-transparent border-2 border-white text-white font-semibold rounded-2xl hover:bg-white hover:text-blue-600 transition-all duration-200">
                            Contact Us
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
};

// Component Definitions

const MissionCard = ({ icon, title, description, gradient }) => (
    <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white mb-6`}>
            {icon}
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">{title}</h3>
        <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
);

const InfoCard = ({ icon, title, description, color }) => {
    const colorClasses = color === 'blue' 
        ? 'from-blue-500 to-blue-600' 
        : 'from-cyan-500 to-cyan-600';
    
    return (
        <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:-translate-y-1">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClasses} flex items-center justify-center text-white mb-4`}>
                {icon}
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
            <p className="text-gray-600 leading-relaxed">{description}</p>
        </div>
    );
};

const FeatureItem = ({ icon, text }) => (
    <div className="flex items-start gap-3 bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white flex-shrink-0">
            {React.cloneElement(icon, { className: 'w-5 h-5' })}
        </div>
        <p className="text-gray-700 font-medium pt-2">{text}</p>
    </div>
);

const StepCard = ({ number, title, description }) => (
    <div className="relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:-translate-y-1">
        <div className="absolute -top-6 left-8 w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-xl shadow-lg">
            {number}
        </div>
        <div className="mt-4">
            <h3 className="text-2xl font-bold text-gray-900 mb-3">{title}</h3>
            <p className="text-gray-600 leading-relaxed">{description}</p>
        </div>
    </div>
);

const AudienceCard = ({ icon, title, items }) => (
    <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white mb-4">
            {icon}
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-4">{title}</h3>
        <ul className="space-y-2">
            {items.map((item, index) => (
                <li key={index} className="flex items-center gap-2 text-gray-600">
                    <CheckCircle className="w-4 h-4 text-blue-500 flex-shrink-0" />
                    <span>{item}</span>
                </li>
            ))}
        </ul>
    </div>
);

const WhyCard = ({ icon, title, description }) => (
    <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white mb-4">
            {icon}
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
        <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
);

const TechItem = ({ text }) => (
    <li className="flex items-start gap-3">
        <CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
        <span className="text-gray-700">{text}</span>
    </li>
);

export default About;