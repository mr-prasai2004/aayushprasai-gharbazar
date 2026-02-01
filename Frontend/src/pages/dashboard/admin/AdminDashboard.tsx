import React from 'react';
import { Eye, CheckCircle } from 'lucide-react';
import {DashboardLayout} from '../../../components/Layout';
import { UserRole} from '../../../types';


export const AdminDashboard: React.FC = () => {
  return (
    <DashboardLayout role={UserRole.ADMIN} title="Dashboard Overview">
      <div className="p-6">
            <h1>Admin Dashboard</h1>
            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[
                    { label: 'Total Users', val: '1,500' },
                    { label: 'Active Listings', val: '789' },
                    { label: 'Pending Approvals', val: '12' },
                    { label: 'Total Revenue', val: '$1.2M' }
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-lg border shadow-sm">
                        <p className="text-sm text-gray-500">{stat.label}</p>
                        <h3 className="text-2xl font-bold mt-2 text-gray-800">
                            {stat.val}
                        </h3>
                    </div>
                ))}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 mb-8">
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg">
                    Review Properties
                </button>
                <button className="border px-4 py-2 rounded-lg">
                    Manage Users
                </button>
                <button className="border px-4 py-2 rounded-lg">
                    Add New Admin
                </button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg border overflow-hidden">
                <div className="px-6 py-4 border-b">
                    <h3 className="font-bold text-gray-800">
                        Properties Awaiting Approval
                    </h3>
                </div>

                <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left">Property</th>
                            <th className="px-6 py-3 text-left">Type</th>
                            <th className="px-6 py-3 text-left">Status</th>
                            <th className="px-6 py-3 text-left">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        <tr>
                            <td className="px-6 py-3 font-medium">
                                Sample Property
                            </td>
                            <td className="px-6 py-3">Apartment</td>
                            <td className="px-6 py-3">
                                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                                    Pending
                                </span>
                            </td>
                            <td className="px-6 py-3 flex gap-2">
                                <Eye className="h-4 w-4 text-gray-400" />
                                <CheckCircle className="h-4 w-4 text-green-500" />
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </DashboardLayout>
  );
};
