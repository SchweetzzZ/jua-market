
import { createCoreApi } from "./main"

const port = process.env.PORT ?? 3000

const app = createCoreApi()

app.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`)
})

