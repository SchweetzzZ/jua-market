import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AdminSidebar, UserTable, MetricCard } from "./adminComponents";
import { useAdminUsers } from "./adminHooks";
import { useSession } from "../../../auth-client";
import { AdminProductTable } from "./admin-products/adminProdComponet";
import { useAdminProducts } from "./admin-products/adminProductsHooks";
import { useAdminServices } from "./admin-service/adminServHooks";
import { AdminServiceTable } from "./admin-service/adminServComponents";


export default function AdminPage() {
    const navigate = useNavigate();
    const { data: session, isPending } = useSession();
    const [activeSection, setActiveSection] = useState("users");
    const { users, isLoading, error, fetchUsers, banUser, unbanUser, totalUsers, page, setPage,
        searchQuery, setSearchQuery } = useAdminUsers();
    const [debouncedSearch, setDebouncedSearch] = useState("");

    const { products, isLoading: productsLoading, error: productsError, fetchProducts, deleteProduct, createProduct, updateProduct, totalProducts,
        page: prodPage, setPage: setProdPage, searchQuery: prodSearch, setSearchQuery: setProdSearch } = useAdminProducts();
    const [debouncedProdSearch, setDebouncedProdSearch] = useState("");

    const { services, isLoading: servicesLoading, error: servicesError, fetchServices, deleteService, createService, updateService, totalServices,
        page: servPage, setPage: setServPage, searchQuery: servSearch, setSearchQuery: setServSearch } = useAdminServices();
    const [debouncedServSearch, setDebouncedServSearch] = useState("");

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
            if (activeSection === "users") {
                fetchUsers({ page, search: debouncedSearch });
            }

            if (activeSection === "products") {
                fetchProducts({ page: prodPage, search: debouncedProdSearch });
            }
            if (activeSection === "services") {
                fetchServices({ page: servPage, search: debouncedServSearch });
            }
        }
    }, [activeSection, page, debouncedSearch, prodPage, debouncedProdSearch, servPage, debouncedServSearch, session, fetchUsers, fetchProducts, fetchServices]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setPage(1);
            setDebouncedSearch(searchQuery);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery, setPage]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setProdPage(1);
            setDebouncedProdSearch(prodSearch);
        }, 500);
        return () => clearTimeout(timer);
    }, [prodSearch, setProdPage]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setServPage(1);
            setDebouncedServSearch(servSearch);
        }, 500);
        return () => clearTimeout(timer);
    }, [servSearch, setServPage]);

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
    };

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
        <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
            <AdminSidebar activeSection={activeSection} setActiveSection={setActiveSection} />

            <main className="flex-1 p-10 overflow-y-auto">
                <header className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800">
                            {activeSection === "users" && "Gerenciamento de Usuários"}
                            {activeSection === "products" && "Produtos"}
                            {activeSection === "settings" && "Configurações do Sistema"}
                            {activeSection === "services" && "Serviços"}
                        </h1>
                        <p className="text-slate-500 mt-2">Bem-vindo ao centro administrativo do Market Jua.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm text-sm font-medium">
                            {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <MetricCard title="Total de Usuários" value={totalUsers} icon="👥" />
                    <MetricCard title="Produtos Ativos" value={totalProducts} icon="📦" />
                    <MetricCard title="Serviços Ativos" value={totalServices} icon="🔧" />
                </div>

                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8 rounded shadow-sm">
                        <div className="flex items-center">
                            <span className="text-red-500 mr-3 text-xl"></span>
                            <p className="text-red-700 font-medium">{error}</p>
                        </div>
                    </div>
                )}



                {activeSection === "users" && (
                    <UserTable
                        users={users}
                        isLoading={isLoading}
                        onBan={handleBan}
                        onUnban={handleUnban}
                        totalUsers={totalUsers}
                        page={page}
                        onPageChange={handlePageChange}
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                        error={error}
                    />
                )}

                {activeSection === "products" && (
                    <AdminProductTable
                        products={products}
                        isLoading={productsLoading}
                        error={productsError}
                        totalProducts={totalProducts}
                        page={prodPage}
                        onPageChange={setProdPage}
                        searchQuery={prodSearch}
                        onSearchChange={setProdSearch}
                        deleteProduct={deleteProduct}
                        createProduct={createProduct}
                        updateProduct={updateProduct}
                    />
                )}
                {activeSection === "services" && (
                    <AdminServiceTable
                        services={services}
                        isLoading={servicesLoading}
                        error={servicesError}
                        totalServices={totalServices}
                        page={servPage}
                        onPageChange={setServPage}
                        searchQuery={servSearch}
                        onSearchChange={setServSearch}
                        deleteService={deleteService}
                        createService={createService}
                        updateService={updateService}
                    />
                )}
                {activeSection === "settings" && (
                    <div className="bg-white p-20 rounded-2xl shadow-sm border border-slate-100 text-center">
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">Em Construção</h2>
                        <p className="text-slate-500">Esta funcionalidade está sendo implementada e estará disponível em breve.</p>
                    </div>
                )}
            </main>
        </div>
    );
}
