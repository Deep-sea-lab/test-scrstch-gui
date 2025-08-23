import { applyMiddleware, compose, combineReducers } from 'redux';
import throttle from 'redux-throttle';
import decks from '../lib/libraries/decks/index.jsx';
import alertsReducer, { alertsInitialState } from './alerts';
import assetDragReducer, { assetDragInitialState } from './asset-drag';
import cardsReducer, { cardsInitialState } from './cards';
import colorPickerReducer, { colorPickerInitialState } from './color-picker';
import connectionModalReducer, { connectionModalInitialState } from './connection-modal';
import customProceduresReducer, { customProceduresInitialState } from './custom-procedures';
import blockDragReducer, { blockDragInitialState } from './block-drag';
import editorTabReducer, { editorTabInitialState } from './editor-tab';
import hoveredTargetReducer, { hoveredTargetInitialState } from './hovered-target';
import menuReducer, { menuInitialState } from './menus';
import micIndicatorReducer, { micIndicatorInitialState } from './mic-indicator';
import modalReducer, { modalsInitialState } from './modals';
import modeReducer, { modeInitialState } from './mode';
import monitorReducer, { monitorsInitialState } from './monitors';
import monitorLayoutReducer, { monitorLayoutInitialState } from './monitor-layout';
import projectChangedReducer, { projectChangedInitialState } from './project-changed';
import projectStateReducer, { projectStateInitialState } from './project-state';
import projectTitleReducer, { projectTitleInitialState } from './project-title';
import fontsLoadedReducer, { fontsLoadedInitialState } from './fonts-loaded';
import restoreDeletionReducer, { restoreDeletionInitialState } from './restore-deletion';
import stageSizeReducer, { stageSizeInitialState } from './stage-size';
import targetReducer, { targetsInitialState } from './targets';
import themeReducer, { themeInitialState } from './theme';
import timeoutReducer, { timeoutInitialState } from './timeout';
import timeTravelReducer, { timeTravelInitialState } from './time-travel';
import toolboxReducer, { toolboxInitialState } from './toolbox';
import twReducer, { twInitialState } from './tw';
import customStageSizeReducer, { customStageSizeInitialState } from './custom-stage-size';
import vmReducer, { vmInitialState } from './vm';
import vmStatusReducer, { vmStatusInitialState } from './vm-status';
import workspaceMetricsReducer, { workspaceMetricsInitialState } from './workspace-metrics';

/**
 * Combined reducer for the GUI state.
 * @type {Function}
 */
const guiReducer = combineReducers({
  alerts: alertsReducer,
  assetDrag: assetDragReducer,
  blockDrag: blockDragReducer,
  cards: cardsReducer,
  colorPicker: colorPickerReducer,
  connectionModal: connectionModalReducer,
  customStageSize: customStageSizeReducer,
  customProcedures: customProceduresReducer,
  editorTab: editorTabReducer,
  mode: modeReducer,
  hoveredTarget: hoveredTargetReducer,
  stageSize: stageSizeReducer,
  menus: menuReducer,
  micIndicator: micIndicatorReducer,
  modals: modalReducer,
  monitors: monitorReducer,
  monitorLayout: monitorLayoutReducer,
  projectChanged: projectChangedReducer,
  projectState: projectStateReducer,
  projectTitle: projectTitleReducer,
  fontsLoaded: fontsLoadedReducer,
  restoreDeletion: restoreDeletionReducer,
  targets: targetReducer,
  theme: themeReducer,
  timeout: timeoutReducer,
  timeTravel: timeTravelReducer,
  toolbox: toolboxReducer,
  tw: twReducer,
  vm: vmReducer,
  vmStatus: vmStatusReducer,
  workspaceMetrics: workspaceMetricsReducer,
});

/**
 * Redux middleware for GUI, applying throttle to optimize performance.
 * @type {Function}
 */
const guiMiddleware = compose(applyMiddleware(throttle(300, { leading: true, trailing: true })));

/**
 * Initial state for the GUI reducer.
 * @type {Object}
 */
const guiInitialState = {
  alerts: alertsInitialState,
  assetDrag: assetDragInitialState,
  blockDrag: blockDragInitialState,
  cards: cardsInitialState,
  colorPicker: colorPickerInitialState,
  connectionModal: connectionModalInitialState,
  customStageSize: customStageSizeInitialState,
  customProcedures: customProceduresInitialState,
  editorTab: editorTabInitialState,
  mode: modeInitialState,
  hoveredTarget: hoveredTargetInitialState,
  stageSize: stageSizeInitialState,
  menus: menuInitialState,
  micIndicator: micIndicatorInitialState,
  modals: modalsInitialState,
  monitors: monitorsInitialState,
  monitorLayout: monitorLayoutInitialState,
  projectChanged: projectChangedInitialState,
  projectState: projectStateInitialState,
  projectTitle: projectTitleInitialState,
  fontsLoaded: fontsLoadedInitialState,
  restoreDeletion: restoreDeletionInitialState,
  targets: targetsInitialState,
  theme: themeInitialState,
  timeout: timeoutInitialState,
  timeTravel: timeTravelInitialState,
  toolbox: toolboxInitialState,
  tw: twInitialState,
  vm: vmInitialState,
  vmStatus: vmStatusInitialState,
  workspaceMetrics: workspaceMetricsInitialState,
};

/**
 * Initialize player mode.
 * @param {Object} currentState - Current GUI state.
 * @returns {Object} Updated state with player mode settings.
 */
const initPlayer = (currentState) =>
  Object.assign({}, currentState, {
    mode: {
      isEmbedded: false,
      isFullScreen: currentState.mode.isFullScreen,
      isPlayerOnly: true,
      hasEverEnteredEditor: false,
    },
  });

/**
 * Initialize fullscreen mode.
 * @param {Object} currentState - Current GUI state.
 * @returns {Object} Updated state with fullscreen settings.
 */
const initFullScreen = (currentState) =>
  Object.assign({}, currentState, {
    mode: {
      isEmbedded: false,
      isFullScreen: true,
      isPlayerOnly: currentState.mode.isPlayerOnly,
      hasEverEnteredEditor: currentState.mode.hasEverEnteredEditor,
    },
  });

/**
 * Initialize embedded mode.
 * @param {Object} currentState - Current GUI state.
 * @returns {Object} Updated state with embedded mode settings.
 */
const initEmbedded = (currentState) =>
  Object.assign({}, currentState, {
    mode: {
      isEmbedded: true,
      isFullScreen: false,
      isPlayerOnly: true,
      hasEverEnteredEditor: false,
    },
  });

/**
 * Initialize tutorial card.
 * @param {Object} currentState - Current GUI state.
 * @param {string} deckId - ID of the tutorial deck to display.
 * @returns {Object} Updated state with tutorial card settings.
 */
const initTutorialCard = (currentState, deckId) =>
  Object.assign({}, currentState, {
    cards: {
      visible: true,
      content: decks,
      activeDeckId: deckId,
      expanded: true,
      step: 0,
      x: 0,
      y: 0,
      dragging: false,
    },
  });

/**
 * Initialize telemetry modal.
 * @param {Object} currentState - Current GUI state.
 * @returns {Object} Updated state with telemetry modal enabled.
 */
const initTelemetryModal = (currentState) =>
  Object.assign({}, currentState, {
    modals: {
      telemetryModal: true,
    },
  });

export {
  guiReducer as default,
  guiInitialState,
  guiMiddleware,
  initPlayer,
  initFullScreen,
  initEmbedded,
  initTutorialCard,
  initTelemetryModal,
};
