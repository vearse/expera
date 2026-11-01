import type { StoreApi } from "zustand";
import type { TitrationState, TitrationAction } from "@/lib/sim/titrationStore";
import { buretteReading, currentPH } from "@/lib/sim/titrationStore";

export type TitrationViewState = TitrationState & { dispatch: (a: TitrationAction) => void };

export function buildTitrationLabScene(PhaserLib: typeof import("phaser"), store: StoreApi<TitrationViewState>) {
  return class TitrationLabScene extends PhaserLib.Scene {
    private meniscus?: Phaser.GameObjects.Rectangle;
    private liquid?: Phaser.GameObjects.Rectangle;
    private label?: Phaser.GameObjects.Text;
    constructor() {
      super("titration-lab");
    }
    create() {
      this.add.text(16, 12, "Titration bench", { color: "#0f172a", fontSize: "16px" });
      this.add.rectangle(180, 200, 70, 120, 0xe2e8f0).setStrokeStyle(2, 0x0369a1);
      this.liquid = this.add.rectangle(180, 230, 60, 40, 0xf6c1d9);
      this.add.rectangle(360, 180, 22, 200, 0xffffff).setStrokeStyle(2, 0x334155);
      this.meniscus = this.add.rectangle(360, 90, 16, 4, 0x0284c7);
      const tap = this.add.text(360, 300, "Tap", { color: "#0f172a", fontSize: "14px", backgroundColor: "#e0f2fe" }).setPadding(8, 6, 8, 6).setOrigin(0.5).setInteractive({ useHandCursor: true });
      tap.on("pointerdown", () => store.getState().dispatch({ type: "deliver", cm3: 0.05 }));
      this.label = this.add.text(16, 320, "", { color: "#334155", fontSize: "13px" });
      this.input.keyboard?.on("keydown-SPACE", () => store.getState().dispatch({ type: "deliver", cm3: 0.05 }));
      const paint = () => {
        const s = store.getState();
        const reading = buretteReading(s);
        if (this.meniscus) this.meniscus.y = 80 + Math.min(reading, 50) * 3;
        const ph = currentPH(s);
        if (this.liquid) this.liquid.fillColor = ph !== null && ph < 8.2 ? 0xf4f7fb : 0xd63384;
        if (this.label) this.label.setText(`Burette ${reading.toFixed(2)} cm3. Space or Tap adds one drop.`);
      };
      paint();
      store.subscribe(paint);
    }
  };
}
