import React from 'react';
import { DashboardLayout } from '../../components/Layout/DashboardLayout';
import { UserRole } from '../../types';
import { Calendar } from 'lucide-react';

export const Bookings: React.FC = () => {
    return (
        <DashboardLayout role={UserRole.BUYER} title="My Bookings">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-500">
                        <tr>
                            <th className="px-6 py-3">Property</th>
                            <th className="px-6 py-3">Agent</th>
                            <th className="px-6 py-3">Date & Time</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {[
                            { id: 1, prop: 'Luxury Hillside Villa', agent: 'Agent Smith', date: 'Oct 28, 2023 - 2:00 PM', status: 'Confirmed' },
                            { id: 2, prop: 'Downtown Modern Apartment', agent: 'Sarah Connor', date: 'Nov 02, 2023 - 10:00 AM', status: 'Pending' },
                            { id: 3, prop: 'Cozy City Studio', agent: 'Mike Ross', date: 'Nov 05, 2023 - 4:30 PM', status: 'Cancelled' },
                        ].map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium">{item.prop}</td>
                                <td className="px-6 py-4">{item.agent}</td>
                                <td className="px-6 py-4 flex items-center text-gray-600"><Calendar className="h-4 w-4 mr-2" /> {item.date}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium 
                                        ${item.status === 'Confirmed' ? 'bg-green-100 text-green-700' : 
                                          item.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                                        {item.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <button className="text-primary-600 hover:text-primary-700 font-medium">Reschedule</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </DashboardLayout>
    );
};
