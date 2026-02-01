import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t mt-12 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
         <div className="col-span-1">
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Ghar Bazar</h3>
            <p className="mt-4 text-sm text-gray-500">Your trusted partner in finding the perfect home.</p>
         </div>
         <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Quick Links</h3>
            <ul className="mt-4 space-y-2">
               <li><Link to="/" className="text-sm text-gray-500 hover:text-gray-900">Home</Link></li>
               <li><Link to="/properties" className="text-sm text-gray-500 hover:text-gray-900">Buy Property</Link></li>
            </ul>
         </div>
         <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Support</h3>
             <ul className="mt-4 space-y-2">
               <li><a href="#" className="text-sm text-gray-500 hover:text-gray-900">Contact Us</a></li>
               <li><a href="#" className="text-sm text-gray-500 hover:text-gray-900">FAQ</a></li>
            </ul>
         </div>
         <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">About Us</h3>
             <ul className="mt-4 space-y-2">
               <li><a href="#" className="text-sm text-gray-500 hover:text-gray-900">Our Story</a></li>
               <li><a href="#" className="text-sm text-gray-500 hover:text-gray-900">Careers</a></li>
            </ul>
         </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 mt-8 pt-8 border-t text-center">
         <p className="text-sm text-gray-400">&copy; 2025 Ghar Bazar. All rights reserved.</p>
      </div>
    </footer>
  )
}
