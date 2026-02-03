import React from "react";
import type { AdminUser } from "./adminHooks";

interface SidebarProps {
    activeSection: string;
    setActiveSection: (section: string) => void;
}

export const AdminSidebar: React.FC<SidebarProps> = ({ activeSection, setActiveSection }) => {
    const menuItems = [
        { id: "overview", label: "Visão Geral", icon: "📊" },
        { id: "users", label: "Usuários", icon: "👥" },
        { id: "products", label: "Produtos", icon: "📦" },
        { id: "settings", label: "Configurações", icon: "⚙️" },
    ];

    return (
        <div className="w-64 bg-slate-900 text-white min-h-screen flex flex-col shadow-xl">
            <div className="p-6 border-b border-slate-800">
                <h2 className="text-xl font-bold tracking-wider text-blue-400">Admin Jua</h2>
            </div>
            <nav className="flex-1 mt-6">
                {menuItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setActiveSection(item.id)}
                        className={`w-full flex items-center px-6 py-4 transition-all duration-200 ${activeSection === item.id
                            ? "bg-blue-600/20 text-blue-400 border-l-4 border-blue-500"
                            : "text-slate-400 hover:bg-slate-800 hover:text-white"
                            }`}
                    >
                        <span className="mr-3 text-xl">{item.icon}</span>
                        <span className="font-medium">{item.label}</span>
                    </button>
                ))}
            </nav>
            <div className="p-6 border-t border-slate-800">
                <button
                    onClick={() => window.location.href = "/home"}
                    className="w-full text-slate-400 hover:text-white flex items-center transition"
                >
                    <span className="mr-2"></span> Sair do Painel
                </button>
            </div>
        </div>
    );
};

export const MetricCard: React.FC<{ title: string; value: string | number; icon: string; trend?: string }> = ({
    title,
    value,
    icon,
    trend,
}) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center">
        <div className="p-4 bg-blue-50 rounded-xl mr-5">
            <span className="text-2xl">{icon}</span>
        </div>
        <div>
            <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
            <div className="flex items-baseline">
                <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
                {trend && <span className="ml-2 text-xs font-semibold text-green-500">{trend}</span>}
            </div>
        </div>
    </div>
);

interface UserTableProps {
    users: AdminUser[];
    isLoading: boolean;
    onBan: (userId: string) => void;
    onUnban: (userId: string) => void;
}

export const UserTable: React.FC<UserTableProps> = ({ users, isLoading, onBan, onUnban }) => {
    if (isLoading) return <div className="p-10 text-center text-slate-500">Carregando usuários...</div>;

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Usuário</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Papel</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Ações</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {users.map((user) => (
                        <tr key={user.id} className="hover:bg-slate-50/50 transition">
                            <td className="px-6 py-4">
                                <div className="flex items-center">
                                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold mr-3">
                                        {user.name ? user.name[0].toUpperCase() : "U"}
                                    </div>
                                    <span className="font-semibold text-slate-700">{user.name || "Sem nome"}</span>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-slate-600">{user.email}</td>
                            <td className="px-6 py-4">
                                <span className={`px-2 py-1 rounded-md text-xs font-bold ${user.role === "admin" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
                                    }`}>
                                    {user.role}
                                </span>
                            </td>
                            <td className="px-6 py-4">
                                {user.banned ? (
                                    <span className="flex items-center text-red-600 text-sm font-medium">
                                        <span className="h-2 w-2 bg-red-600 rounded-full mr-2"></span> Banido
                                    </span>
                                ) : (
                                    <span className="flex items-center text-green-600 text-sm font-medium">
                                        <span className="h-2 w-2 bg-green-600 rounded-full mr-2"></span> Ativo
                                    </span>
                                )}
                            </td>
                            <td className="px-6 py-4 text-right">
                                {user.banned ? (
                                    <button
                                        onClick={() => onUnban(user.id)}
                                        className="text-blue-600 hover:text-blue-800 font-bold text-sm"
                                    >
                                        Desbanir
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => onBan(user.id)}
                                        className="text-red-600 hover:text-red-800 font-bold text-sm"
                                    >
                                        Banir
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {users.length === 0 && (
                <div className="p-10 text-center text-slate-400">Nenhum usuário encontrado.</div>
            )}
        </div>
    );
};
