export enum Colors {
  RED,
  ORANGE,
  YELLOW,
  LIME,
  GREEN,
  BLUE,
  PINK,
  PURPLE,
}

export const hex = new Map<Colors, string>();
hex.set(Colors.RED, "#E74C3C");
hex.set(Colors.ORANGE, "#E67E22");
hex.set(Colors.YELLOW, "#F1C40F");
hex.set(Colors.LIME, "#2ECC71");
hex.set(Colors.GREEN, "#27AE60");
hex.set(Colors.BLUE, "#3498DB");
hex.set(Colors.PINK, "#F472D0");
hex.set(Colors.PURPLE, "#9B59B6");
Object.freeze(hex);
