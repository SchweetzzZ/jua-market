import type { AdminService } from "./adminServHooks"

interface AdminServiceTableProps {
    services: AdminService[]
    isLoading: boolean
    error: string | null
    totalServices: number
    page: number
    onPageChange: (page: number) => void
    searchQuery: string
    onSearchChange: (query: string) => void
    deleteService: (serviceId: string) => Promise<void>
}

export const AdminServiceTable = ({ services, isLoading, error, totalServices, page, onPageChange, searchQuery, onSearchChange,
    deleteService }: AdminServiceTableProps) => {

    const totalPages = Math.ceil(totalServices / 10);

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                <div className="relative w-full max-w-md">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg"></span>
                    <input
                        type="text"
                        placeholder="Buscar por nome do serviço..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                    />
                </div>
                <div className="text-sm text-slate-500 font-medium">
                    Total: <span className="text-slate-900">{totalServices}</span> serviços
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
                        Serviços
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
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">
                                    Serviço
                                </th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">
                                    Categoria
                                </th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">
                                    Preço
                                </th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">
                                    Ações
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100">
                            {services.map((service) => (
                                <tr
                                    key={service.id}
                                    className="hover:bg-slate-50/50 transition"
                                >
                                    <td className="px-6 py-4 font-semibold text-slate-700">
                                        {service.name}
                                    </td>

                                    <td className="px-6 py-4 text-slate-600">
                                        {service.category}
                                    </td>

                                    <td className="px-6 py-4 text-slate-600">
                                        R$ {Number(service.price).toFixed(2)}
                                    </td>

                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => deleteService(service.id)}
                                            className="text-red-600 hover:text-red-800 font-bold text-sm"
                                        >
                                            Deletar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {services.length === 0 && !isLoading && !error && (
                    <div className="p-10 text-center text-slate-400">
                        Nenhum serviço encontrado.
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
    )
}
