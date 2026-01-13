export function track(event: string, props?: Record<string, any>) {
    // Replace later with Plausible/GA/Umami
    console.log("[track]", event, props ?? {});
  }
  