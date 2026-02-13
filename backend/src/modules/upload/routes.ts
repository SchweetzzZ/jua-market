import { Elysia, t } from "elysia";
import { authMacro } from "../auth/macro";
import { getPresignedUploadUrl } from "../../lib/s3";
import { randomUUID } from "crypto";

export const uploadRoutes = new Elysia({ prefix: "/upload" })
    .use(authMacro)
    .post("/presigned", async ({ body, set, user }) => {
        try {
            const { fileName, contentType, fileSize } = body;

            // Validação de tipo
            const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
            if (!allowedTypes.includes(contentType)) {
                set.status = 400;
                return { success: false, message: "Tipo de arquivo não permitido. Use JPEG, PNG, WEBP ou GIF." };
            }

            const MAX_SIZE = 5 * 1024 * 1024;
            if (fileSize > MAX_SIZE) {
                set.status = 400;
                return { success: false, message: "Arquivo muito grande. O limite é 5MB." };
            }

            const extension = fileName.split(".").pop();
            const key = `uploads/${user.id}/${randomUUID()}.${extension}`;

            const uploadUrl = await getPresignedUploadUrl(key, contentType);

            const bucket = process.env.AWS_BUCKET_NAME;
            const region = process.env.AWS_REGION || "us-east-1";

            // Construir a URL pública (ajuste conforme seu provider S3/R2)
            let imageUrl = `https://${bucket}.s3.${region}.amazonaws.com/${key}`;

            // Se estiver usando R2 ou endpoint customizado:
            if (process.env.AWS_ENDPOINT && process.env.AWS_ENDPOINT.includes("r2.cloudflarestorage.com")) {
                imageUrl = `${process.env.PUBLIC_IMAGE_URL}/${key}`;
            }

            return {
                success: true,
                message: "URL gerada com sucesso",
                data: {
                    uploadUrl,
                    imageUrl,
                    imageKey: key
                }
            };
        } catch (error: any) {
            set.status = 500;
            return { success: false, message: error.message || "Erro ao gerar URL" };
        }
    }, {
        auth: true,
        body: t.Object({
            fileName: t.String(),
            contentType: t.String(),
            fileSize: t.Number()
        })
    });
