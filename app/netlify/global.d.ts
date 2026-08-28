// Pulls in @netlify/functions' `declare global { var Netlify: ... }` for
// every file under netlify/ — needed since no function file currently
// imports anything from that package directly (get-page-seo.mts and
// get-seo-snapshot.mts don't need Config/Context), and without at least
// one import somewhere in this tsconfig's program, TypeScript won't know
// the ambient `Netlify` global (used in ga4Client.ts, seRankingClient.ts)
// exists.
import '@netlify/functions';
