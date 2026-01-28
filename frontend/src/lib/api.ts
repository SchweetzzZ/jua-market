import { treaty } from '@elysiajs/eden'
import type { CoreApi } from '../../../backend/src/main'

export const api = treaty<CoreApi>('http://localhost:3000', {
    fetch: {
        credentials: "include"
    }
})
