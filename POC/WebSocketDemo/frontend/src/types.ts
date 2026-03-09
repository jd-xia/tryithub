// --- types.ts: shared TypeScript types so components and hooks agree on data shapes ---

// interface: describes the "shape" of an object. TypeScript will error if you pass something with wrong or missing fields.
export interface ChatMessage {
  from: string   // who sent it
  text: string   // message content
  timestamp: number  // Unix time (ms), used for sorting/display
}
