import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AdminSidebar, UserTable, MetricCard } from "./adminComponents";
import { useAdminUsers } from "./adminHooks";
import { useSession } from "../../../auth-client";

export default function AdminPage() {
    const navigate = useNavigate();
    const { data: session, isPending } = useSession();
    const [activeSection, setActiveSection] = useState("overview");
    const { users, isLoading, error, fetchUsers, banUser, unbanUser } = useAdminUsers();

    useEffect(() => {
        if (!isPending) {
            console.log("Admin Check - Session:", session);
            console.log("Admin Check - User Role:", session?.user?.role);

            if (!session) {
                navigate("/login");
            } else {
                const role = session.user.role;
                const isAdmin = role === "admin" || (Array.isArray(role) && role.includes("admin"));

                if (!isAdmin) {
                    console.log("Not an admin, redirecting to home...");
                    navigate("/home");
                }
            }
        }
    }, [session, isPending, navigate]);

    useEffect(() => {
        const role = session?.user?.role;
        const isAdmin = role === "admin" || (Array.isArray(role) && role.includes("admin"));

        if (isAdmin) {
            if (activeSection === "users" || activeSection === "overview") {
                fetchUsers();
            }
        }
    }, [activeSection, fetchUsers, session]);

    if (isPending) {
        return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 font-medium">Verificando permissões...</div>;
    }

    if (!session || session.user.role !== "admin") {
        return null; // O useEffect lidará com o redirecionamento
    }

    const handleBan = async (userId: string) => {
        const reason = window.prompt("Motivo do banimento:");
        if (reason !== null) {
            try {
                await banUser(userId, reason);
                alert("Usuário banido com sucesso!");
            } catch (err: any) {
                alert(err.message);
            }
        }
    };

    const handleUnban = async (userId: string) => {
        if (window.confirm("Deseja realmente desbanir este usuário?")) {
            try {
                await unbanUser(userId);
                alert("Usuário desbanido com sucesso!");
            } catch (err: any) {
                alert(err.message);
            }
        }
    };

    return (
        <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
            <AdminSidebar activeSection={activeSection} setActiveSection={setActiveSection} />

            <main className="flex-1 p-10 overflow-y-auto">
                <header className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800">
                            {activeSection === "overview" && "Painel de Controle"}
                            {activeSection === "users" && "Gerenciamento de Usuários"}
                            {activeSection === "products" && "Produtos e Serviços"}
                            {activeSection === "settings" && "Configurações do Sistema"}
                        </h1>
                        <p className="text-slate-500 mt-2">Bem-vindo ao centro administrativo do Market Jua.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm text-sm font-medium">
                            {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </div>
                    </div>
                </header>

                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8 rounded shadow-sm">
                        <div className="flex items-center">
                            <span className="text-red-500 mr-3 text-xl">⚠️</span>
                            <p className="text-red-700 font-medium">{error}</p>
                        </div>
                    </div>
                )}

                {activeSection === "overview" && (
                    <div className="space-y-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <MetricCard title="Total de Usuários" value={users.length} icon="👥" trend="+12% este mês" />
                            <MetricCard title="Vendas Hoje" value="R$ 1.250,00" icon="💰" trend="+5% vs ontem" />
                            <MetricCard title="Novos Produtos" value="24" icon="📦" trend="+8% esta semana" />
                            <MetricCard title="Suporte Aberto" value="3" icon="🎧" />
                        </div>

                        <section>
                            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
                                <span className="mr-2">🕒</span> Usuários Recentes
                            </h2>
                            <UserTable
                                users={users.slice(0, 5)}
                                isLoading={isLoading}
                                onBan={handleBan}
                                onUnban={handleUnban}
                            />
                        </section>
                    </div>
                )}

                {activeSection === "users" && (
                    <UserTable
                        users={users}
                        isLoading={isLoading}
                        onBan={handleBan}
                        onUnban={handleUnban}
                    />
                )}

                {(activeSection === "products" || activeSection === "settings") && (
                    <div className="bg-white p-20 rounded-2xl shadow-sm border border-slate-100 text-center">
                        <div className="text-6xl mb-6">🚧</div>
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">Em Construção</h2>
                        <p className="text-slate-500">Esta funcionalidade está sendo implementada e estará disponível em breve.</p>
                    </div>
                )}
            </main>
        </div>
    );
}
