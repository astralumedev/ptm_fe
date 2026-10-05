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

const floor = (id: string, short: string, label: string, name: string, desc: string): MapFloorText => ({ id, short, label, name, desc });

export const mapPageBlock = defineBlock({
  key: 'map-page',
  group: 'Mall map',
  label: 'Mall map settings & text',
  description:
    'Floor names and every label on the interactive mall map. Shops, units, QR codes and store positions are edited in Map management. In texts, words in {curly brackets} are filled in automatically — keep them.',
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
    t('defaultStartName', 'Default starting point name', 'Used for directions until a visitor scans a QR code or picks where they are.'),
    t('mainEntrance', 'Fallback starting point name'),
    t('youAreHere', 'Map: "you are here" marker'),

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
    t('placesCount', 'Floor directory: place count', '{count} = number.'),
    t('placesHeading', 'Floor directory: places heading', 'Food court, ticket counters and other places from the Places list.'),
    t('otherGroup', 'Floor directory: stores with no category'),
    t('facilitiesHeading', 'Floor directory: facilities (screen readers)'),
    t('facilityHint', 'Floor directory: facility button tooltip'),
    t('facilityShown', 'Floor directory: facility highlighted note'),
    t('floorEmpty', 'Floor directory: floor has nothing yet', '{floor} = floor name.'),
    t('showOnMap', 'Floor directory: highlight places'),
    t('partOf', 'Place panel: belongs to a store', '{name} = store name.'),
    t('placesFilter', 'Category menus: places option'),


    t('zoomIn', 'Controls: zoom in'),
    t('zoomOut', 'Controls: zoom out'),
    t('zoomFit', 'Controls: fit floor'),
    t('qrButton', 'Controls: entrance picker'),

    t('hereTitle', 'Where are you: title'),
    t('hereSubtitle', 'Where are you: subtitle'),
    t('hereEmpty', 'Where are you: no points yet'),

    t('stepSameFloor', 'Directions: same floor', '{m} = metres, {name} = destination, {side} = side text.'),
    t('stepToTransit', 'Directions: to the lift/stairs', '{m}, {transit}, {direction}, {floor}.'),
    t('stepArrive', 'Directions: after the lift/stairs', '{m}, {name}, {side}, {floor}.'),
    t('sideLeft', 'Directions: on the left'),
    t('sideRight', 'Directions: on the right'),
    t('sideAhead', 'Directions: straight ahead'),
    t('wordLift', 'Word for lift'),
    t('wordStairs', 'Word for stairs'),
    t('wordUp', 'Word for up'),
    t('wordDown', 'Word for down'),
    t('transitBadge', 'Map: lift/stairs badge', '{transit}, {direction}, {floor}.'),
    t('noRoute', 'Directions: no route found'),
    t('continuing', 'Trip banner: continuing', '{name} = destination.'),
    t('changeTrip', 'Trip banner: change'),
    t('endTrip', 'Trip banner: end'),
    t('replay', 'Directions: replay walk'),
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
    defaultStartName: 'Ground Floor Main Entrance',
    mainEntrance: 'Main Entrance',
    youAreHere: 'You Are Here',

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

    directoryTitle: "What's on {floor}",
    storesCount: '{count} stores',
    noMatch: 'No stores match the active category filter on {floor}.',
    clearFilter: 'Clear Filter',
    placesCount: '{count} places',
    placesHeading: 'Places',
    otherGroup: 'More',
    facilitiesHeading: 'Facilities on this floor',
    facilityHint: 'Highlight on the map',
    facilityShown: 'Highlighted on the map. Tap one for directions, or tap the button again to clear.',
    floorEmpty: 'Nothing is listed on {floor} yet.',
    showOnMap: 'Show on map',
    partOf: 'Part of {name}',
    placesFilter: 'Places & facilities',


    zoomIn: 'Zoom In',
    zoomOut: 'Zoom Out',
    zoomFit: 'Fit Floor to Screen',
    qrButton: 'Where are you?',

    hereTitle: 'Where are you?',
    hereSubtitle: 'Scan any map QR code in the mall, or pick the one nearest to you.',
    hereEmpty: 'Map points will appear here soon.',

    stepSameFloor: 'Walk about {m} m to {name}, {side}.',
    stepToTransit: 'Walk about {m} m to the {transit} and go {direction} to {floor}.',
    stepArrive: 'On {floor}, walk about {m} m to {name}, {side}.',
    sideLeft: 'on your left',
    sideRight: 'on your right',
    sideAhead: 'straight ahead',
    wordLift: 'lift',
    wordStairs: 'stairs',
    wordUp: 'up',
    wordDown: 'down',
    transitBadge: 'Take the {transit} {direction} to {floor}',
    noRoute: "We couldn't find a walking route there yet. Ask at the information desk and we'll point the way.",
    continuing: 'Continuing to {name}',
    changeTrip: 'Change',
    endTrip: 'End',
    replay: 'Replay walk',
  },
});

export const mapBlocks: BlockDef<any>[] = [mapPageBlock];
