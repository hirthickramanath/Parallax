import { PendulumLab } from "./PendulumLab";
import { OrbitExplorer } from "./OrbitExplorer";
import { FallingBodies } from "./FallingBodies";
import { SecantExplorer } from "./SecantExplorer";
export const widgets = {
  pendulum_lab: PendulumLab,
  orbit_explorer: OrbitExplorer,
  falling_bodies: FallingBodies,
  secant_explorer: SecantExplorer,
};
export function Widget({ name }: { name: string }) {
  const Component = widgets[name as keyof typeof widgets];
  return Component ? <Component /> : null;
}
