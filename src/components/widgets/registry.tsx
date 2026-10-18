import { CoupledOscillatorLab } from "./CoupledOscillatorLab";
import { SphericalFieldLab } from "./SphericalFieldLab";
import { RadiationLab } from "./RadiationLab";
import { GasLab } from "./GasLab";
import { WaveLab } from "./WaveLab";
import { DoubleSlitLab } from "./DoubleSlitLab";
import { PendulumLab } from "./PendulumLab";
import { OrbitExplorer } from "./OrbitExplorer";
import { FallingBodies } from "./FallingBodies";
import { SecantExplorer } from "./SecantExplorer";
import { CircuitLab } from "./CircuitLab";
export const widgets = {
  coupled_oscillator_lab: CoupledOscillatorLab,
  spherical_field_lab: SphericalFieldLab,
  radiation_lab: RadiationLab,
  gas_lab: GasLab,
  wave_lab: WaveLab,
  double_slit_lab: DoubleSlitLab,
  circuit_lab: CircuitLab,
  pendulum_lab: PendulumLab,
  orbit_explorer: OrbitExplorer,
  falling_bodies: FallingBodies,
  secant_explorer: SecantExplorer,
};
export function Widget({ name }: { name: string }) {
  const Component = widgets[name as keyof typeof widgets];
  return Component ? <Component /> : null;
}
