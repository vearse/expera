export type ApparatusPartStates = {
  bunsen: { lit: boolean; airOpen: boolean };
};

export function defaultPartStates(): ApparatusPartStates {
  return { bunsen: { lit: false, airOpen: false } };
}
