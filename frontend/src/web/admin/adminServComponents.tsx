import type { AdminService } from "./adminServHooks"

interface AdminServiceTableProps {
    services: AdminService[]
    isLoading: boolean
    error: string | null
    deleteService: (serviceId: string) => Promise<void>
}

export const AdminServiceTable = ({
    services,
    isLoading,
    error,
    deleteService,
}: AdminServiceTableProps) => {
    if (isLoading) {
        return (
            <div className="p-10 text-center text-slate-500">
                Carregando serviços...
            </div>
        )
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <h2 className="px-6 py-4 text-lg font-bold text-slate-800 border-b border-slate-100">
                Serviços
            </h2>

            {error && (
                <div className="p-6 text-red-600 font-medium">
                    {error}
                </div>
            )}

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

            {services.length === 0 && !error && (
                <div className="p-10 text-center text-slate-400">
                    Nenhum serviço encontrado.
                </div>
            )}
        </div>
    )
}
