/**
 * Curriculum data repository
 * 
 * Contains the static curriculum structure.
 * In a real application, this would be fetched from an API.
 */

import { Subject } from './curriculum.types';

export const SUBJECTS: Subject[] = [
  {
    id: 'math',
    name: 'Mathematics',
    slug: 'mathematics',
    topics: [
      {
        id: 'algebra',
        name: 'Algebra',
        slug: 'algebra',
        chapters: [
          {
            id: 'linear-eq',
            name: 'Linear Equations',
            slug: 'linear-equations',
            worksheets: [
              { id: 'ws-1', name: 'Basic Linear Equations', slug: 'basic-linear' },
              { id: 'ws-2', name: 'Word Problems', slug: 'word-problems' },
              { id: 'ws-3', name: 'Graphing Lines', slug: 'graphing-lines' },
            ],
          },
          {
            id: 'quadratic',
            name: 'Quadratic Equations',
            slug: 'quadratic-equations',
            worksheets: [
              { id: 'ws-4', name: 'Factoring', slug: 'factoring' },
              { id: 'ws-5', name: 'Quadratic Formula', slug: 'quadratic-formula' },
              { id: 'ws-6', name: 'Completing the Square', slug: 'completing-square' },
            ],
          },
          {
            id: 'polynomials',
            name: 'Polynomials',
            slug: 'polynomials',
            worksheets: [
              { id: 'ws-7', name: 'Adding and Subtracting', slug: 'poly-add-subtract' },
              { id: 'ws-8', name: 'Multiplying and Dividing', slug: 'poly-multiply-divide' },
              { id: 'ws-9', name: 'Factoring Polynomials', slug: 'poly-factoring' },
            ],
          },
          {
            id: 'exp-log',
            name: 'Exponentials & Logarithms',
            slug: 'exponentials-logarithms',
            worksheets: [
              { id: 'ws-10', name: 'Exponential Functions', slug: 'exponential-functions' },
              { id: 'ws-11', name: 'Logarithmic Properties', slug: 'log-properties' },
              { id: 'ws-12', name: 'Solving Exponential Equations', slug: 'solving-exp' },
            ],
          },
          {
            id: 'systems',
            name: 'Systems of Equations',
            slug: 'systems-equations',
            worksheets: [
              { id: 'ws-13', name: 'Substitution Method', slug: 'substitution' },
              { id: 'ws-14', name: 'Elimination Method', slug: 'elimination' },
              { id: 'ws-15', name: 'Matrix Method', slug: 'matrix-method' },
            ],
          },
        ],
      },
      {
        id: 'geometry',
        name: 'Geometry',
        slug: 'geometry',
        chapters: [
          {
            id: 'triangles',
            name: 'Triangles',
            slug: 'triangles',
            worksheets: [
              { id: 'ws-16', name: 'Triangle Properties', slug: 'triangle-properties' },
              { id: 'ws-17', name: 'Pythagorean Theorem', slug: 'pythagorean' },
              { id: 'ws-18', name: 'Special Right Triangles', slug: 'special-triangles' },
              { id: 'ws-19', name: 'Triangle Congruence', slug: 'congruence' },
            ],
          },
          {
            id: 'circles',
            name: 'Circles',
            slug: 'circles',
            worksheets: [
              { id: 'ws-20', name: 'Circle Properties', slug: 'circle-properties' },
              { id: 'ws-21', name: 'Arcs and Sectors', slug: 'arcs-sectors' },
              { id: 'ws-22', name: 'Tangent Lines', slug: 'tangent-lines' },
            ],
          },
          {
            id: 'polygons',
            name: 'Polygons',
            slug: 'polygons',
            worksheets: [
              { id: 'ws-23', name: 'Quadrilaterals', slug: 'quadrilaterals' },
              { id: 'ws-24', name: 'Regular Polygons', slug: 'regular-polygons' },
              { id: 'ws-25', name: 'Area and Perimeter', slug: 'area-perimeter' },
            ],
          },
          {
            id: '3d-shapes',
            name: '3D Shapes',
            slug: '3d-shapes',
            worksheets: [
              { id: 'ws-26', name: 'Prisms and Cylinders', slug: 'prisms-cylinders' },
              { id: 'ws-27', name: 'Pyramids and Cones', slug: 'pyramids-cones' },
              { id: 'ws-28', name: 'Spheres', slug: 'spheres' },
            ],
          },
        ],
      },
      {
        id: 'trigonometry',
        name: 'Trigonometry',
        slug: 'trigonometry',
        chapters: [
          {
            id: 'trig-ratios',
            name: 'Trigonometric Ratios',
            slug: 'trig-ratios',
            worksheets: [
              { id: 'ws-29', name: 'Sine, Cosine, Tangent', slug: 'sin-cos-tan' },
              { id: 'ws-30', name: 'Solving Right Triangles', slug: 'right-triangles' },
              { id: 'ws-31', name: 'Applications', slug: 'trig-applications' },
            ],
          },
          {
            id: 'trig-identities',
            name: 'Trigonometric Identities',
            slug: 'trig-identities',
            worksheets: [
              { id: 'ws-32', name: 'Pythagorean Identities', slug: 'pythagorean-identities' },
              { id: 'ws-33', name: 'Sum and Difference', slug: 'sum-difference' },
              { id: 'ws-34', name: 'Double Angle Formulas', slug: 'double-angle' },
            ],
          },
          {
            id: 'unit-circle',
            name: 'Unit Circle',
            slug: 'unit-circle',
            worksheets: [
              { id: 'ws-35', name: 'Radians and Degrees', slug: 'radians-degrees' },
              { id: 'ws-36', name: 'Special Angles', slug: 'special-angles' },
              { id: 'ws-37', name: 'Graphing Trig Functions', slug: 'graphing-trig' },
            ],
          },
        ],
      },
      {
        id: 'calculus',
        name: 'Calculus',
        slug: 'calculus',
        chapters: [
          {
            id: 'limits',
            name: 'Limits',
            slug: 'limits',
            worksheets: [
              { id: 'ws-38', name: 'Introduction to Limits', slug: 'intro-limits' },
              { id: 'ws-39', name: 'Limit Laws', slug: 'limit-laws' },
              { id: 'ws-40', name: 'Continuity', slug: 'continuity' },
            ],
          },
          {
            id: 'derivatives',
            name: 'Derivatives',
            slug: 'derivatives',
            worksheets: [
              { id: 'ws-41', name: 'Power Rule', slug: 'power-rule' },
              { id: 'ws-42', name: 'Product and Quotient Rules', slug: 'product-quotient' },
              { id: 'ws-43', name: 'Chain Rule', slug: 'chain-rule' },
              { id: 'ws-44', name: 'Implicit Differentiation', slug: 'implicit-diff' },
            ],
          },
          {
            id: 'integrals',
            name: 'Integrals',
            slug: 'integrals',
            worksheets: [
              { id: 'ws-45', name: 'Antiderivatives', slug: 'antiderivatives' },
              { id: 'ws-46', name: 'Definite Integrals', slug: 'definite-integrals' },
              { id: 'ws-47', name: 'Integration Techniques', slug: 'integration-techniques' },
            ],
          },
        ],
      },
      {
        id: 'statistics',
        name: 'Statistics',
        slug: 'statistics',
        chapters: [
          {
            id: 'descriptive',
            name: 'Descriptive Statistics',
            slug: 'descriptive-stats',
            worksheets: [
              { id: 'ws-48', name: 'Mean, Median, Mode', slug: 'mean-median-mode' },
              { id: 'ws-49', name: 'Standard Deviation', slug: 'standard-deviation' },
              { id: 'ws-50', name: 'Data Visualization', slug: 'data-visualization' },
            ],
          },
          {
            id: 'probability',
            name: 'Probability',
            slug: 'probability',
            worksheets: [
              { id: 'ws-51', name: 'Basic Probability', slug: 'basic-probability' },
              { id: 'ws-52', name: 'Conditional Probability', slug: 'conditional-probability' },
              { id: 'ws-53', name: 'Combinations and Permutations', slug: 'combinations-permutations' },
            ],
          },
          {
            id: 'distributions',
            name: 'Probability Distributions',
            slug: 'distributions',
            worksheets: [
              { id: 'ws-54', name: 'Normal Distribution', slug: 'normal-distribution' },
              { id: 'ws-55', name: 'Binomial Distribution', slug: 'binomial-distribution' },
              { id: 'ws-56', name: 'Sampling Distributions', slug: 'sampling-distributions' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'physics',
    name: 'Physics',
    slug: 'physics',
    topics: [
      {
        id: 'mechanics',
        name: 'Mechanics',
        slug: 'mechanics',
        chapters: [
          {
            id: 'motion',
            name: 'Motion',
            slug: 'motion',
            worksheets: [
              { id: 'ws-57', name: 'Velocity and Acceleration', slug: 'velocity' },
              { id: 'ws-58', name: 'Kinematics Equations', slug: 'kinematics' },
              { id: 'ws-59', name: 'Projectile Motion', slug: 'projectile-motion' },
            ],
          },
          {
            id: 'forces',
            name: 'Forces',
            slug: 'forces',
            worksheets: [
              { id: 'ws-60', name: 'Newton\'s Laws', slug: 'newtons-laws' },
              { id: 'ws-61', name: 'Free Body Diagrams', slug: 'free-body-diagrams' },
              { id: 'ws-62', name: 'Friction', slug: 'friction' },
              { id: 'ws-63', name: 'Circular Motion', slug: 'circular-motion' },
            ],
          },
          {
            id: 'energy',
            name: 'Energy and Work',
            slug: 'energy-work',
            worksheets: [
              { id: 'ws-64', name: 'Work and Power', slug: 'work-power' },
              { id: 'ws-65', name: 'Kinetic Energy', slug: 'kinetic-energy' },
              { id: 'ws-66', name: 'Potential Energy', slug: 'potential-energy' },
              { id: 'ws-67', name: 'Conservation of Energy', slug: 'conservation-energy' },
            ],
          },
          {
            id: 'momentum',
            name: 'Momentum',
            slug: 'momentum',
            worksheets: [
              { id: 'ws-68', name: 'Linear Momentum', slug: 'linear-momentum' },
              { id: 'ws-69', name: 'Collisions', slug: 'collisions' },
              { id: 'ws-70', name: 'Impulse', slug: 'impulse' },
            ],
          },
        ],
      },
      {
        id: 'thermodynamics',
        name: 'Thermodynamics',
        slug: 'thermodynamics',
        chapters: [
          {
            id: 'heat-temp',
            name: 'Heat and Temperature',
            slug: 'heat-temperature',
            worksheets: [
              { id: 'ws-71', name: 'Temperature Scales', slug: 'temperature-scales' },
              { id: 'ws-72', name: 'Heat Transfer', slug: 'heat-transfer' },
              { id: 'ws-73', name: 'Specific Heat', slug: 'specific-heat' },
            ],
          },
          {
            id: 'laws-thermo',
            name: 'Laws of Thermodynamics',
            slug: 'laws-thermodynamics',
            worksheets: [
              { id: 'ws-74', name: 'First Law', slug: 'first-law' },
              { id: 'ws-75', name: 'Second Law', slug: 'second-law' },
              { id: 'ws-76', name: 'Entropy', slug: 'entropy' },
            ],
          },
          {
            id: 'gas-laws',
            name: 'Ideal Gas Law',
            slug: 'gas-laws',
            worksheets: [
              { id: 'ws-77', name: 'Boyle\'s Law', slug: 'boyles-law' },
              { id: 'ws-78', name: 'Charles\'s Law', slug: 'charles-law' },
              { id: 'ws-79', name: 'Combined Gas Law', slug: 'combined-gas-law' },
            ],
          },
        ],
      },
      {
        id: 'electromagnetism',
        name: 'Electromagnetism',
        slug: 'electromagnetism',
        chapters: [
          {
            id: 'electrostatics',
            name: 'Electrostatics',
            slug: 'electrostatics',
            worksheets: [
              { id: 'ws-80', name: 'Electric Charge', slug: 'electric-charge' },
              { id: 'ws-81', name: 'Coulomb\'s Law', slug: 'coulombs-law' },
              { id: 'ws-82', name: 'Electric Fields', slug: 'electric-fields' },
            ],
          },
          {
            id: 'circuits',
            name: 'Electric Circuits',
            slug: 'circuits',
            worksheets: [
              { id: 'ws-83', name: 'Ohm\'s Law', slug: 'ohms-law' },
              { id: 'ws-84', name: 'Series and Parallel', slug: 'series-parallel' },
              { id: 'ws-85', name: 'Kirchhoff\'s Rules', slug: 'kirchhoffs-rules' },
            ],
          },
          {
            id: 'magnetism',
            name: 'Magnetism',
            slug: 'magnetism',
            worksheets: [
              { id: 'ws-86', name: 'Magnetic Fields', slug: 'magnetic-fields' },
              { id: 'ws-87', name: 'Electromagnetic Induction', slug: 'em-induction' },
              { id: 'ws-88', name: 'Transformers', slug: 'transformers' },
            ],
          },
        ],
      },
      {
        id: 'waves',
        name: 'Waves and Optics',
        slug: 'waves-optics',
        chapters: [
          {
            id: 'wave-motion',
            name: 'Wave Motion',
            slug: 'wave-motion',
            worksheets: [
              { id: 'ws-89', name: 'Wave Properties', slug: 'wave-properties' },
              { id: 'ws-90', name: 'Sound Waves', slug: 'sound-waves' },
              { id: 'ws-91', name: 'Standing Waves', slug: 'standing-waves' },
            ],
          },
          {
            id: 'light',
            name: 'Light and Reflection',
            slug: 'light-reflection',
            worksheets: [
              { id: 'ws-92', name: 'Law of Reflection', slug: 'law-reflection' },
              { id: 'ws-93', name: 'Mirrors', slug: 'mirrors' },
              { id: 'ws-94', name: 'Refraction', slug: 'refraction' },
            ],
          },
          {
            id: 'optics',
            name: 'Geometric Optics',
            slug: 'geometric-optics',
            worksheets: [
              { id: 'ws-95', name: 'Lenses', slug: 'lenses' },
              { id: 'ws-96', name: 'Optical Instruments', slug: 'optical-instruments' },
              { id: 'ws-97', name: 'Wave Optics', slug: 'wave-optics' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'chemistry',
    name: 'Chemistry',
    slug: 'chemistry',
    topics: [
      {
        id: 'matter',
        name: 'Matter and Measurement',
        slug: 'matter-measurement',
        chapters: [
          {
            id: 'atoms',
            name: 'Atomic Structure',
            slug: 'atomic-structure',
            worksheets: [
              { id: 'ws-98', name: 'Subatomic Particles', slug: 'subatomic-particles' },
              { id: 'ws-99', name: 'Isotopes', slug: 'isotopes' },
              { id: 'ws-100', name: 'Electron Configuration', slug: 'electron-config' },
            ],
          },
          {
            id: 'periodic',
            name: 'Periodic Table',
            slug: 'periodic-table',
            worksheets: [
              { id: 'ws-101', name: 'Periodic Trends', slug: 'periodic-trends' },
              { id: 'ws-102', name: 'Element Groups', slug: 'element-groups' },
              { id: 'ws-103', name: 'Valence Electrons', slug: 'valence-electrons' },
            ],
          },
        ],
      },
      {
        id: 'bonding',
        name: 'Chemical Bonding',
        slug: 'chemical-bonding',
        chapters: [
          {
            id: 'ionic',
            name: 'Ionic Bonding',
            slug: 'ionic-bonding',
            worksheets: [
              { id: 'ws-104', name: 'Forming Ionic Compounds', slug: 'forming-ionic' },
              { id: 'ws-105', name: 'Naming Ionic Compounds', slug: 'naming-ionic' },
              { id: 'ws-106', name: 'Ionic Properties', slug: 'ionic-properties' },
            ],
          },
          {
            id: 'covalent',
            name: 'Covalent Bonding',
            slug: 'covalent-bonding',
            worksheets: [
              { id: 'ws-107', name: 'Lewis Structures', slug: 'lewis-structures' },
              { id: 'ws-108', name: 'Molecular Geometry', slug: 'molecular-geometry' },
              { id: 'ws-109', name: 'Polarity', slug: 'polarity' },
            ],
          },
        ],
      },
      {
        id: 'reactions',
        name: 'Chemical Reactions',
        slug: 'chemical-reactions',
        chapters: [
          {
            id: 'equations',
            name: 'Chemical Equations',
            slug: 'equations',
            worksheets: [
              { id: 'ws-110', name: 'Writing Equations', slug: 'writing-equations' },
              { id: 'ws-111', name: 'Balancing Equations', slug: 'balancing-equations' },
              { id: 'ws-112', name: 'Types of Reactions', slug: 'reaction-types' },
            ],
          },
          {
            id: 'stoichiometry',
            name: 'Stoichiometry',
            slug: 'stoichiometry',
            worksheets: [
              { id: 'ws-113', name: 'Mole Conversions', slug: 'mole-conversions' },
              { id: 'ws-114', name: 'Limiting Reactants', slug: 'limiting-reactants' },
              { id: 'ws-115', name: 'Percent Yield', slug: 'percent-yield' },
            ],
          },
        ],
      },
      {
        id: 'solutions',
        name: 'Solutions',
        slug: 'solutions',
        chapters: [
          {
            id: 'concentration',
            name: 'Concentration',
            slug: 'concentration',
            worksheets: [
              { id: 'ws-116', name: 'Molarity', slug: 'molarity' },
              { id: 'ws-117', name: 'Dilutions', slug: 'dilutions' },
              { id: 'ws-118', name: 'Colligative Properties', slug: 'colligative' },
            ],
          },
          {
            id: 'acids-bases',
            name: 'Acids and Bases',
            slug: 'acids-bases',
            worksheets: [
              { id: 'ws-119', name: 'pH Scale', slug: 'ph-scale' },
              { id: 'ws-120', name: 'Neutralization', slug: 'neutralization' },
              { id: 'ws-121', name: 'Buffers', slug: 'buffers' },
            ],
          },
        ],
      },
    ],
  },
];