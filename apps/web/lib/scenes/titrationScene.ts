import type { StoreApi } from "zustand";

export type TitrationBenchState = {
  buretteMl: number;
  flaskMl: number;
  tapOpen: boolean;
};

export function buildTitrationScene(Phaser: typeof import("phaser"), store: StoreApi<TitrationBenchState>) {
  return class TitrationScene extends Phaser.Scene {
    constructor() {
      super("titration");
    }
    create() {
      this.add.text(16, 16, "Titration bench (2D)", { color: "#0f172a", fontSize: "18px" });
      const flask = this.add.rectangle(200, 220, 80, 100, 0xe0f2fe).setStrokeStyle(2, 0x0369a1);
      this.add.rectangle(400, 160, 24, 180, 0xffffff).setStrokeStyle(2, 0x64748b);
      const meniscus = this.add.rectangle(400, 80, 20, 4, 0x0284c7);
      const tap = this.add.text(400, 260, "Tap: open/close", { color: "#334155", fontSize: "14px" }).setOrigin(0.5).setInteractive({ useHandCursor: true });
      tap.on("pointerdown", () => {
        const s = store.getState();
        store.setState({ tapOpen: !s.tapOpen });
      });
      this.input.keyboard?.on("keydown-SPACE", () => {
        const s = store.getState();
        store.setState({ tapOpen: !s.tapOpen });
      });
      store.subscribe((s) => {
        meniscus.y = 60 + s.buretteMl * 0.8;
        flask.fillColor = s.flaskMl > 0 ? 0xfef08a : 0xe0f2fe;
      });
      this.add.text(16, 320, "Space: tap. Use the panel for readings.", { color: "#64748b", fontSize: "12px" });
    }
  };
}
