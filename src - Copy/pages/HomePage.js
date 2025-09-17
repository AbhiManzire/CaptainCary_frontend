import React from 'react';
import { Link } from 'react-router-dom';
import { Ship, Users, Shield, FileText, ArrowRight, CheckCircle, Globe, Award, Rocket, TrendingUp, Bell, MapPin, Brain, CreditCard, UserCheck, Mail, Instagram } from 'lucide-react';

const HomePage = () => {
  const features = [
    {
      icon: <Globe className="h-8 w-8" />,
      title: "Global Crew Network",
      description: "Access to a worldwide network of qualified maritime professionals"
    },
    {
      icon: <Award className="h-8 w-8" />,
      title: "Skill and Cert Matching",
      description: "Advanced algorithms to match crew skills with your specific requirements"
    },
    {
      icon: <Rocket className="h-8 w-8" />,
      title: "Fast Development",
      description: "Rapid crew onboarding and continuous professional development"
    },
    {
      icon: <TrendingUp className="h-8 w-8" />,
      title: "Cost Optimization",
      description: "Minimize administrative costs and streamline crew management processes"
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Compliance Focused",
      description: "Ensure all crew members meet regulatory requirements and industry standards"
    }
  ];

  const crewFeatures = [
    {
      icon: <FileText className="h-8 w-8" />,
      title: "Digital Crew Passport",
      description: "Streamlined digital identity management for all crew members"
    },
    {
      icon: <Bell className="h-8 w-8" />,
      title: "Compliance Alerts",
      description: "Stay ahead with real-time notifications for regulatory compliance"
    },
    {
      icon: <Award className="h-8 w-8" />,
      title: "Verified Certificates",
      description: "Secure verification of all crew certifications and qualifications"
    },
    {
      icon: <CreditCard className="h-8 w-8" />,
      title: "Deferred Payment",
      description: "Flexible payment options to optimize your cash flow. Pay later after 200+ crew milestone or trusted status."
    },
    {
      icon: <MapPin className="h-8 w-8" />,
      title: "Geo-Sorted Crew Pools",
      description: "Location-based crew selection for optimal deployment"
    },
    {
      icon: <Brain className="h-8 w-8" />,
      title: "Smart Crew Development",
      description: "AI-driven career progression and skill enhancement"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Top Bar */}
      <div className="bg-primary-900 text-white py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-6">
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-2" />
                <span className="text-sm">hello@charterfleetmarine.com.au</span>
              </div>
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-2" />
                <span className="text-sm">Australia</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <a href="#" className="text-white hover:text-primary-300 transition-colors">
                <span className="text-sm font-bold">in</span>
              </a>
              <a href="#" className="text-white hover:text-primary-300 transition-colors">
                <span className="text-sm font-bold">t</span>
              </a>
              <a href="#" className="text-white hover:text-primary-300 transition-colors">
                <span className="text-sm font-bold">f</span>
              </a>
              <a href="#" className="text-white hover:text-primary-300 transition-colors">
                <Instagram className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="flex items-center">
                <img 
                  src="/logo-main1.png" 
                  alt="CFM Logo" 
                  className="h-16 w-auto"
                />
              
              </div>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              <Link to="/register" className="text-primary-600 font-medium hover:text-primary-700 transition-colors">
                Register as Crew
              </Link>
              <Link to="/admin/login" className="text-gray-700 hover:text-primary-600 transition-colors">
                Admin Login
              </Link>
              <Link to="/client/login" className="text-gray-700 hover:text-primary-600 transition-colors">
                Client Login
              </Link>
              <Link 
                to="/register" 
                className="bg-gradient-to-r from-primary-400 to-primary-600 text-white px-6 py-2 rounded-lg font-medium hover:from-primary-500 hover:to-primary-700 transition-all duration-300 flex items-center shadow-lg"
              >
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      {/* <div className="bg-gray-50 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center space-x-8 py-4">
            <Link
              to="/register"
              className="text-primary-600 font-medium hover:text-primary-700 transition-colors border-b-2 border-primary-600 pb-2"
            >
              Register as Crew
            </Link>
            <Link
              to="/admin/login"
              className="text-gray-700 font-medium hover:text-primary-600 transition-colors"
            >
              Admin Login
            </Link>
            <Link
              to="/client/login"
              className="text-gray-700 font-medium hover:text-primary-600 transition-colors"
            >
              Client Login
            </Link>
          </div>
        </div>
      </div> */}

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white py-20 overflow-hidden" style={{
        backgroundImage: `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800"><defs><filter id="blur"><feGaussianBlur stdDeviation="3"/></filter></defs><rect width="1200" height="800" fill="%230f172a"/><rect x="0" y="0" width="1200" height="800" fill="url(%23gradient)" opacity="0.8"/><defs><linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:%230f172a;stop-opacity:0.9"/><stop offset="100%" style="stop-color:%231e40af;stop-opacity:0.7"/></linearGradient></defs></svg>')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}>
        <div className="absolute inset-0 bg-black  opacity-30"></div>
        <div className="relative  ml-40 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Main Content */}
            <div>
              <h1 className="text-2xl md:text-4xl font-light mb-8 text-white">
                <span className="relative">
                  Crew As A Service
                  <span className="absolute bottom-0 left-0 w-24 h-1 bg-blue-400"></span>
                </span>
              </h1>
              
              {/* Feature Boxes */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-slate-800 bg-opacity-100 p-4 rounded-lg border border-slate-700 overflow-hidden">
                  <div className="flex items-center text-white">
                    <div className="bg-blue-500 w-8 h-8 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                      <UserCheck className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-[20px] font-poppins font-normal whitespace-nowrap overflow-hidden">Digital Passport</span>
                  </div>
                </div>
                <div className="bg-slate-800 bg-opacity-100 p-4 rounded-lg border border-slate-700 overflow-hidden">
                  <div className="flex items-center text-white">
                    <div className="bg-blue-500 w-8 h-8 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                      <Shield className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-[20px] font-poppins font-normal whitespace-nowrap overflow-hidden">Compliance</span>
                  </div>
                </div>
                <div className="bg-slate-800 bg-opacity-100 p-4 rounded-lg border border-slate-700 overflow-hidden">
                  <div className="flex items-center text-white">
                    <div className="bg-blue-500 w-8 h-8 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                      <FileText className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-[20px] font-poppins font-normal whitespace-nowrap overflow-hidden">Live Crew Views</span>
                  </div>
                </div>
                <div className="bg-slate-800 bg-opacity-100 p-4 rounded-lg border border-slate-700 overflow-hidden">
                  <div className="flex items-center text-white">
                    <div className="bg-blue-500 w-8 h-8 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                      <CreditCard className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-[20px] font-poppins font-normal whitespace-nowrap overflow-hidden">Deferred Payment</span>
                  </div>
                </div>
              </div>
              
              {/* Call to Action Button */}
              <Link
                to="/register"
                className="bg-white text-blue-600 px-8 py-1 rounded-full font-sans hover:bg-gray-100 transition-colors inline-flex items-center text-lg"
              >
                CFM - Verified Professional <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
            
            {/* Right Side - Logo Badge */}
            <div className="flex justify-start lg:justify-start">
              <div className="relative ml-20 mr-4">
                <div className="bg-slate-800 bg-opacity-50 backdrop-blur-sm p-8 rounded-2xl border border-slate-600">
                  <img 
                    src="/logo.png" 
                    alt="CFM Logo" 
                    className="h-60 w-auto mx-auto"
                  />
                </div>
                <p className="text-center text-white text-sm mt-6 max-w-xs font-medium">
                  Trusted by maritime industry leaders worldwide
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comprehensive Solutions Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-primary-600 text-lg font-semibold uppercase tracking-wide">
            COMPREHENSIVE SOLUTIONS
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-8 rounded-lg shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                <div className="flex items-center mb-4">
                  <div className="bg-primary-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold mr-4">
                    {String(index + 1).padStart(2, '0')}
                  </div>
                  <div className="text-primary-600">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Crew Management Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-primary-600 text-sm font-semibold uppercase tracking-wide mb-4">
              FUTURE-FOCUSED
            </p>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Crew Management
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our innovative solutions transform how you manage your maritime crew
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {crewFeatures.map((feature, index) => (
              <div key={index} className="bg-white p-8 rounded-lg shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                <div className="text-primary-600 mb-4 flex justify-end">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 mb-4">
                  {feature.description}
                </p>
                <Link to="/" className="text-primary-600 font-medium hover:text-primary-700 transition-colors">
                  Learn More <ArrowRight className="inline h-4 w-4 ml-1" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 text-white py-20 overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-30"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-primary-600 text-white w-16 h-16 rounded-full flex items-center justify-center">
                <UserCheck className="h-8 w-8" />
              </div>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Transform Your Crew Management?
            </h2>
            <p className="text-xl text-primary-100 mb-8 max-w-3xl mx-auto">
              Join the maritime industry leaders who trust Charter Fleet Marine for their crew management needs
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link
                to="/register"
                className="bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center justify-center text-lg"
              >
                Get Started Today <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                to="/client/login"
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition-colors inline-flex items-center justify-center text-lg"
              >
                Schedule Demo 🗓️
              </Link>
            </div>
            <div className="flex flex-col sm:flex-row gap-6 justify-center text-primary-100">
              <div className="flex items-center justify-center">
                <FileText className="h-5 w-5 mr-2" />
                <span>hello@charterfleetmarine.com.au</span>
              </div>
              <div className="flex items-center justify-center">
                <UserCheck className="h-5 w-5 mr-2" />
                <span>24/7 Support Available</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div>
              <div className="flex items-center mb-6">
                <div className="bg-primary-600 text-white px-3 py-2 rounded-lg font-bold text-lg mr-3">
                  CFM
                </div>
                <div>
                  <h3 className="text-lg font-bold">CHARTER FLEET MARINE</h3>
                </div>
              </div>
              <p className="text-primary-200 mb-6">
                Global Crew. Trusted Systems. Flexible Terms.
              </p>
              <div className="flex space-x-4">
                <div className="bg-white bg-opacity-20 w-10 h-10 rounded-full flex items-center justify-center hover:bg-opacity-30 transition-colors cursor-pointer">
                  <span className="text-sm font-bold">in</span>
                </div>
                <div className="bg-white bg-opacity-20 w-10 h-10 rounded-full flex items-center justify-center hover:bg-opacity-30 transition-colors cursor-pointer">
                  <span className="text-sm font-bold">t</span>
                </div>
                <div className="bg-white bg-opacity-20 w-10 h-10 rounded-full flex items-center justify-center hover:bg-opacity-30 transition-colors cursor-pointer">
                  <span className="text-sm font-bold">f</span>
                </div>
                <div className="bg-white bg-opacity-20 w-10 h-10 rounded-full flex items-center justify-center hover:bg-opacity-30 transition-colors cursor-pointer">
                  <span className="text-sm font-bold">ig</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-6 border-b-2 border-primary-600 pb-2 inline-block">Contact Us</h3>
              <ul className="space-y-4 text-primary-200">
                <li className="flex items-center">
                  <FileText className="h-5 w-5 mr-3" />
                  <span>hello@charterfleetmarine.com.au</span>
                </li>
                <li className="flex items-center">
                  <MapPin className="h-5 w-5 mr-3" />
                  <span>12 Maranoa St, Paramatta Park, Cairns, Australia, 4870.</span>
                </li>
                <li className="flex items-center">
                  <UserCheck className="h-5 w-5 mr-3" />
                  <span>24/7 Support Available</span>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-6 border-b-2 border-primary-600 pb-2 inline-block">Quick Links</h3>
              <div className="grid grid-cols-2 gap-2 text-primary-200">
                <Link to="/" className="hover:text-white transition-colors flex items-center">
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Home
                </Link>
                <Link to="/" className="hover:text-white transition-colors flex items-center">
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Features
                </Link>
                <Link to="/" className="hover:text-white transition-colors flex items-center">
                  <ArrowRight className="h-4 w-4 mr-2" />
                  CaaS
                </Link>
                <Link to="/" className="hover:text-white transition-colors flex items-center">
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Contact
                </Link>
                <Link to="/" className="hover:text-white transition-colors flex items-center">
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Privacy Policy
                </Link>
                <Link to="/" className="hover:text-white transition-colors flex items-center">
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Terms of Service
                </Link>
              </div>
            </div>
          </div>
          
          <div className="border-t border-primary-800 mt-12 pt-8 text-center text-primary-300">
            <p>&copy; 2025 Charter Fleet Marine. All Rights Reserved. Design and Developed with ♥ by ColourMoon.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
