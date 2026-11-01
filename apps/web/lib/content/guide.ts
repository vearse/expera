export const GUIDE_TIPS = [
  { id: "default", context: "default", text: "Explore each view, then try the linked lab bench when you are ready." },
  { id: "learn-periodic-table", context: "learn:periodic-table", text: "Use Trends to see how properties change across the table. Compare two elements side by side." },
  { id: "learn-atom-builder", context: "learn:atom-builder", text: "Drag particles or use +/−. Build sodium-23 for your first mission XP." },
  { id: "lab", context: "lab", text: "Guided mode walks you through WAEC-style steps. Free mode lets you try anything — watch for safety warnings." },
] as const;

export function tipForContext(context: string) {
  return GUIDE_TIPS.find((t) => t.context === context) ?? GUIDE_TIPS.find((t) => t.context === "default")!;
}
