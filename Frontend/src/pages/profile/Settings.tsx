import React from 'react';
import { DashboardLayout } from '../../components/Layout/DashboardLayout';
import { UserRole } from '../../types';
import { Lock, Bell, Mail, Smartphone, Shield, Trash2, Save } from 'lucide-react';

export const Settings: React.FC<{ role: UserRole }> = ({ role }) => {
    const handleUpdatePassword = () => {
        alert("Password updated successfully!");
    };

    return (
        <DashboardLayout role={role} title="Account Settings">
            <div className="max-w-4xl mx-auto space-y-6">
                
                {/* Security Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex items-center gap-3">
                         <div className="bg-blue-50 p-2 rounded-lg text-primary-600"><Lock className="h-5 w-5" /></div>
                         <h3 className="text-lg font-bold text-gray-800">Security</h3>
                    </div>
                    <div className="p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                                <input type="password" className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none" placeholder="••••••••" />
                            </div>
                            <div className="md:col-start-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                                <input type="password" className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none" placeholder="New password" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                                <input type="password" className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none" placeholder="Confirm new password" />
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <button onClick={handleUpdatePassword} className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition">
                                <Save className="h-4 w-4" /> Update Password
                            </button>
                        </div>
                    </div>
                </div>

                {/* Notifications Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                     <div className="p-6 border-b border-gray-100 flex items-center gap-3">
                         <div className="bg-yellow-50 p-2 rounded-lg text-yellow-600"><Bell className="h-5 w-5" /></div>
                         <h3 className="text-lg font-bold text-gray-800">Notifications</h3>
                    </div>
                    <div className="p-6 space-y-4">
                        <div className="flex items-center justify-between py-2">
                             <div className="flex items-center gap-3">
                                 <Mail className="h-5 w-5 text-gray-400" />
                                 <div>
                                     <p className="font-medium text-gray-900">Email Notifications</p>
                                     <p className="text-sm text-gray-500">Receive updates about your listings and inquiries.</p>
                                 </div>
                             </div>
                             <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" defaultChecked />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                             </label>
                        </div>
                        <div className="flex items-center justify-between py-2 border-t border-gray-50">
                             <div className="flex items-center gap-3">
                                 <Smartphone className="h-5 w-5 text-gray-400" />
                                 <div>
                                     <p className="font-medium text-gray-900">SMS Notifications</p>
                                     <p className="text-sm text-gray-500">Get instant alerts on your mobile device.</p>
                                 </div>
                             </div>
                             <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                             </label>
                        </div>
                    </div>
                </div>

                {/* Danger Zone */}
                <div className="bg-white rounded-xl shadow-sm border border-red-100 overflow-hidden">
                    <div className="p-6 border-b border-red-50 flex items-center gap-3">
                         <div className="bg-red-50 p-2 rounded-lg text-red-600"><Shield className="h-5 w-5" /></div>
                         <h3 className="text-lg font-bold text-gray-800">Danger Zone</h3>
                    </div>
                    <div className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-gray-900">Delete Account</p>
                                <p className="text-sm text-gray-500">Once you delete your account, there is no going back. Please be certain.</p>
                            </div>
                            <button className="flex items-center gap-2 border border-red-200 text-red-600 px-4 py-2 rounded-md hover:bg-red-50 transition">
                                <Trash2 className="h-4 w-4" /> Delete Account
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </DashboardLayout>
    )
}
