import { defineBlock, type BlockDef } from '../block';
import type { Field } from '../fields';

const t = (key: string, label: string, help?: string): Field => ({ key, label, type: 'text', help });

const FLOOR_OPTIONS = [
  { value: 'lower_ground_floor', label: 'Lower ground floor' },
  { value: 'ground_floor', label: 'Ground floor' },
  { value: 'first_floor', label: 'First floor' },
  { value: 'second_floor', label: 'Second floor' },
  { value: 'third_floor', label: 'Third floor' },
  { value: 'fourth_floor', label: 'Fourth floor' },
  { value: 'fifth_floor', label: 'Fifth floor' },
];

export interface MapFloorText {
  id: string;
  short: string;
  label: string;
  name: string;
  desc: string;
}

export interface MapEntrance {
  floorId: string;
  locationId: string;
  name: string;
}

const floor = (id: string, short: string, label: string, name: string, desc: string): MapFloorText => ({ id, short, label, name, desc });

export const mapPageBlock = defineBlock({
  key: 'map-page',
  group: 'Mall map',
  label: 'Mall map settings & text',
  description:
    'Floor names, entrance points and every label on the interactive mall map. Store positions are set on each store (Map floor + Units). In texts, words in {curly brackets} are filled in automatically — keep them.',
  page: '/mall-map',
  fields: [
    {
      key: 'floors',
      label: 'Floors',
      type: 'list',
      itemName: 'floor',
      itemTitle: 'name',
      max: 7,
      help: 'Change the wording only. Each floor must appear once; a missing floor uses its original wording.',
      fields: [
        { key: 'id', label: 'Floor', type: 'select', options: FLOOR_OPTIONS, required: true },
        { key: 'short', label: 'Short code on the floor button', type: 'text', half: true },
        { key: 'label', label: 'Floor button label', type: 'text', half: true },
        { key: 'name', label: 'Full name (directions, directory, search)', type: 'text' },
        { key: 'desc', label: 'Description (shown on hover)', type: 'text' },
      ],
      itemDefaults: { id: 'ground_floor', short: '', label: '', name: '', desc: '' },
    },
    {
      key: 'entrances',
      label: '"You are here" entrance points',
      type: 'list',
      itemName: 'entrance',
      itemTitle: 'name',
      help: 'Shown in the QR / entrance picker. Unit is the unit or shutter id on that floor, e.g. A101.',
      fields: [
        { key: 'name', label: 'Name', type: 'text', required: true },
        { key: 'floorId', label: 'Floor', type: 'select', options: FLOOR_OPTIONS, half: true },
        { key: 'locationId', label: 'Unit', type: 'text', half: true },
      ],
      itemDefaults: { name: '', floorId: 'ground_floor', locationId: '' },
    },
    t('defaultStartName', 'Default starting point name', 'Used for directions until a visitor picks an entrance.'),
    t('mainEntrance', 'Fallback starting point name'),
    t('youAreHere', 'Map: "you are here" marker'),
    t('startPoint', 'Map: start marker fallback'),

    t('loadingTitle', 'Loading screen: title'),
    t('loadingText', 'Loading screen: message'),

    t('searchPlaceholder', 'Top search box hint'),
    t('allCategories', 'Top category menu: all option', '{count} = number of categories.'),
    t('sidebarSearchPlaceholder', 'Side panel search hint'),
    t('sidebarAllCategories', 'Side panel category menu: all option'),
    t('amenitiesGroup', 'Side panel category menu: amenities group'),
    t('unitLabel', 'Unit label', '{unit} = unit id.'),
    t('notPlaced', 'Label for stores not yet placed on the map'),

    t('peekStep', 'Mobile bar: current step', '{n} = step number, {text} = step.'),
    t('navigating', 'Mobile bar: fallback while navigating'),
    t('walkTime', 'Walking time', '{minutes} = minutes.'),
    t('next', 'Mobile bar: next'),
    t('finish', 'Mobile bar: finish'),
    t('go', 'Mobile bar: directions button'),
    t('floorStores', 'Mobile bar: stores on floor', '{count} = number of stores.'),
    t('tapToBrowse', 'Mobile bar: browse hint'),

    t('activeNavigation', 'Directions: label'),
    t('navTo', 'Directions: heading', '{name} = destination.'),
    t('navFrom', 'Directions: starting point', '{name} = start.'),
    t('stepOf', 'Directions: step counter', '{n} = step, {total} = steps.'),
    t('destinationFloor', 'Directions: last-step note'),
    t('prev', 'Directions: previous button'),
    t('nextStep', 'Directions: next button'),
    t('finishNavigation', 'Directions: finish button'),
    t('routeSteps', 'Directions: steps list heading'),
    t('routeStepsHint', 'Directions: steps list hint'),
    t('current', 'Directions: current step tag'),
    t('minimize', 'Minimize button'),
    t('endNavigation', 'Directions: end button'),

    t('floorLevel', 'Store panel: floor label'),
    t('unitShutter', 'Store panel: unit label'),
    t('getDirections', 'Store panel: directions button'),
    t('storeProfile', 'Store panel: store page button'),
    t('storeDirectory', 'Store panel: directory button'),

    t('directoryTitle', 'Floor directory: heading', '{floor} = floor name.'),
    t('storesCount', 'Floor directory: store count', '{count} = number.'),
    t('noMatch', 'Floor directory: nothing matches', '{floor} = floor name.'),
    t('clearFilter', 'Floor directory: clear filter'),
    t('statShops', 'Floor stats: shops'),
    t('statRestrooms', 'Floor stats: restrooms'),
    t('statLifts', 'Floor stats: lifts'),

    t('elevatorTo', 'Map: lift label', '{floor} = e.g. "To First Floor".'),
    t('stairsTo', 'Map: stairs label', '{floor} = e.g. "To First Floor".'),
    t('transitTo', 'Map: leaving towards', '{floor} = floor name.'),
    t('transitFrom', 'Map: arriving from', '{floor} = floor name.'),

    t('zoomIn', 'Controls: zoom in'),
    t('zoomOut', 'Controls: zoom out'),
    t('zoomFit', 'Controls: fit floor'),
    t('qrButton', 'Controls: entrance picker'),

    t('qrTitle', 'Entrance picker: title'),
    t('qrSubtitle', 'Entrance picker: subtitle'),
    t('qrPresetLabel', 'Entrance picker: list heading'),
    t('qrShutter', 'Entrance picker: unit prefix'),
    t('qrCustomLabel', 'Entrance picker: custom heading'),
    t('qrCustomPlaceholder', 'Entrance picker: custom hint'),
    t('qrApply', 'Entrance picker: apply button'),
    t('qrCustomPoint', 'Entrance picker: custom point name', '{id} = unit.'),
    t('qrPoint', 'Entrance picker: point name', '{id} = unit.'),
  ],
  defaults: {
    floors: [
      floor('lower_ground_floor', 'LG', 'Lower Ground', 'Lower Ground', 'Basement Parking & Groceries'),
      floor('ground_floor', 'G', 'Ground Floor', 'Ground Floor', 'Jewelry, Tech & Banking'),
      floor('first_floor', '1F', '1st Floor', 'First Floor', 'Fashion, Denim & Footwear'),
      floor('second_floor', '2F', '2nd Floor', 'Second Floor', 'Kids, Couture & Java Cafe'),
      floor('third_floor', '3F', '3rd Floor', 'Third Floor', 'Education & Luxury Spas'),
      floor('fourth_floor', '4F', '4th Floor', 'Fourth Floor', 'Food Court & Engineering'),
      floor('fifth_floor', '5F', '5th Floor', 'Fifth Floor', 'QFX Cineplex & 4D VR'),
    ] as MapFloorText[],
    entrances: [
      { floorId: 'ground_floor', locationId: 'A101', name: 'Ground Floor Main Entrance (A101)' },
      { floorId: 'ground_floor', locationId: 'A115', name: 'Ground Floor East Wing Entry (A115)' },
      { floorId: 'ground_floor', locationId: 'LIFT-U', name: 'Ground Floor North Elevators' },
      { floorId: 'first_floor', locationId: 'A201', name: 'First Floor North Landing (A201)' },
      { floorId: 'second_floor', locationId: 'A305', name: 'Second Floor Central Hub (A305)' },
      { floorId: 'third_floor', locationId: 'A409', name: 'Third Floor Plaza Entrance (A409)' },
      { floorId: 'fourth_floor', locationId: 'A509', name: 'Fourth Floor Food Court Entry (A509)' },
      { floorId: 'fifth_floor', locationId: 'L501', name: 'Fifth Floor QFX Cinemas Lobby (L501)' },
    ] as MapEntrance[],
    defaultStartName: 'Ground Floor Main Entrance',
    mainEntrance: 'Main Entrance',
    youAreHere: 'You Are Here',
    startPoint: 'Start Point',

    loadingTitle: 'Pokhara Trade Mall',
    loadingText: 'Loading Interactive Floor Plans & Wayfinding...',

    searchPlaceholder: 'Search stores, brands, eateries, services, shutter...',
    allCategories: 'All Categories ({count})',
    sidebarSearchPlaceholder: 'Search stores, brands, eateries...',
    sidebarAllCategories: 'All Categories & Outlets',
    amenitiesGroup: 'Amenities & Transit',
    unitLabel: 'Unit {unit}',
    notPlaced: 'Location coming soon',

    peekStep: 'Step {n}: {text}',
    navigating: 'Navigating',
    walkTime: 'Est. {minutes} min walk',
    next: 'Next',
    finish: 'Finish',
    go: 'Go',
    floorStores: '{count} Stores & Outlets',
    tapToBrowse: 'Tap to browse list',

    activeNavigation: 'Active Navigation',
    navTo: 'To {name}',
    navFrom: 'From: {name}',
    stepOf: 'Step {n} of {total}',
    destinationFloor: 'Destination Floor',
    prev: '← Prev',
    nextStep: 'Next Step',
    finishNavigation: 'Finish Navigation',
    routeSteps: 'Route Steps',
    routeStepsHint: 'Click step to view floor',
    current: 'Current',
    minimize: 'Minimize to Map',
    endNavigation: 'End Navigation',

    floorLevel: 'Floor Level',
    unitShutter: 'Unit / Shutter',
    getDirections: 'Get Directions',
    storeProfile: 'Store Profile',
    storeDirectory: 'Store Directory',

    directoryTitle: '{floor} Directory',
    storesCount: '{count} Stores',
    noMatch: 'No stores match the active category filter on {floor}.',
    clearFilter: 'Clear Filter',
    statShops: 'Shops & Eateries',
    statRestrooms: 'Restrooms',
    statLifts: 'Lifts & Stairs',

    elevatorTo: 'Elevator {floor}',
    stairsTo: 'Stairs {floor}',
    transitTo: 'To {floor}',
    transitFrom: 'From {floor}',

    zoomIn: 'Zoom In',
    zoomOut: 'Zoom Out',
    zoomFit: 'Fit Floor to Screen',
    qrButton: 'Simulate QR Code Entrance / You Are Here',

    qrTitle: 'Simulate Entrance QR Scan',
    qrSubtitle: 'Set your current "You Are Here" position',
    qrPresetLabel: 'Select Entrance Preset',
    qrShutter: 'Shutter',
    qrCustomLabel: 'Or Enter Custom QR Location String',
    qrCustomPlaceholder: 'e.g. ground_floor:G-01',
    qrApply: 'Apply',
    qrCustomPoint: 'Custom Point ({id})',
    qrPoint: 'Point ({id})',
  },
});

export const mapBlocks: BlockDef<any>[] = [mapPageBlock];
