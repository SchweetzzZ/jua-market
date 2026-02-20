import { useState } from "react"
import type { AdminProduct } from "./adminProductsHooks"

interface AdminProductTableProps {
    products: AdminProduct[]
    isLoading: boolean
    error: string | null
    totalProducts: number
    page: number
    onPageChange: (page: number) => void
    searchQuery: string
    onSearchChange: (query: string) => void
    deleteProduct: (productId: string) => Promise<void>
    createProduct: (productData: {
        name: string
        description: string
        category: string
        price: string
        userId?: string
    }, imageFiles?: File[]) => Promise<void>
    updateProduct: (productId: string, productData: {
        name: string
        description: string
        category: string
        price: string
        images?: { imageUrl: string; imageKey: string }[]
    }, imageFiles?: File[]) => Promise<void>
}

export const AdminProductTable = ({
    products,
    isLoading,
    error,
    totalProducts,
    page,
    onPageChange,
    searchQuery,
    onSearchChange,
    deleteProduct,
    createProduct,
    updateProduct
}: AdminProductTableProps) => {
    const totalPages = Math.ceil(totalProducts / 10);
    const [showModal, setShowModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [editingImageFiles, setEditingImageFiles] = useState<File[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        category: "",
        price: "",
        userId: ""
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUploading(true);
        try {
            await createProduct(formData, imageFiles);
            setShowModal(false);
            setFormData({
                name: "",
                description: "",
                category: "",
                price: "",
                userId: ""
            });
            setImageFiles([]);
            alert("Produto criado com sucesso!");
        } catch (err: any) {
            alert(err.message || "Erro ao criar produto");
        } finally {
            setIsUploading(false);
        }
    };

    const handleEdit = (product: AdminProduct) => {
        setEditingProduct(product);
        setEditingImageFiles([]);
        setShowEditModal(true);
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingProduct) return;
        setIsUploading(true);

        try {
            await updateProduct(editingProduct.id, {
                name: editingProduct.name,
                description: editingProduct.description,
                category: editingProduct.category,
                price: editingProduct.price,
                images: editingProduct.images
            }, editingImageFiles);
            setShowEditModal(false);
            setEditingProduct(null);
            setEditingImageFiles([]);
            alert("Produto atualizado com sucesso!");
        } catch (err: any) {
            alert(err.message || "Erro ao atualizar produto");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                <div className="relative w-full max-w-md">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg"></span>
                    <input
                        type="text"
                        placeholder="Buscar por nome do produto..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                    />
                </div>
                <div className="text-sm text-slate-500 font-medium">
                    Total: <span className="text-slate-900">{totalProducts}</span> produtos
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
                        Produtos
                    </h2>
                    <button
                        onClick={() => setShowModal(true)}
                        className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
                    >
                        + Criar Produto
                    </button>
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
                                    Produto
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
                            {products.map((product) => (
                                <tr
                                    key={product.id}
                                    className="hover:bg-slate-50/50 transition"
                                >
                                    <td className="px-6 py-4 font-semibold text-slate-700">
                                        {product.name}
                                    </td>

                                    <td className="px-6 py-4 text-slate-600">
                                        {product.category}
                                    </td>

                                    <td className="px-6 py-4 text-slate-600">
                                        R$ {Number(product.price).toFixed(2)}
                                    </td>

                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => handleEdit(product)}
                                            className="text-blue-600 hover:text-blue-800 font-bold text-sm mr-3"
                                        >
                                            Editar
                                        </button>
                                        <button
                                            onClick={() => deleteProduct(product.id)}
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

                {products.length === 0 && !isLoading && !error && (
                    <div className="p-10 text-center text-slate-400">
                        Nenhum produto encontrado.
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

            {/* Modal de Criar Produto */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
                        <h3 className="text-xl font-bold text-slate-800 mb-4">Criar Novo Produto</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Nome</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Descrição</label>
                                <textarea
                                    required
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    rows={3}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Categoria</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Imagens do Produto</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    required={imageFiles.length === 0}
                                    onChange={(e) => {
                                        const files = Array.from(e.target.files || []);
                                        setImageFiles(prev => [...prev, ...files]);
                                    }}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                />
                                <div className="mt-2 grid grid-cols-4 gap-2">
                                    {imageFiles.map((file, idx) => (
                                        <div key={idx} className="relative aspect-square rounded-lg border border-slate-200 overflow-hidden group">
                                            <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" alt="preview" />
                                            <button
                                                type="button"
                                                onClick={() => setImageFiles(prev => prev.filter((_, i) => i !== idx))}
                                                className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Preço</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="0.00"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">ID do Usuário (Opcional)</label>
                                <input
                                    type="text"
                                    value={formData.userId}
                                    onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Deixe vazio para você mesmo"
                                />
                            </div>
                            <div className="flex gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-4 py-2 border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isUploading}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                                >
                                    {isUploading ? "Enviando..." : "Criar"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal de Editar Produto */}
            {showEditModal && editingProduct && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
                        <h3 className="text-xl font-bold text-slate-800 mb-4">Editar Produto</h3>
                        <form onSubmit={handleEditSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Nome</label>
                                <input
                                    type="text"
                                    required
                                    value={editingProduct.name}
                                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Descrição</label>
                                <textarea
                                    required
                                    value={editingProduct.description}
                                    onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    rows={3}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Categoria</label>
                                <input
                                    type="text"
                                    required
                                    value={editingProduct.category}
                                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Imagens Atuais</label>
                                <div className="grid grid-cols-4 gap-2 mb-4">
                                    {editingProduct.images?.map((img, idx) => (
                                        <div key={idx} className="relative aspect-square rounded-lg border border-slate-200 overflow-hidden group">
                                            <img src={img.imageUrl} className="w-full h-full object-cover" alt="current" />
                                            <button
                                                type="button"
                                                onClick={() => setEditingProduct({
                                                    ...editingProduct,
                                                    images: editingProduct.images.filter((_, i) => i !== idx)
                                                })}
                                                className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Adicionar Novas Imagens</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={(e) => {
                                        const files = Array.from(e.target.files || []);
                                        setEditingImageFiles(prev => [...prev, ...files]);
                                    }}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                />
                                <div className="mt-2 grid grid-cols-4 gap-2">
                                    {editingImageFiles.map((file, idx) => (
                                        <div key={idx} className="relative aspect-square rounded-lg border border-slate-200 overflow-hidden group">
                                            <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" alt="preview" />
                                            <button
                                                type="button"
                                                onClick={() => setEditingImageFiles(prev => prev.filter((_, i) => i !== idx))}
                                                className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Preço</label>
                                <input
                                    type="text"
                                    required
                                    value={editingProduct.price}
                                    onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="0.00"
                                />
                            </div>
                            <div className="flex gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowEditModal(false);
                                        setEditingProduct(null);
                                    }}
                                    className="flex-1 px-4 py-2 border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isUploading}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                                >
                                    {isUploading ? "Salvando..." : "Salvar"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

