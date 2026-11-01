import type { StoreApi } from "zustand";
import type { ApparatusState } from "@/lib/sim/apparatusStore";

export type ApparatusViewState = ApparatusState & { dispatch: (a: import("@/lib/sim/apparatusStore").ApparatusAction) => void };

export function buildApparatusScene(PhaserLib: typeof import("phaser"), store: StoreApi<ApparatusViewState>) {
  return class ApparatusScene extends PhaserLib.Scene {
    constructor() {
      super("apparatus-room");
    }
    create() {
      this.add.text(16, 12, "Apparatus storeroom", { color: "#0f172a", fontSize: "16px" });
      const layer = this.add.container(0, 0);
      const paint = () => {
        layer.removeAll(true);
        const items = store.getState().items;
        items.forEach((item, i) => {
          const col = i % 5;
          const row = Math.floor(i / 5);
          const selected = store.getState().selectedId === item.id;
          const box = this.add.rectangle(70 + col * 110, 80 + row * 64, 96, 44, selected ? 0x0284c7 : 0xe2e8f0).setInteractive({ useHandCursor: true });
          box.on("pointerdown", () => store.getState().dispatch({ type: "select", id: item.id }));
          const label = this.add.text(70 + col * 110, 80 + row * 64, item.name, { color: "#0f172a", fontSize: "10px" }).setOrigin(0.5);
          layer.add([box, label]);
        });
      };
      paint();
      store.subscribe(paint);
    }
  };
}
