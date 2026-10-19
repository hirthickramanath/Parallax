import { coverageInvestigations } from "../../lib/coverage-investigations";
import { fieldsInvestigations } from "../../lib/fields-investigations";
import { matterInvestigations } from "../../lib/matter-investigations";
import { quantumInvestigations } from "../../lib/quantum-investigations";
import { foundationNextInvestigations } from "../../lib/foundation-next-investigations";
import { computingInvestigations } from "../../lib/computing-investigations";
import { structureInvestigations } from "../../lib/structure-investigations";
import { advancedMathInvestigations } from "../../lib/advanced-math-investigations";
import { chemistryInvestigations } from "../../lib/chemistry-investigations";
import { physicalChemistryInvestigations } from "../../lib/physical-chemistry-investigations";
import { thermalOpticsInvestigations } from "../../lib/thermal-optics-investigations";
import {
  ElectrostaticProbe,
  ImageChargeProbe,
  WireFieldProbe,
} from "./FieldProbes";
import { emInvestigations } from "../../lib/em-investigations";
import { linearOdeInvestigations } from "../../lib/linear-ode-investigations";
import { multivariableInvestigations } from "../../lib/multivariable-investigations";
import { AstroInvestigation } from "./AstroInvestigation";
import { astroInvestigations } from "../../lib/astro-investigations";
import {
  HamiltonianPhaseExplorer,
  CanonicalShearExplorer,
} from "./AnalyticalMechanicsExplorers";
import {
  CoriolisExplorer,
  InertiaTensorExplorer,
  RutherfordExplorer,
} from "./AdvancedMechanicsExplorers";
import { DarbouxExplorer, UniformPowerExplorer } from "./AnalysisExplorers";
import {
  LimitBandExplorer,
  SignedAreaExplorer,
  OdeAccuracyExplorer,
  MolecularGeometryExplorer,
} from "./CalculusExplorers";
import {
  BayesExplorer,
  ThinLensExplorer,
  InductionExplorer,
  TidalExplorer,
} from "./TransferExplorers";
import {
  HydrostaticExplorer,
  ThermalPathExplorer,
  ConicExplorer,
  PlaneDistanceExplorer,
} from "./FoundationExplorers";
import { CollisionExplorer, RollingExplorer } from "./MechanicsExplorer";
import { VectorExplorer } from "./VectorExplorer";
import { BlackHoleExplorer } from "./BlackHoleExplorer";
import { LegendreExplorer } from "./LegendreExplorer";
import { ComplexBranchExplorer } from "./ComplexBranchExplorer";
import { PdeModesLab } from "./PdeModesLab";
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
  electrostatic_probe: ElectrostaticProbe,
  image_charge_probe: ImageChargeProbe,
  wire_field_probe: WireFieldProbe,
  hamiltonian_phase_explorer: HamiltonianPhaseExplorer,
  canonical_shear_explorer: CanonicalShearExplorer,
  coriolis_explorer: CoriolisExplorer,
  inertia_tensor_explorer: InertiaTensorExplorer,
  rutherford_explorer: RutherfordExplorer,
  darboux_explorer: DarbouxExplorer,
  uniform_power_explorer: UniformPowerExplorer,
  limit_band_explorer: LimitBandExplorer,
  signed_area_explorer: SignedAreaExplorer,
  ode_accuracy_explorer: OdeAccuracyExplorer,
  molecular_geometry_explorer: MolecularGeometryExplorer,
  bayes_explorer: BayesExplorer,
  thin_lens_explorer: ThinLensExplorer,
  induction_explorer: InductionExplorer,
  tidal_explorer: TidalExplorer,
  hydrostatic_explorer: HydrostaticExplorer,
  thermal_path_explorer: ThermalPathExplorer,
  conic_explorer: ConicExplorer,
  plane_distance_explorer: PlaneDistanceExplorer,
  collision_explorer: CollisionExplorer,
  rolling_explorer: RollingExplorer,
  vector_explorer: VectorExplorer,
  black_hole_explorer: BlackHoleExplorer,
  legendre_explorer: LegendreExplorer,
  complex_branch_explorer: ComplexBranchExplorer,
  pde_modes_lab: PdeModesLab,
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
  if (name.startsWith("coverage_") && coverageInvestigations[name.slice(9)])
    return (
      <AstroInvestigation
        key={name}
        lessonId={name.slice(9)}
        model={coverageInvestigations[name.slice(9)]}
      />
    );
  if (name.startsWith("fields_") && fieldsInvestigations[name.slice(7)])
    return (
      <AstroInvestigation
        key={name}
        lessonId={name.slice(7)}
        model={fieldsInvestigations[name.slice(7)]}
      />
    );
  if (name.startsWith("matter_") && matterInvestigations[name.slice(7)])
    return (
      <AstroInvestigation
        key={name}
        lessonId={name.slice(7)}
        model={matterInvestigations[name.slice(7)]}
      />
    );
  if (name.startsWith("quantum_") && quantumInvestigations[name.slice(8)])
    return (
      <AstroInvestigation
        key={name}
        lessonId={name.slice(8)}
        model={quantumInvestigations[name.slice(8)]}
      />
    );
  if (
    name.startsWith("foundation_next_") &&
    foundationNextInvestigations[name.slice(16)]
  )
    return (
      <AstroInvestigation
        key={name}
        lessonId={name.slice(16)}
        model={foundationNextInvestigations[name.slice(16)]}
      />
    );
  if (name.startsWith("computing_") && computingInvestigations[name.slice(10)])
    return (
      <AstroInvestigation
        key={name}
        lessonId={name.slice(10)}
        model={computingInvestigations[name.slice(10)]}
      />
    );
  if (name.startsWith("structure_") && structureInvestigations[name.slice(10)])
    return (
      <AstroInvestigation
        key={name}
        lessonId={name.slice(10)}
        model={structureInvestigations[name.slice(10)]}
      />
    );
  if (
    name.startsWith("advanced_math_") &&
    advancedMathInvestigations[name.slice(14)]
  )
    return (
      <AstroInvestigation
        key={name}
        lessonId={name.slice(14)}
        model={advancedMathInvestigations[name.slice(14)]}
      />
    );
  if (name.startsWith("astro_") && astroInvestigations[name.slice(6)])
    return <AstroInvestigation key={name} lessonId={name.slice(6)} />;
  if (
    name.startsWith("multivariable_") &&
    multivariableInvestigations[name.slice(14)]
  )
    return (
      <AstroInvestigation
        key={name}
        lessonId={name.slice(14)}
        model={multivariableInvestigations[name.slice(14)]}
      />
    );
  if (name.startsWith("linear_ode_") && linearOdeInvestigations[name.slice(11)])
    return (
      <AstroInvestigation
        key={name}
        lessonId={name.slice(11)}
        model={linearOdeInvestigations[name.slice(11)]}
      />
    );
  if (name.startsWith("em_") && emInvestigations[name.slice(3)])
    return (
      <AstroInvestigation
        key={name}
        lessonId={name.slice(3)}
        model={emInvestigations[name.slice(3)]}
      />
    );
  if (
    name.startsWith("thermal_optics_") &&
    thermalOpticsInvestigations[name.slice(15)]
  )
    return (
      <AstroInvestigation
        key={name}
        lessonId={name.slice(15)}
        model={thermalOpticsInvestigations[name.slice(15)]}
      />
    );
  if (
    name.startsWith("physical_chemistry_") &&
    physicalChemistryInvestigations[name.slice(19)]
  )
    return (
      <AstroInvestigation
        key={name}
        lessonId={name.slice(19)}
        model={physicalChemistryInvestigations[name.slice(19)]}
      />
    );
  if (name.startsWith("chemistry_") && chemistryInvestigations[name.slice(10)])
    return (
      <AstroInvestigation
        key={name}
        lessonId={name.slice(10)}
        model={chemistryInvestigations[name.slice(10)]}
      />
    );
  const Component = widgets[name as keyof typeof widgets];
  return Component ? <Component /> : null;
}
