export async function unwrap<T>(promise: Promise<{ data: T | null; error: any; status: number }>): Promise<T> {
    const { data, error, status } = await promise;

    if (error) {
        console.error(`API Error (${status}):`, error);
        const message = error?.value?.message || error?.message || "Erro na requisição";
        throw new Error(message);
    }

    if (!data) {
        throw new Error("Resposta vazia do servidor");
    }

    // Se o backend retornar { success: false, message: "..." } mesmo com status 200/201
    // Isso acontece em alguns serviços legados que ainda não foram totalmente refatorados.
    const anyData = data as any;
    if (anyData && anyData.success === false) {
        throw new Error(anyData.message || "Operação falhou no servidor");
    }

    // Se o dado estiver vindo "double-wrapped" { success: true, data: { ... } }
    if (anyData && anyData.success === true && anyData.data !== undefined) {
        return anyData.data;
    }

    return data;
}
