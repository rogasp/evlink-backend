export {};

declare global {
  interface Window {
    umami?: {
      track: (eventName: string) => void;
    };
  }
}
