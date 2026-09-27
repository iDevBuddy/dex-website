/** Scheduled GitHub fallback: share Netlify draft slots; never auto-publish. */
import { runCloud } from './run-cloud.mjs'
runCloud().catch((error) => { console.error(error.message); process.exitCode = 1 })
