import React from "react";
import type { AdminUser } from "./adminHooks";

interface SidebarProps {
    activeSection: string;
    setActiveSection: (section: string) => void;
}

export const AdminSidebar: React.FC<SidebarProps> = ({ activeSection, setActiveSection }) => {
    const menuItems = [
        { id: "users", label: "Usuários", icon: "👥" },
        { id: "products", label: "Produtos", icon: "📦" },
        { id: "services", label: "Serviços", icon: "🔧" },
        { id: "settings", label: "Configurações", icon: "⚙️" },
    ];

    return (
        <div className="w-64 bg-slate-900 text-white h-screen flex flex-col shadow-xl">
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
    totalUsers: number;
    page: number;
    onPageChange: (page: number) => void;
    searchQuery: string;
    onSearchChange: (query: string) => void;
    error: string | null;
}

export const UserTable: React.FC<UserTableProps> = ({
    users,
    isLoading,
    onBan,
    onUnban,
    totalUsers,
    page,
    onPageChange,
    searchQuery,
    onSearchChange,
    error
}) => {
    const totalPages = Math.ceil(totalUsers / 10);

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                <div className="relative w-full max-w-md">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg"></span>
                    <input
                        type="text"
                        placeholder="Buscar por nome ou email..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                    />
                </div>
                <div className="text-sm text-slate-500 font-medium">
                    Total: <span className="text-slate-900">{totalUsers}</span> usuários
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden relative">
                {isLoading && (
                    <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
                        <div className="flex flex-col items-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent mb-2"></div>
                            <p className="text-sm font-medium text-slate-600">Carregando...</p>
                        </div>
                    </div>
                )}

                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-slate-800">
                        Usuários
                    </h2>
                </div>

                {error && (
                    <div className="p-6 text-red-600 font-medium bg-red-50">
                        {error}
                    </div>
                )}

                <div className="overflow-x-auto">
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
                                        <span className={`px-2 py-1 rounded-md text-xs font-bold ${user.role === "admin" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}`}>
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
                                            <button onClick={() => onUnban(user.id)} className="text-blue-600 hover:text-blue-800 font-bold text-sm">Desbanir</button>
                                        ) : (
                                            <button onClick={() => onBan(user.id)} className="text-red-600 hover:text-red-800 font-bold text-sm">Banir</button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {users.length === 0 && !isLoading && (
                    <div className="p-20 text-center text-slate-400">
                        <span className="text-4xl mb-4 block">🔍</span>
                        <p className="font-medium">Nenhum usuário encontrado.</p>
                    </div>
                )}

                {totalPages > 1 && (
                    <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                        <p className="text-sm text-slate-500">
                            Página <span className="font-bold text-slate-900">{page}</span> de <span className="font-bold text-slate-900">{totalPages}</span>
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => onPageChange(page - 1)}
                                disabled={page === 1}
                                className="px-4 py-2 text-sm font-bold bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                            >
                                Anterior
                            </button>
                            <button
                                onClick={() => onPageChange(page + 1)}
                                disabled={page === totalPages}
                                className="px-4 py-2 text-sm font-bold bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                            >
                                Próximo
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
