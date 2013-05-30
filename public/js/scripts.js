/*
 * Streetmix
 *
 * Front-end (mostly) by Marcin Wichary, Code for America fellow in 2013.
 *
 * Note: This code is really gnarly. It’s been done under a lot of time 
 * pressure and there’s a lot of shortcut and tech debt. Slowly going through
 * this all.
 */

var main = (function(){
"use strict";
  var main = {};

  // TODO all of the below in an array?
  var ENVIRONMENT_LOCAL = 0;
  var ENVIRONMENT_STAGING = 1;
  var ENVIRONMENT_PRODUCTION = 2;

  var SITE_URL_LOCAL = 'http://localhost:8000/';
  var SITE_URL_STAGING = 'http://streetmix-staging.herokuapp.com/';
  var SITE_URL_PRODUCTION = 'http://streetmix.net/';

  var API_URL_LOCAL = 'http://localhost:8080/';
  var API_URL_STAGING = 'https://streetmix-api-staging.herokuapp.com/';
  var API_URL_PRODUCTION = 'https://streetmix-api.herokuapp.com/';

  var IP_GEOCODING_API_URL = 'http://freegeoip.net/json/';

  var FACEBOOK_APP_ID = '162729607241489';

  var TILESET_IMAGE_VERSION = 13;
  var TILESET_WIDTH = 2622;
  var TILESET_HEIGHT = 384;
  var TILESET_POINT_PER_PIXEL = 2.0;
  var TILE_SIZE = 12; // pixels

  var IMAGES_TO_BE_LOADED = [
    'images/tiles.png',
    'images/ui/icons/noun_project_2.svg',
    'images/ui/icons/noun_project_536.svg',
    'images/ui/icons/noun_project_97.svg',
    'images/ui/icons/noun_project_72.svg',
    'images/ui/icons/noun_project_13130.svg'
  ];

  var WIDTH_TOOL_MULTIPLIER = 4;

  var CANVAS_HEIGHT = 480;
  var CANVAS_GROUND = 35;
  var CANVAS_BASELINE = CANVAS_HEIGHT - CANVAS_GROUND;

  var SEGMENT_Y_NORMAL = 265;
  var SEGMENT_Y_PALETTE = 20;
  var PALETTE_EXTRA_SEGMENT_PADDING = 4;

  var DRAG_OFFSET_Y_PALETTE = -340;
  var DRAG_OFFSET_Y_TOUCH_PALETTE = -100;
  var DRAG_OFFSET_Y_TOUCH = -50;

  var WIDTH_CHART_WIDTH = 500;
  var WIDTH_CHART_EMPTY_OWNER_WIDTH = 40;
  var WIDTH_CHART_MARGIN = 20;

  var DRAGGING_TYPE_NONE = 0;
  var DRAGGING_TYPE_MOVE = 1;
  var DRAGGING_TYPE_RESIZE = 2;

  var DRAGGING_TYPE_MOVE_TRANSFER = 1;
  var DRAGGING_TYPE_MOVE_CREATE = 2;

  var DRAGGING_MOVE_HOLE_WIDTH = 40;

  var STATUS_MESSAGE_HIDE_DELAY = 5000;
  var WIDTH_EDIT_INPUT_DELAY = 200;
  var TOUCH_SEGMENT_FADEOUT_DELAY = 5000;
  var SHORT_DELAY = 100;

  var SAVE_CHANGES_DELAY = 500;

  var MAX_DRAG_DEGREE = 20;

  var MAX_STREET_NAME_WIDTH = 30;

  var STREET_WIDTH_CUSTOM = -1;

  var DEFAULT_NAME = 'Market St';
  var DEFAULT_STREET_WIDTH = 80;
  var DEFAULT_STREET_WIDTHS = [40, 60, 80];

  var MIN_CUSTOM_STREET_WIDTH = 10;
  var MAX_CUSTOM_STREET_WIDTH = 200;
  var MIN_SEGMENT_WIDTH = 2;
  var MAX_SEGMENT_WIDTH = 150;

  var RESIZE_TYPE_INITIAL = 0;
  var RESIZE_TYPE_INCREMENT = 1;
  var RESIZE_TYPE_DRAGGING = 2;
  var RESIZE_TYPE_PRECISE_DRAGGING = 3;
  var RESIZE_TYPE_TYPING = 4;

  var IMPERIAL_METRIC_MULTIPLIER = 30 / 100;
  var IMPERIAL_COUNTRY_CODES = ['US'];

  var WIDTH_INPUT_CONVERSION = [
    { text: 'm', multiplier: 1 / IMPERIAL_METRIC_MULTIPLIER },
    { text: 'cm', multiplier: 1 / 100 / IMPERIAL_METRIC_MULTIPLIER },
    { text: '"', multiplier: 1 / 12 },
    { text: 'inch', multiplier: 1 / 12 },
    { text: 'inches', multiplier: 1 / 12 },
    { text: '\'', multiplier: 1 },
    { text: 'ft', multiplier: 1 },
    { text: 'feet', multiplier: 1 }
  ];

  var SEGMENT_WIDTH_RESOLUTION_IMPERIAL = .25;
  var SEGMENT_WIDTH_CLICK_INCREMENT_IMPERIAL = .5;
  var SEGMENT_WIDTH_DRAGGING_RESOLUTION_IMPERIAL = .5;

  // don't use const because of rounding problems
  var SEGMENT_WIDTH_RESOLUTION_METRIC = 1 / 3; // .1 / IMPERIAL_METRIC_MULTIPLER
  var SEGMENT_WIDTH_CLICK_INCREMENT_METRIC = 2 / 3; // .2 / IMPERIAL_METRIC_MULTIPLER
  var SEGMENT_WIDTH_DRAGGING_RESOLUTION_METRIC = 2 / 3; // .2 / IMPERIAL_METRIC_MULTIPLER

  var MIN_WIDTH_EDIT_CANVAS_WIDTH = 120;
  var WIDTH_EDIT_MARGIN = 20;

  var NORMALIZE_PRECISION = 5;
  var METRIC_PRECISION = 3;
  var WIDTH_ROUNDING = .01;

  var SEGMENT_WARNING_OUTSIDE = 1;
  var SEGMENT_WARNING_WIDTH_TOO_SMALL = 2;
  var SEGMENT_WARNING_WIDTH_TOO_LARGE = 3;

  var KEY_LEFT_ARROW = 37;
  var KEY_RIGHT_ARROW = 39;
  var KEY_ENTER = 13;
  var KEY_BACKSPACE = 8;
  var KEY_DELETE = 46;
  var KEY_ESC = 27;
  var KEY_D = 68;
  var KEY_Y = 89;
  var KEY_Z = 90;
  var KEY_EQUAL = 187; // = or +
  var KEY_MINUS = 189;

  var PRETTIFY_WIDTH_OUTPUT_MARKUP = 1;
  var PRETTIFY_WIDTH_OUTPUT_NO_MARKUP = 2;
  var PRETTIFY_WIDTH_INPUT = 3;

  var SETTINGS_UNITS_IMPERIAL = 1;
  var SETTINGS_UNITS_METRIC = 2;

  var IMPERIAL_VULGAR_FRACTIONS = {
    '.125': '⅛',
    '.25': '¼',
    '.375': '⅜',
    '.5': '½',
    '.625': '⅝',
    '.75': '¾',
    '.875': '⅞'
  };  

  var CSS_TRANSFORMS = ['webkitTransform', 'MozTransform', 'transform'];

  var SEGMENT_OWNER_CAR = 'car';
  var SEGMENT_OWNER_BIKE = 'bike';
  var SEGMENT_OWNER_PEDESTRIAN = 'pedestrian';
  var SEGMENT_OWNER_PUBLIC_TRANSIT = 'public-transit';
  var SEGMENT_OWNER_NATURE = 'nature';

  var SEGMENT_OWNERS = {
    'car': {
      owner: SEGMENT_OWNER_CAR,
      imageUrl: 'images/ui/icons/noun_project_72.svg',
      imageSize: .8
    },
    'public-transit': {
      owner: SEGMENT_OWNER_PUBLIC_TRANSIT,
      imageUrl: 'images/ui/icons/noun_project_97.svg',
      imageSize: .8
    },
    'bike': {
      owner: SEGMENT_OWNER_BIKE,
      imageUrl: 'images/ui/icons/noun_project_536.svg',
      imageSize: 1.1
    },
    'pedestrian': {
      owner: SEGMENT_OWNER_PEDESTRIAN,
      imageUrl: 'images/ui/icons/noun_project_2.svg',
      imageSize: .8
    },
    'nature': {
      owner: SEGMENT_OWNER_NATURE,
      imageUrl: 'images/ui/icons/noun_project_13130.svg',
      imageSize: .8
    }
  };

  var SEGMENT_INFO = {
    'sidewalk': {
      name: 'Sidewalk',
      owner: SEGMENT_OWNER_PEDESTRIAN,
      defaultWidth: 6,
      minWidth: 6,
      graphics: {
        center: { x: 3, y: 5, width: 4, height: 15 },
        repeat: { x: 1, y: 5, width: 1, height: 15 }
      }
    },
    "sidewalk-tree": {
      name: 'Sidewalk w/ a small tree',
      owner: SEGMENT_OWNER_NATURE,
      zIndex: -1,
      defaultWidth: 4,
      graphics: {
        center: { x: 13, y: 5, width: 6, height: 15 },
        repeat: { x: 1, y: 5, width: 1, height: 15 }
      }
    },
    "sidewalk-tree-big": {
      name: 'Sidewalk w/ a big tree',
      owner: SEGMENT_OWNER_NATURE,
      defaultWidth: 4,
      zIndex: -1,
      graphics: {
        center: { x: 158, y: 0, width: 11, height: 20, offsetY: -5 },
        repeat: { x: 1, y: 5, width: 1, height: 15 }
      }
    },
    "sidewalk-lamp-right": {
      name: 'Sidewalk w/ a lamp',
      group: 'sidewalk',
      owner: SEGMENT_OWNER_PEDESTRIAN,
      defaultWidth: 4,
      graphics: {
        center: { width: 0, height: 15 },
        repeat: { x: 1, y: 5, width: 1, height: 15 },
        right: { x: 102, y: 0, offsetX: -2, offsetY: -5, width: 4, height: 20 }
      }
    },
    "sidewalk-lamp-both": {
      name: 'Sidewalk w/ a lamp',
      group: 'sidewalk',
      owner: SEGMENT_OWNER_PEDESTRIAN,
      defaultWidth: 6,
      graphics: {
        center: { x: 150, y: 0, offsetY: -5, width: 6, height: 20 },
        repeat: { x: 1, y: 5, width: 1, height: 15 },
      }
    },
    "sidewalk-lamp-left": {
      name: 'Sidewalk w/ a lamp',
      group: 'sidewalk',
      owner: SEGMENT_OWNER_PEDESTRIAN,
      defaultWidth: 4,
      graphics: {
        center: { width: 0, height: 15 },
        repeat: { x: 1, y: 5, width: 1, height: 15 },
        left: { x: 107, y: 0, offsetX: -2, offsetY: -5, width: 4, height: 20 }
      }
    },
    "planting-strip": {
      name: 'Planting strip',
      owner: SEGMENT_OWNER_NATURE,
      defaultWidth: 4,
      graphics: {
        center: { width: 0, height: 15 },
        repeat: { x: 8, y: 5, width: 4, height: 15 }
      }
    },
    "bike-lane-inbound": {
      name: 'Bike lane',
      subname: 'Inbound',
      owner: SEGMENT_OWNER_BIKE,
      defaultWidth: 6,
      graphics: {
        center: { x: 92, y: 5, width: 4, height: 15 },
        repeat: { x: 90, y: 5, width: 1, height: 15 }
      }
    },
    "bike-lane-outbound": {
      name: 'Bike lane',
      subname: 'Outbound',
      owner: SEGMENT_OWNER_BIKE,
      defaultWidth: 6,
      graphics: {
        center: { x: 97, y: 5, width: 4, height: 15 },
        repeat: { x: 90, y: 5, width: 1, height: 15 }
      }
    },
    "parking-lane": {
      name: 'Parking lane',
      owner: SEGMENT_OWNER_CAR,
      defaultWidth: 8,
      minWidth: 8,
      maxWidth: 10,
      graphics: {
        center: { x: 50, y: 5, width: 8, height: 15 },
        repeat: { x: 26, y: 5, width: 1, height: 15 },
        left: { x: 46, y: 5, width: 3, height: 15 }
      }
    },
    "drive-lane-inbound": {
      name: 'Drive lane',
      subname: 'Inbound',
      owner: SEGMENT_OWNER_CAR,
      defaultWidth: 10,
      minWidth: 9,
      maxWidth: 12,
      graphics: {
        center: { x: 28, y: 5, width: 8, height: 15 },
        repeat: { x: 26, y: 5, width: 1, height: 15 }
      }
    },
    "drive-lane-outbound": {
      name: 'Drive lane',
      subname: 'Outbound',
      owner: SEGMENT_OWNER_CAR,
      defaultWidth: 10,
      minWidth: 9,
      maxWidth: 12,
      graphics: {
        center: { x: 37, y: 5, width: 8, height: 15 },
        repeat: { x: 26, y: 5, width: 1, height: 15 }
      }
    },
    "turn-lane": {
      name: 'Turn lane',
      owner: SEGMENT_OWNER_CAR,
      defaultWidth: 10,
      minWidth: 9,
      maxWidth: 12,
      graphics: {
        center: { x: 81, y: 5, width: 8, height: 15 },
        repeat: { x: 26, y: 5, width: 1, height: 15 }
      }
    },
    "bus-lane-inbound": {
      name: 'Bus lane',
      subname: 'Inbound',
      owner: SEGMENT_OWNER_PUBLIC_TRANSIT,
      defaultWidth: 10,
      minWidth: 9,
      maxWidth: 12,
      graphics: {
        center: { x: 59, y: 5, width: 10, height: 15 },
        repeat: { x: 26, y: 5, width: 1, height: 15 }
      }
    },
    "bus-lane-outbound": {
      name: 'Bus lane',
      subname: 'Outbound',
      owner: SEGMENT_OWNER_PUBLIC_TRANSIT,
      defaultWidth: 10,
      minWidth: 9,
      maxWidth: 12,
      graphics: {
        center: { x: 70, y: 5, width: 10, height: 15 },
        repeat: { x: 26, y: 5, width: 1, height: 15 }
      }
    },
    "small-median": {
      name: 'Small median',
      owner: SEGMENT_OWNER_CAR,
      defaultWidth: 4,
      graphics: {
        center: { x: 22, y: 5, width: 3, height: 15 },
        repeat: { x: 20, y: 5, width: 1, height: 15 }
      }
    },
  };

  var DEFAULT_SEGMENTS = {
    40: [
      { type: "sidewalk", width: 6 },
      { type: "planting-strip", width: 4 },
      { type: "drive-lane-inbound", width: 10 },
      { type: "drive-lane-outbound", width: 10 },
      { type: "planting-strip", width: 4 },
      { type: "sidewalk", width: 6 }
    ],
    60: [
      { type: "sidewalk", width: 6 },
      { type: "sidewalk-tree", width: 6 },
      { type: "bike-lane-inbound", width: 6 },
      { type: "drive-lane-inbound", width: 10 },
      { type: "drive-lane-outbound", width: 10 },
      { type: "planting-strip", width: 4 },
      { type: "bike-lane-outbound", width: 6 },
      { type: "sidewalk-tree", width: 6 },
      { type: "sidewalk", width: 6 }
    ],
    80: [
      { type: "sidewalk", width: 6 },
      { type: "sidewalk-tree-big", width: 4 },
      { type: "sidewalk-lamp-right", width: 2 },
      { type: "bike-lane-inbound", width: 6 },
      { type: "drive-lane-inbound", width: 10 },
      { type: "drive-lane-inbound", width: 10 },
      { type: "sidewalk-lamp-both", width: 4 },
      { type: "drive-lane-outbound", width: 10 },
      { type: "drive-lane-outbound", width: 10 },
      { type: "bike-lane-outbound", width: 6 },
      { type: "sidewalk-lamp-left", width: 2 },
      { type: "sidewalk-tree-big", width: 4 },
      { type: "sidewalk", width: 6 }
    ]
  };

  var USER_ID_COOKIE = 'user_id';
  var SIGN_IN_TOKEN_COOKIE = 'login_token';

  var LOCAL_STORAGE_SETTINGS_ID = 'settings';
  var LOCAL_STORAGE_SIGN_IN_ID = 'sign-in';

  // only undoable
  var street = {
    width: null,
    occupiedWidth: null, // don't save
    remainingWidth: null, // don't save

    name: null,

    segments: []
  };

  var settings = {
    units: null,
    unitsSelectedManually: null
  };

  var draggingResize = {
    segmentEl: null,
    floatingEl: null,
    mouseX: null,
    mouseY: null,
    elX: null,
    elY: null,
    origX: null,
    origWidth: null,
    right: false
  };

  var draggingMove = {
    type: null,
    active: false,
    segmentBeforeEl: null,
    segmentAfterEl: null,
    mouseX: null,
    mouseY: null,
    el: null,
    elX: null,
    elY: null,
    origEl: null,
    origWidth: null,
    floatingElVisible: false
  };

  var initializing = false;

  var widthEditHeld = false;
  var resizeSegmentTimerId = -1;

  var infoBubbleVisible = false;
  var infoButtonHoverTimerId = -1;

  var streetSectionCanvasLeft;

  var images;
  var imagesToBeLoaded;

  var bodyLoaded;
  var readyStateCompleteLoaded;  

  var saveChangesTimerId = -1;
  var saveChangesIncomplete = false;

  var signedIn = false;
  var signInLoaded = false;
  var signInData = {};

  var lastStreet;
  var undoStack = [];
  var undoPosition = 0;
  var ignoreStreetChanges = false;

  var draggingType = DRAGGING_TYPE_NONE;

  var mouseX;
  var mouseY;

  var system = {
    environment: ENVIRONMENT_LOCAL,
    apiUrl: null,
    touch: false,
    hiDpi: 1.0,
    cssTransform: false
  };

  var segmentWidthResolution;
  var segmentWidthClickIncrement;
  var segmentWidthDraggingResolution;


  // HELPER FUNCTIONS
  // -------------------------------------------------------------------------

  function _createTimeout(fn, data, delay) {
    window.setTimeout(function() { fn.call(null, data); }, delay);
  }

  function _removeElFromDom(el) {
    if (el && el.parentNode) {
      el.parentNode.removeChild(el);
    }
  }

  function _getElAbsolutePos(el) {
    var pos = [0, 0];

    do {
      pos[0] += el.offsetLeft + (el.cssTransformLeft || 0);
      pos[1] += el.offsetTop + (el.cssTransformTop || 0);

      el = el.offsetParent;
    } while (el);

    return pos;
  }

  // -------------------------------------------------------------------------

  function _drawSegmentImage(ctx, sx, sy, sw, sh, dx, dy, dw, dh) {
    if (!sw || !sh || !dw || !dh) {
      return;
    }

    ctx.drawImage(images['images/tiles.png'],
        sx * TILESET_POINT_PER_PIXEL, sy * TILESET_POINT_PER_PIXEL, 
        sw * TILESET_POINT_PER_PIXEL, sh * TILESET_POINT_PER_PIXEL,
        dx * system.hiDpi, dy * system.hiDpi, 
        dw * system.hiDpi, dh * system.hiDpi);
  }

 function _setSegmentContents(el, type, segmentWidth, isTool) {
    var segmentInfo = SEGMENT_INFO[type];

    if (segmentInfo.graphics.center && 
        typeof segmentInfo.graphics.center.width != 'undefined') {
      var realWidth = segmentInfo.graphics.center.width;
    } else {
      var realWidth = segmentInfo.defaultWidth;
    }

    var multiplier = isTool ? (WIDTH_TOOL_MULTIPLIER / TILE_SIZE) : 1;

    var bkPositionX = (segmentInfo.graphics.center.x || 0) * TILE_SIZE;
    var bkPositionY = (segmentInfo.graphics.center.y || 0) * TILE_SIZE;

    var left = 0;
    var top = isTool ? SEGMENT_Y_PALETTE : SEGMENT_Y_NORMAL;
    var width = realWidth * TILE_SIZE;
    var height = CANVAS_BASELINE;

    // center properly
    var segmentRealWidth = segmentWidth / TILE_SIZE / multiplier;
    left += (segmentRealWidth - realWidth) * TILE_SIZE / 2;

    // sticking out
    var maxWidth = segmentWidth;
    if (!isTool) {
      if (maxWidth < realWidth * TILE_SIZE) {
        maxWidth = realWidth * TILE_SIZE;

        left = 0;
      }
    }

    var canvasLeft = (segmentWidth - maxWidth) / 2;

    var canvasOffsetX = 0;

    if (segmentInfo.graphics.left && segmentInfo.graphics.left.offsetX < 0) {
      var leftOffset = -segmentInfo.graphics.left.offsetX * TILE_SIZE;

      canvasLeft -= leftOffset;
      maxWidth += leftOffset;
    }

    if (segmentInfo.graphics.right && segmentInfo.graphics.right.offsetX < 0) {
      canvasOffsetX = -segmentInfo.graphics.right.offsetX * TILE_SIZE;

      maxWidth += canvasOffsetX;
    }

    var hoverBkEl = document.createElement('div');
    hoverBkEl.classList.add('hover-bk');


    var canvasEl = document.createElement('canvas');
    canvasEl.classList.add('image');
    canvasEl.width = maxWidth * system.hiDpi;
    canvasEl.height = height * system.hiDpi;
    canvasEl.style.width = maxWidth + 'px';
    canvasEl.style.height = height + 'px';

    if (!isTool) {
      canvasEl.style.left = canvasLeft + 'px';
    } else {
      canvasEl.style.left = 0;
    }

    var ctx = canvasEl.getContext('2d');

    if (segmentInfo.graphics.repeat) {
      var repeatPositionX = segmentInfo.graphics.repeat.x * TILE_SIZE;
      var repeatPositionY = (segmentInfo.graphics.repeat.y || 0) * TILE_SIZE;
      var w = segmentInfo.graphics.repeat.width * TILE_SIZE * multiplier;

      var count = Math.floor((segmentWidth) / w + 1);

      if (segmentWidth < maxWidth) {
        var repeatStartX = -canvasLeft;
      } else {
        var repeatStartX = -(segmentWidth - maxWidth) - canvasOffsetX;
      }

      if (isTool) {
        repeatStartX = 0;
      }

      for (var i = 0; i < count; i++) {
        // remainder
        if (i == count - 1) {
          w = segmentWidth - (count - 1) * w;
        }

        _drawSegmentImage(ctx,
          repeatPositionX, repeatPositionY, 
          w, segmentInfo.graphics.repeat.height * TILE_SIZE, 
          (repeatStartX + (i * segmentInfo.graphics.repeat.width) * TILE_SIZE) * multiplier, 
          top + (multiplier * TILE_SIZE * (segmentInfo.graphics.repeat.offsetY || 0)), 
          w, 
          segmentInfo.graphics.repeat.height * TILE_SIZE * multiplier);
      }
    }      

    if (segmentInfo.graphics.left) {
      var leftPositionX = segmentInfo.graphics.left.x * TILE_SIZE;
      var leftPositionY = (segmentInfo.graphics.left.y || 0) * TILE_SIZE;

      var w = segmentInfo.graphics.left.width * TILE_SIZE;

      _drawSegmentImage(ctx,
          leftPositionX, leftPositionY, 
          w, segmentInfo.graphics.left.height * TILE_SIZE, 
          0,
          top + (multiplier * TILE_SIZE * (segmentInfo.graphics.left.offsetY || 0)), 
          w * multiplier, segmentInfo.graphics.left.height * TILE_SIZE * multiplier);
    }

    if (segmentInfo.graphics.right) {
      var rightPositionX = segmentInfo.graphics.right.x * TILE_SIZE;
      var rightPositionY = (segmentInfo.graphics.right.y || 0) * TILE_SIZE;

      var w = segmentInfo.graphics.right.width * TILE_SIZE;

      var rightTargetX = maxWidth - segmentInfo.graphics.right.width * TILE_SIZE * multiplier;

      if (isTool) {
        rightTargetX += (segmentInfo.graphics.right.offsetX || 0) * TILE_SIZE;
      }

      _drawSegmentImage(ctx,
        rightPositionX, rightPositionY, 
        w, segmentInfo.graphics.right.height * TILE_SIZE,
        rightTargetX,
        top + (multiplier * TILE_SIZE * (segmentInfo.graphics.right.offsetY || 0)), 
        w * multiplier, segmentInfo.graphics.right.height * TILE_SIZE * multiplier);
    }

    _drawSegmentImage(ctx,
      bkPositionX, bkPositionY, 
      width, segmentInfo.graphics.center.height * TILE_SIZE, 
      left * multiplier, 
      top + (multiplier * TILE_SIZE * (segmentInfo.graphics.center.offsetY || 0)), 
      width * multiplier, segmentInfo.graphics.center.height * TILE_SIZE * multiplier);

    _removeElFromDom(el.querySelector('canvas'));
    el.appendChild(canvasEl);

    _removeElFromDom(el.querySelector('.hover-bk'));
    el.appendChild(hoverBkEl);
  }


  function _onWidthEditClick(event) {
    var el = event.target;

    el.hold = true;
    widthEditHeld = true;

    if (document.activeElement != el) {
      el.select();
    }
  }

  function _onWidthEditMouseOver(event) {
    if (!widthEditHeld) {
      event.target.focus();
      event.target.select();
    }
  }

  function _onWidthEditMouseOut(event) {
    var el = event.target;
    if (!widthEditHeld) {
      _loseAnyFocus();
    }
  }

  function _loseAnyFocus() {
    document.body.focus();
  }

  function _onWidthEditFocus(event) {
    var el = event.target;

    el.oldValue = el.realValue;
    el.value = _prettifyWidth(el.realValue, PRETTIFY_WIDTH_INPUT);
  }

  function _onWidthEditBlur(event) {
    var el = event.target;

    _widthEditInputChanged(el, true);

    el.realValue = parseFloat(el.segmentEl.getAttribute('width'));
    el.value = _prettifyWidth(el.realValue, PRETTIFY_WIDTH_OUTPUT_NO_MARKUP);

    el.hold = false;
    widthEditHeld = false;
  }

  function _processWidthInput(widthInput) {
    widthInput = widthInput.replace(/ /g, '');
    widthInput = widthInput.replace(/,/g, '.');

    for (var i in IMPERIAL_VULGAR_FRACTIONS) {
      if (widthInput.indexOf(IMPERIAL_VULGAR_FRACTIONS[i]) != -1) {
        widthInput = widthInput.replace(new RegExp(IMPERIAL_VULGAR_FRACTIONS[i]), i);
      }
    }

    var width = parseFloat(widthInput);

    if (width) {
      // Default unit
      switch (settings.units) {
        case SETTINGS_UNITS_METRIC:
          var multiplier = 1 / IMPERIAL_METRIC_MULTIPLIER;
          break;
        case SETTINGS_UNITS_IMPERIAL:
          var multiplier = 1;
          break;
      }

      for (var i in WIDTH_INPUT_CONVERSION) {
        if (widthInput.match(new RegExp("[\\d\\.]" + 
              WIDTH_INPUT_CONVERSION[i].text + "$"))) {
          var multiplier = WIDTH_INPUT_CONVERSION[i].multiplier;
          break;
        }
      }

      width *= multiplier;
    }

    return width;
  }

  function _widthEditInputChanged(el, immediate) {
    window.clearTimeout(resizeSegmentTimerId);

    var width = _processWidthInput(el.value);

    if (width) {
      var segmentEl = el.segmentEl;

      if (immediate) {
        _resizeSegment(segmentEl, RESIZE_TYPE_TYPING, 
            width * TILE_SIZE, false, false, true);
      } else {
        resizeSegmentTimerId = window.setTimeout(function() {
          _resizeSegment(segmentEl, RESIZE_TYPE_TYPING,
          width * TILE_SIZE, false, false, true);
        }, WIDTH_EDIT_INPUT_DELAY);
      }
    } else {
      
    }
  }

  function _onWidthEditInput(event) {
    _widthEditInputChanged(event.target, false);
  }

  function _onWidthEditKeyDown(event) {
    var el = event.target;

    switch (event.keyCode) {
      case KEY_ENTER:
        _widthEditInputChanged(el, true);
        _loseAnyFocus();
        el.value = _prettifyWidth(el.segmentEl.getAttribute('width'), PRETTIFY_WIDTH_INPUT);
        el.focus();
        el.select();
        break;
      case KEY_ESC:
        el.value = el.oldValue;
        _widthEditInputChanged(el, true);
        _loseAnyFocus();
        break;
    }
  }

  function _normalizeStreetWidth(width) {
    if (width < MIN_CUSTOM_STREET_WIDTH) {
      width = MIN_CUSTOM_STREET_WIDTH;
    } else if (width > MAX_CUSTOM_STREET_WIDTH) {
      width = MAX_CUSTOM_STREET_WIDTH;
    }

    var resolution = segmentWidthResolution;

    width = 
        Math.round(width / resolution) * resolution;

    return width;    
  }

  function _normalizeSegmentWidth(width, resizeType) {
    if (width < MIN_SEGMENT_WIDTH) {
      width = MIN_SEGMENT_WIDTH;
    } else if (width > MAX_SEGMENT_WIDTH) {
      width = MAX_SEGMENT_WIDTH;
    }    

    switch (resizeType) {
      case RESIZE_TYPE_INITIAL:
      case RESIZE_TYPE_TYPING:
      case RESIZE_TYPE_INCREMENT:
      case RESIZE_TYPE_PRECISE_DRAGGING:
        var resolution = segmentWidthResolution;
        break;
      case RESIZE_TYPE_DRAGGING:
        var resolution = segmentWidthDraggingResolution;
        break;
    }

    width = Math.round(width / resolution) * resolution;
    width = parseFloat(width.toFixed(NORMALIZE_PRECISION));

    return width;
  }

  function _prettifyWidth(width, purpose) {
    var remainder = width - Math.floor(width);

    switch (settings.units) {
      case SETTINGS_UNITS_IMPERIAL:
        var widthText = width;

        if (purpose != PRETTIFY_WIDTH_INPUT) {
          if (IMPERIAL_VULGAR_FRACTIONS[('' + remainder).substr(1)]) {
            var widthText = 
                (Math.floor(width) ? Math.floor(width) : '') + 
                IMPERIAL_VULGAR_FRACTIONS[('' + remainder).substr(1)];      
          }
        }

        switch (purpose) {
          case PRETTIFY_WIDTH_OUTPUT_NO_MARKUP:
            widthText += '\'';
            break;
          case PRETTIFY_WIDTH_OUTPUT_MARKUP:
            widthText += '<wbr>\'';
            break;
        }
        break;
      case SETTINGS_UNITS_METRIC:
        var widthText = '' + 
            (width * IMPERIAL_METRIC_MULTIPLIER).toFixed(METRIC_PRECISION);

        if (widthText.substr(0, 2) == '0.') {
          widthText = widthText.substr(1);
        }
        while (widthText.substr(widthText.length - 1) == '0') {
          widthText = widthText.substr(0, widthText.length - 1);
        }
        if (widthText.substr(widthText.length - 1) == '.') {
          widthText = widthText.substr(0, widthText.length - 1);
        }

        switch (purpose) {
          case PRETTIFY_WIDTH_OUTPUT_NO_MARKUP:
            widthText += ' m';
            break;
          case PRETTIFY_WIDTH_OUTPUT_MARKUP:
            widthText += '<wbr> m';          
            break;
        }
        break;
    }

    return widthText;
  }

  function _incrementSegmentWidth(segmentEl, add, precise) {
    var width = parseFloat(segmentEl.getAttribute('width'));

    if (precise) {
      var increment = segmentWidthResolution;
    } else {
      var increment = segmentWidthClickIncrement;
    }

    if (!add) {
      increment = -increment;
    }
    width = _normalizeSegmentWidth(width + increment, RESIZE_TYPE_INCREMENT);

    _resizeSegment(segmentEl, RESIZE_TYPE_INCREMENT,
        width * TILE_SIZE, true, false, true);
  }

  function _onWidthDecrementClick(event) {
    var el = event.target;
    var segmentEl = el.segmentEl;
    var precise = event.shiftKey;
    
    _incrementSegmentWidth(segmentEl, false, precise);
    _createTouchSegmentFadeout(segmentEl);
  }

  function _onWidthIncrementClick(event) {
    var el = event.target;
    var segmentEl = el.segmentEl;
    var precise = event.shiftKey;

    _incrementSegmentWidth(segmentEl, true, precise);
    _createTouchSegmentFadeout(segmentEl);
  }

  function _resizeSegment(el, resizeType, width, updateEdit, isTool, immediate, initial) {
    if (!isTool) {
      var width = 
          _normalizeSegmentWidth(width / TILE_SIZE, resizeType) * TILE_SIZE;
    }

    if (immediate) {
      document.body.classList.add('immediate-segment-resize');

      window.setTimeout(function() {
        document.body.classList.remove('immediate-segment-resize');
      }, SHORT_DELAY);
    }

    el.style.width = width + 'px';
    el.setAttribute('width', width / TILE_SIZE);

    var widthEl = el.querySelector('span.width');
    if (widthEl) {
      widthEl.innerHTML = 
          _prettifyWidth(width / TILE_SIZE, PRETTIFY_WIDTH_OUTPUT_MARKUP);
    }

    _setSegmentContents(el, el.getAttribute('type'), width, isTool);

    if (updateEdit) {
      var value = width / TILE_SIZE;

      var editEl = el.querySelector('.width-edit');
      if (editEl) {
        editEl.realValue = value;
        editEl.value = _prettifyWidth(value, PRETTIFY_WIDTH_OUTPUT_NO_MARKUP);
      } else {
        var editEl = el.querySelector('.width-edit-placeholder');
        if (editEl) {
          editEl.innerHTML = _prettifyWidth(value, PRETTIFY_WIDTH_OUTPUT_MARKUP);
        }
      }
    }

    var widthEditCanvasEl = el.querySelector('.width-edit-canvas');

    if (widthEditCanvasEl) {
      if (width < MIN_WIDTH_EDIT_CANVAS_WIDTH) {
        widthEditCanvasEl.style.width = MIN_WIDTH_EDIT_CANVAS_WIDTH + 'px';
        widthEditCanvasEl.style.marginLeft = 
            ((width - MIN_WIDTH_EDIT_CANVAS_WIDTH) / 2 - WIDTH_EDIT_MARGIN) + 'px';
      } else {
        widthEditCanvasEl.style.width = '';
        widthEditCanvasEl.style.marginLeft = '';
      }
    }

    if (!initial) {
      _segmentsChanged();
    }
  }

  function _moveInfoBubble(segmentEl) {
    var infoBubbleEl = document.querySelector('#info-bubble');

    var infoBubbleWidth = infoBubbleEl.offsetWidth;
    var infoBubbleHeight = infoBubbleEl.offsetHeight;

    var pos = _getElAbsolutePos(segmentEl);

    var left = (pos[0] + segmentEl.offsetWidth / 2) - (infoBubbleWidth / 2);
    var top = pos[1];

    infoBubbleEl.style.left = left + 'px';
    infoBubbleEl.style.height = infoBubbleHeight + 'px';
    // TODO const
    infoBubbleEl.style.top = (top + 510 - infoBubbleHeight) + 'px';

    var segment = street.segments[parseInt(segmentEl.dataNo)];

    var html = '';
    html += '<button class="close">×</button>';

    html += '<h1>' + SEGMENT_INFO[segmentEl.getAttribute('type')].name + '</h1>';
    html += '<section class="content">';
    if (segment.warnings[SEGMENT_WARNING_OUTSIDE]) {
      html += '<p class="warning">';
      html += '<strong>This segment doesn’t fit within the street.</strong> ';
      html += 'Resize the segment or remove other segments.';
      html += '</p>';
    }
    if (segment.warnings[SEGMENT_WARNING_WIDTH_TOO_SMALL]) {
      html += '<p class="warning">';
      html += '<strong>This segment is not wide enough.</strong> ';
      html += 'Drive lanes under 8" lorem ipsum.';
      html += '</p>';
    }
    if (segment.warnings[SEGMENT_WARNING_WIDTH_TOO_LARGE]) {
      html += '<p class="warning">';
      html += '<strong>This segment is too wide.</strong> ';
      html += 'Drive lanes over 15" lorem ipsum.';
      html += '</p>';
    }
    html += '<p class="photo"><img src="images/info-bubble-examples/bike-lane.jpg"></p>';
    html += '<p class="description">Etizzle sizzle urna ut nisl. Tellivizzle quizzle arcu. Own yo’ pulvinar, ipsizzle shut the shizzle up bizzle we gonna chung, nulla purizzle izzle brizzle, shizzle my nizzle crocodizzle nizzle metus nulla izzle izzle. Vivamus ullamcorpizzle, tortor et varizzle owned, mah nizzle black break yo neck, yall crackalackin, izzle shiz leo elizzle fizzle dolizzle. Maurizzle aliquet, orci vel mah nizzle yippiyo, sizzle cool luctus fizzle, izzle bibendizzle enizzle dizzle yippiyo nisl. Nullizzle phat velizzle shiznit get down get down eleifend dawg. Phasellizzle nec nibh. Curabitizzle nizzle velit boom shackalack uhuh ... yih! sodalizzle facilisizzle. Maecenas things nulla, iaculizzle check it out, pot sed, rizzle a, erizzle. Nulla vitae turpis fo shizzle my nizzle nibh get down get down nizzle. Nizzle pulvinar consectetizzle velizzle. Aliquizzle mofo volutpizzle. Nunc ut leo izzle shit get down get down faucibus. Crizzle nizzle lacizzle the bizzle shizznit condimentizzle ultricies. Ut nisl. Fo shizzle my nizzle izzle fo shizzle mah nizzle fo rizzle, mah home g-dizzle. Integer laorizzle nizzle away mi. Crunk at turpizzle.</p>';
    html += '</section>';

    infoBubbleEl.innerHTML = html;

    infoBubbleEl.querySelector('.close').addEventListener('click', _hideInfoBubble);

    var el = document.querySelector('.segment.hover');
    if (el) {
      el.classList.remove('hover');
    }

    segmentEl.classList.add('hover');
  }

  function _hideInfoBubble() {
    var el = document.querySelector('.segment.hover');
    if (el) {
      el.classList.remove('hover');
    }

    var infoBubbleEl = document.querySelector('#info-bubble');
    infoBubbleEl.classList.remove('visible');
    infoBubbleVisible = false;

    document.body.classList.remove('info-bubble-visible');
  }

  function _onInfoButtonMouseOver(event) {
    if (!infoBubbleVisible) {
      return;
    }

    var el = event.target;
    var segmentEl = el.segmentEl;

    window.clearTimeout(infoButtonHoverTimerId);

    // TODO const
    infoButtonHoverTimerId = 
        window.setTimeout(function() { _showInfoBubble(segmentEl); }, 250);
  }

  function _onInfoButtonMouseOut(event) {
    window.clearTimeout(infoButtonHoverTimerId);    
  }

  function _showInfoBubble(segmentEl) {
    window.clearTimeout(infoButtonHoverTimerId);

    if (!infoBubbleVisible) {
      var infoBubbleEl = document.querySelector('#info-bubble');
      infoBubbleEl.classList.add('visible');
      infoBubbleEl.classList.add('no-move-transition');
      infoBubbleVisible = true;
      document.body.classList.add('info-bubble-visible');
    }

    _moveInfoBubble(segmentEl);

    window.setTimeout(function() {
      infoBubbleEl.classList.remove('no-move-transition');
    }, 0);
  }

  function _onInfoButtonClick(event) {
    window.clearTimeout(infoButtonHoverTimerId);

    if (infoBubbleVisible) {
      _hideInfoBubble();
    } else {
      var el = event.target;
      var segmentEl = el.segmentEl;

      _showInfoBubble(segmentEl);
    }
  }

  function _createSegment(type, width, isUnmovable, isTool) {
    var el = document.createElement('div');
    el.classList.add('segment');
    el.setAttribute('type', type);

    if (isUnmovable) {
      el.classList.add('unmovable');
    }
    
    _setSegmentContents(el, type, width, isTool);


    if (!isTool) {
      el.style.zIndex = SEGMENT_INFO[type].zIndex;

      var innerEl = document.createElement('span');
      innerEl.classList.add('name');
      innerEl.innerHTML = SEGMENT_INFO[type].name;
      el.appendChild(innerEl);

      var innerEl = document.createElement('span');
      innerEl.classList.add('width');
      el.appendChild(innerEl);

      var dragHandleEl = document.createElement('span');
      dragHandleEl.classList.add('drag-handle');
      dragHandleEl.classList.add('left');
      dragHandleEl.segmentEl = el;
      dragHandleEl.innerHTML = '‹';
      el.appendChild(dragHandleEl);

      var dragHandleEl = document.createElement('span');
      dragHandleEl.classList.add('drag-handle');
      dragHandleEl.classList.add('right');
      dragHandleEl.segmentEl = el;
      dragHandleEl.innerHTML = '›';
      el.appendChild(dragHandleEl);

      var commandsEl = document.createElement('span');
      commandsEl.classList.add('commands');

      var innerEl = document.createElement('button');
      innerEl.classList.add('remove');
      innerEl.innerHTML = '×';
      innerEl.segmentEl = el;
      innerEl.tabIndex = -1;
      innerEl.setAttribute('title', 'Remove segment');
      if (system.touch) {      
        innerEl.addEventListener('touchstart', _onRemoveButtonClick);
      } else {
        innerEl.addEventListener('click', _onRemoveButtonClick);        
      }
      commandsEl.appendChild(innerEl);        

      /*var innerEl = document.createElement('button');
      innerEl.classList.add('info');
      innerEl.segmentEl = el;
      innerEl.tabIndex = -1;
      innerEl.addEventListener('mouseover', _onInfoButtonMouseOver);
      innerEl.addEventListener('mouseout', _onInfoButtonMouseOut);
      innerEl.addEventListener('click', _onInfoButtonClick);
      commandsEl.appendChild(innerEl); */

      el.appendChild(commandsEl);

      var widthEditCanvasEl = document.createElement('span');
      widthEditCanvasEl.classList.add('width-edit-canvas');

      var innerEl = document.createElement('button');
      innerEl.classList.add('decrement');
      innerEl.innerHTML = '–';
      innerEl.segmentEl = el;
      innerEl.tabIndex = -1;
      if (system.touch) {
        innerEl.addEventListener('touchstart', _onWidthDecrementClick);
      } else {
        innerEl.addEventListener('click', _onWidthDecrementClick);        
      }
      widthEditCanvasEl.appendChild(innerEl);        

      if (!system.touch) {
        var innerEl = document.createElement('input');
        innerEl.setAttribute('type', 'text');
        innerEl.classList.add('width-edit');
        innerEl.segmentEl = el;
        //innerEl.value = width / TILE_SIZE;

        innerEl.addEventListener('click', _onWidthEditClick);
        innerEl.addEventListener('focus', _onWidthEditFocus);
        innerEl.addEventListener('blur', _onWidthEditBlur);
        innerEl.addEventListener('input', _onWidthEditInput);
        innerEl.addEventListener('mouseover', _onWidthEditMouseOver);
        innerEl.addEventListener('mouseout', _onWidthEditMouseOut);
        innerEl.addEventListener('keydown', _onWidthEditKeyDown);
      } else {
        var innerEl = document.createElement('span');
        innerEl.classList.add('width-edit-placeholder');
      }
      widthEditCanvasEl.appendChild(innerEl);

      var innerEl = document.createElement('button');
      innerEl.classList.add('increment');
      innerEl.innerHTML = '+';
      innerEl.segmentEl = el;
      innerEl.tabIndex = -1;
      if (system.touch) {
        innerEl.addEventListener('touchstart', _onWidthIncrementClick);
      } else {
        innerEl.addEventListener('click', _onWidthIncrementClick);        
      }
      widthEditCanvasEl.appendChild(innerEl);        

      el.appendChild(widthEditCanvasEl);

      var innerEl = document.createElement('span');
      innerEl.classList.add('grid');
      el.appendChild(innerEl);
    } else {
    	el.setAttribute('title', SEGMENT_INFO[type].name);
    }

    if (width) {
      _resizeSegment(el, RESIZE_TYPE_INITIAL, width, true, isTool, true, true);
    }    
    return el;
  }

  function _createDomFromData() {
    document.querySelector('#editable-street-section').innerHTML = '';

    for (var i in street.segments) {
      var segment = street.segments[i];

      var el = _createSegment(segment.type, segment.width * TILE_SIZE, 
          segment.unmovable);
      document.querySelector('#editable-street-section').appendChild(el);

      street.segments[i].el = el;
      street.segments[i].el.dataNo = i;
    }

    _repositionSegments();
  }

  function _repositionSegments() {
    var left = 0;

    for (var i in street.segments) {
      var el = street.segments[i].el;

      if (el == draggingMove.segmentBeforeEl) {
        left += DRAGGING_MOVE_HOLE_WIDTH;

        if (!draggingMove.segmentAfterEl) {
          left += DRAGGING_MOVE_HOLE_WIDTH;
        }
      }

      if (el.classList.contains('dragged-out')) {
        var width = 0;
      } else {
        var width = parseFloat(el.getAttribute('width')) * TILE_SIZE;
      }

      el.savedLeft = parseInt(left); // so we don’t have to use offsetLeft
      el.savedWidth = parseInt(width);

      left += width;

      if (el == draggingMove.segmentAfterEl) {
        left += DRAGGING_MOVE_HOLE_WIDTH;

        if (!draggingMove.segmentBeforeEl) {
          left += DRAGGING_MOVE_HOLE_WIDTH;
        }
      }
    }

    var occupiedWidth = left;

    var mainLeft = Math.round((street.width * TILE_SIZE - occupiedWidth) / 2);

    for (var i in street.segments) {
      var el = street.segments[i].el;

      el.savedLeft += mainLeft;

      if (system.cssTransform) {
        el.style[system.cssTransform] = 'translateX(' + el.savedLeft + 'px)';
        el.cssTransformLeft = el.savedLeft;
      } else {
        el.style.left = el.savedLeft + 'px';
      }
    }
  }

  function _applyWarningsToSegments() {
    for (var i in street.segments) {
      var segment = street.segments[i];

      if (segment.el) {
        if (segment.warnings[SEGMENT_WARNING_OUTSIDE] || 
            segment.warnings[SEGMENT_WARNING_WIDTH_TOO_SMALL] ||
            segment.warnings[SEGMENT_WARNING_WIDTH_TOO_LARGE]) {
          segment.el.classList.add('warning');          
        } else {
          segment.el.classList.remove('warning');                    
        }

        if (segment.warnings[SEGMENT_WARNING_OUTSIDE]) {
          segment.el.classList.add('outside');
        } else {
          segment.el.classList.remove('outside');
        }
      }
    }
  }

  function _recalculateWidth() {
    street.occupiedWidth = 0;

    for (var i in street.segments) {
      var segment = street.segments[i];

      street.occupiedWidth += segment.width;
    }   

    street.remainingWidth = street.width - street.occupiedWidth;
    // Rounding problems :·(
    if (Math.abs(street.remainingWidth) < WIDTH_ROUNDING) {
      street.remainingWidth = 0;
    }

    var position = street.width / 2 - street.occupiedWidth / 2;

    for (var i in street.segments) {
      var segment = street.segments[i];
      var segmentInfo = SEGMENT_INFO[segment.type];

      if (segment.el) {
        if ((street.remainingWidth < 0) && 
            ((position < 0) || ((position + segment.width) > street.width))) {
          segment.warnings[SEGMENT_WARNING_OUTSIDE] = true;
        } else {
          segment.warnings[SEGMENT_WARNING_OUTSIDE] = false;
        }

        if (segmentInfo.minWidth && (segment.width < segmentInfo.minWidth)) {
          segment.warnings[SEGMENT_WARNING_WIDTH_TOO_SMALL] = true;
        } else {
          segment.warnings[SEGMENT_WARNING_WIDTH_TOO_SMALL] = false;          
        }

        if (segmentInfo.maxWidth && (segment.width > segmentInfo.maxWidth)) {
          segment.warnings[SEGMENT_WARNING_WIDTH_TOO_LARGE] = true;
        } else {
          segment.warnings[SEGMENT_WARNING_WIDTH_TOO_LARGE] = false;          
        }
      }

      position += street.segments[i].width;
    }

    if (street.remainingWidth >= 0) {
      document.body.classList.remove('street-overflows');
    } else {
      document.body.classList.add('street-overflows');
    }

    _applyWarningsToSegments();
  }

  function _segmentsChanged() {
    if (!initializing) {
      _createDataFromDom();
    }

    _recalculateWidth();
    _recalculateOwnerWidths();

    for (var i in street.segments) {
      if (street.segments[i].el) {
        street.segments[i].el.dataNo = i;
      }
    }

    _saveChangesIfAny();
    _updateUndoButtons();
    _repositionSegments();
  }

  function _undoRedo(undo) {
    if (undo && !_isUndoAvailable()) {
      _statusMessage.show('Nothing to undo.');
    } else if (!undo && !_isRedoAvailable()) {
      _statusMessage.show('Nothing to redo.');     
    } else {
      if (undo) {
        undoStack[undoPosition] = _trimNonUserData();
        undoPosition--;
      } else {
        undoPosition++;
      }
      street = undoStack[undoPosition];

      ignoreStreetChanges = true;
      _propagateSettings();
      _buildStreetWidthMenu();
      _updateOptionsMenu();
      _updateShareMenu();
      _createDomFromData();
      _segmentsChanged();
      _resizeStreetWidth();
      _updateStreetName();
      ignoreStreetChanges = false;
      _updateUndoButtons();
      lastStreet = _trimNonUserData();
      _statusMessage.hide();
    }
  }

  function _clearUndoStack() {
    undoStack = [];
    undoPosition = 0;
    _updateUndoButtons();
  }

  function _undo() {
    _undoRedo(true);
  }

  function _redo() {
    _undoRedo(false);
  }

  function _createNewUndo() {
    // This removes future undos in case we undo a few times and then do
    // something undoable.
    undoStack = undoStack.splice(0, undoPosition);
    undoStack[undoPosition] = lastStreet;
    undoPosition++;
  }

  function _saveChangesToServer() {
    console.log('save…');

    //saveChangesIncomplete = false;
  }

  function _clearScheduledSavingChangesToServer() {
    window.clearTimeout(saveChangesTimerId);
  }

  function _scheduleSavingChangesToServer() {
    console.log('schedule save…');

    saveChangesIncomplete = true;

    _clearScheduledSavingChangesToServer();

    saveChangesTimerId = 
        window.setTimeout(_saveChangesToServer, SAVE_CHANGES_DELAY);
  }

  function _saveChangesIfAny() {
    if (ignoreStreetChanges) {
      return;
    }

    var currentData = _trimNonUserData();

    if (JSON.stringify(currentData) != JSON.stringify(lastStreet)) {
      _createNewUndo();
      _scheduleSavingChangesToServer();

      lastStreet = currentData;

      _updateUndoButtons();
    }
  }

  function _checkIfEverythingHasBeenSaved() {
    if (saveChangesIncomplete) {
      _saveChangesToServer();

      return 'Your changes have not been saved yet. Please wait and close the page in a little while to allow the changes to be saved.';
    } else {
      return null;
    }
  }

  function _onWindowBeforeUnload() {
    return _checkIfEverythingHasBeenSaved();
  }

  function _createDataFromDom() {
    var els = document.querySelectorAll('#editable-street-section > .segment');

    street.segments = [];

    for (var i = 0, el; el = els[i]; i++) {
      var segment = {};
      segment.type = el.getAttribute('type');
      segment.width = parseFloat(el.getAttribute('width'));
      segment.el = el;
      segment.warnings = [];
      street.segments.push(segment);
    }
  }

  function _drawLine(ctx, x1, y1, x2, y2) {
    x1 *= system.hiDpi;
    y1 *= system.hiDpi;
    x2 *= system.hiDpi;
    y2 *= system.hiDpi;

    ctx.beginPath(); 
    ctx.moveTo(x1, y1); 
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  function _drawArrowLine(ctx, x1, y1, x2, y2, text) {
    x1 += 2;
    x2 -= 2;

    _drawLine(ctx, x1, y1, x2, y2);

    if (text) {
      ctx.font = (12 * system.hiDpi) + 'px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(text, (x1 + x2) / 2 * system.hiDpi, y1 * system.hiDpi - 10);      
    }
  }

  function _updateWidthChart(ownerWidths) {
    var ctx = document.querySelector('#width-chart').getContext('2d');

    var chartWidth = WIDTH_CHART_WIDTH;
    var canvasWidth = document.querySelector('#width-chart').offsetWidth;
    var canvasHeight = document.querySelector('#width-chart').offsetHeight;

    document.querySelector('#width-chart').width = canvasWidth * system.hiDpi;
    document.querySelector('#width-chart').height = canvasHeight * system.hiDpi;

    chartWidth -= WIDTH_CHART_MARGIN * 2;

    var left = (canvasWidth - chartWidth) / 2;

    for (var id in SEGMENT_OWNERS) {
      if (ownerWidths[id] == 0) {
        chartWidth -= WIDTH_CHART_EMPTY_OWNER_WIDTH;
      }
    }

    var maxWidth = street.width;
    if (street.occupiedWidth > street.width) {
      maxWidth = street.occupiedWidth;
    }

    var multiplier = chartWidth / maxWidth;

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    ctx.strokeStyle = 'black';
    ctx.lineWidth = 1;

    var bottom = 70;

    _drawLine(ctx, left, 20, left, bottom);
    if (maxWidth > street.width) {
      _drawLine(ctx, left + street.width * multiplier, 20, 
          left + street.width * multiplier, 40);

      ctx.save();
      // TODO const
      ctx.strokeStyle = 'red';
      ctx.fillStyle = 'red';
      _drawArrowLine(ctx, 
        left + street.width * multiplier, 30, 
        left + maxWidth * multiplier, 30, 
        _prettifyWidth(-street.remainingWidth, PRETTIFY_WIDTH_OUTPUT_NO_MARKUP));
      ctx.restore();
    }

    _drawLine(ctx, left + maxWidth * multiplier, 20, 
        left + maxWidth * multiplier, bottom);
    _drawArrowLine(ctx, 
        left, 30, left + street.width * multiplier, 30);
  
    var x = left;

    for (var id in SEGMENT_OWNERS) {
      if (ownerWidths[id] > 0) {
        var width = ownerWidths[id] * multiplier;

        _drawArrowLine(ctx, x, 60, x + width, 60, 
            _prettifyWidth(ownerWidths[id], PRETTIFY_WIDTH_OUTPUT_NO_MARKUP));
        _drawLine(ctx, x + width, 50, x + width, 70);

        var imageWidth = images[SEGMENT_OWNERS[id].imageUrl].width / 5 * SEGMENT_OWNERS[id].imageSize;
        var imageHeight = images[SEGMENT_OWNERS[id].imageUrl].height / 5 * SEGMENT_OWNERS[id].imageSize;

        ctx.drawImage(images[SEGMENT_OWNERS[id].imageUrl], 
            0, 
            0, 
            images[SEGMENT_OWNERS[id].imageUrl].width, 
            images[SEGMENT_OWNERS[id].imageUrl].height, 
            (x + width / 2 - imageWidth / 2) * system.hiDpi, 
            (80 - imageHeight) * system.hiDpi,
            imageWidth * system.hiDpi, 
            imageHeight * system.hiDpi);

        x += width;
      }
    }

    if (street.remainingWidth > 0) {
      ctx.save();
      // TODO const
      ctx.strokeStyle = 'rgb(100, 100, 100)';
      ctx.fillStyle = 'rgb(100, 100, 100)';
      if (ctx.setLineDash) {
        ctx.setLineDash([15, 10]);
      }
      _drawArrowLine(ctx, x, 60, left + street.width * multiplier, 60, _prettifyWidth(street.remainingWidth, PRETTIFY_WIDTH_OUTPUT_NO_MARKUP));
      ctx.restore();
    }

    x = left + maxWidth * multiplier;

    for (var id in SEGMENT_OWNERS) {
      if (ownerWidths[id] == 0) {
        var width = WIDTH_CHART_EMPTY_OWNER_WIDTH;

        ctx.fillStyle = 'rgb(100, 100, 100)';
        ctx.strokeStyle = 'rgb(100, 100, 100)';

        _drawArrowLine(ctx, x, 60, x + width, 60, '–');
        _drawLine(ctx, x + width, 50, x + width, 70);

        var imageWidth = images[SEGMENT_OWNERS[id].imageUrl].width / 5 * SEGMENT_OWNERS[id].imageSize;
        var imageHeight = images[SEGMENT_OWNERS[id].imageUrl].height / 5 * SEGMENT_OWNERS[id].imageSize;

        ctx.save();
        ctx.globalAlpha = .5;
        ctx.drawImage(images[SEGMENT_OWNERS[id].imageUrl], 
            0, 
            0, 
            images[SEGMENT_OWNERS[id].imageUrl].width, 
            images[SEGMENT_OWNERS[id].imageUrl].height, 
            (x + width / 2 - imageWidth / 2) * system.hiDpi, 
            (80 - imageHeight) * system.hiDpi,
            imageWidth * system.hiDpi, 
            imageHeight * system.hiDpi);
        ctx.restore();
        
        x += width;
      }
    }

    document.querySelector('#street-width-canvas').style.left = 
        WIDTH_CHART_MARGIN + 'px';
    document.querySelector('#street-width-canvas').style.width = 
        (street.width * multiplier) + 'px';
  }

  function _recalculateOwnerWidths() {
    var ownerWidths = {};

    for (var id in SEGMENT_OWNERS) {
      ownerWidths[id] = 0;
    }

    for (var i in street.segments) {
      var segment = street.segments[i];

      ownerWidths[SEGMENT_INFO[segment.type].owner] += segment.width;
    }   

    _updateWidthChart(ownerWidths);
  }

  function _changeDraggingType(newDraggingType) {
    draggingType = newDraggingType;

    document.body.classList.remove('segment-move-dragging');
    document.body.classList.remove('segment-resize-dragging');

    switch (draggingType) {
      case DRAGGING_TYPE_RESIZE:
        document.body.classList.add('segment-resize-dragging');
        break;
      case DRAGGING_TYPE_MOVE:
        document.body.classList.add('segment-move-dragging');
        break;
    }
  }

  function _handleSegmentResizeStart(event) {
    ignoreStreetChanges = true;

    var el = event.target;

    _changeDraggingType(DRAGGING_TYPE_RESIZE);

    var pos = _getElAbsolutePos(el);

    draggingResize.right = el.classList.contains('right');

    draggingResize.floatingEl = document.createElement('div');
    draggingResize.floatingEl.classList.add('drag-handle');
    draggingResize.floatingEl.classList.add('floating');

    draggingResize.floatingEl.style.left = pos[0] + 'px';
    draggingResize.floatingEl.style.top = pos[1] + 'px';
    document.body.appendChild(draggingResize.floatingEl);

    draggingResize.mouseX = event.pageX;
    draggingResize.mouseY = event.pageY;

    draggingResize.elX = pos[0];
    draggingResize.elY = pos[1];

    draggingResize.origX = draggingResize.elX;
    draggingResize.origWidth = parseFloat(el.segmentEl.getAttribute('width'));
    draggingResize.segmentEl = el.segmentEl;

    draggingResize.segmentEl.classList.add('hover');

    var segmentInfo = SEGMENT_INFO[el.segmentEl.getAttribute('type')];

    if (segmentInfo.minWidth) {
      var guideEl = document.createElement('div');
      guideEl.classList.add('guide');

      var width = segmentInfo.minWidth * TILE_SIZE;
      guideEl.style.width = width + 'px';
      guideEl.style.marginLeft = (-width / 2) + 'px';
      el.segmentEl.appendChild(guideEl);
    }

    var remainingWidth = 
        street.remainingWidth + parseFloat(el.segmentEl.getAttribute('width'));

    if (remainingWidth && 
        (((!segmentInfo.minWidth) && (remainingWidth >= MIN_SEGMENT_WIDTH)) || (remainingWidth >= segmentInfo.minWidth)) && 
        ((!segmentInfo.maxWidth) || (remainingWidth <= segmentInfo.maxWidth))) {
      var guideEl = document.createElement('div');
      guideEl.classList.add('guide');

      var width = remainingWidth * TILE_SIZE;
      guideEl.style.width = width + 'px';
      guideEl.style.marginLeft = (-width / 2) + 'px';
      el.segmentEl.appendChild(guideEl);
    } else if (segmentInfo.maxWidth) {
      var guideEl = document.createElement('div');
      guideEl.classList.add('guide');

      var width = segmentInfo.maxWidth * TILE_SIZE;
      guideEl.style.width = width + 'px';
      guideEl.style.marginLeft = (-width / 2) + 'px';
      el.segmentEl.appendChild(guideEl);
    }
  }

  function _handleSegmentResizeMove(event) {
    var x = event.pageX;
    var y = event.pageY;

    var deltaX = x - draggingResize.mouseX;
    var deltaY = y - draggingResize.mouseY;

    var deltaFromOriginal = draggingResize.elX - draggingResize.origX;
    if (!draggingResize.right) {
      deltaFromOriginal = -deltaFromOriginal;
    }

    draggingResize.elX += deltaX;
    draggingResize.floatingEl.style.left = draggingResize.elX + 'px';

    var width = draggingResize.origWidth + deltaFromOriginal / TILE_SIZE * 2;
    var precise = event.shiftKey;

    if (precise) {
      var resizeType = RESIZE_TYPE_PRECISE_DRAGGING;
    } else {
      var resizeType = RESIZE_TYPE_DRAGGING;
    }

    _resizeSegment(draggingResize.segmentEl, resizeType,
        width * TILE_SIZE, true, false, true);

    draggingResize.mouseX = event.pageX;
    draggingResize.mouseY = event.pageY;
  }  

  function _handleSegmentMoveStart(event) {
    ignoreStreetChanges = true;

    if (event.touches && event.touches[0]) {
      var x = event.touches[0].pageX;
      var y = event.touches[0].pageY;
    } else {
      var x = event.pageX;
      var y = event.pageY;
    }    

    var el = event.target;

    _changeDraggingType(DRAGGING_TYPE_MOVE);

    draggingMove.origEl = el;

    draggingMove.originalType = draggingMove.origEl.getAttribute('type');

    if (draggingMove.origEl.classList.contains('tool')) {
      draggingMove.type = DRAGGING_TYPE_MOVE_CREATE;
      draggingMove.origWidth = 
          SEGMENT_INFO[draggingMove.originalType].defaultWidth * TILE_SIZE;
    } else {
      draggingMove.type = DRAGGING_TYPE_MOVE_TRANSFER;      
      draggingMove.origWidth = 
          draggingMove.origEl.offsetWidth;
    }

    var pos = _getElAbsolutePos(el);

    draggingMove.elX = pos[0];
    draggingMove.elY = pos[1];

    if (draggingMove.type == DRAGGING_TYPE_MOVE_CREATE) {
      draggingMove.elY += DRAG_OFFSET_Y_PALETTE;
      draggingMove.elX -= draggingMove.origWidth / 3;
    }

    draggingMove.mouseX = x;
    draggingMove.mouseY = y;

    draggingMove.floatingEl = document.createElement('div');
    draggingMove.floatingEl.classList.add('segment');
    draggingMove.floatingEl.classList.add('floating');
    draggingMove.floatingEl.classList.add('first-drag-move');
    draggingMove.floatingEl.setAttribute('type', draggingMove.originalType);
    draggingMove.floatingElVisible = false;
    _setSegmentContents(draggingMove.floatingEl, 
        draggingMove.originalType, draggingMove.origWidth);
    document.body.appendChild(draggingMove.floatingEl);

    if (system.cssTransform) {
      draggingMove.floatingEl.style[system.cssTransform] = 
          'translate(' + draggingMove.elX + 'px, ' + draggingMove.elY + 'px)';
    } else {
      draggingMove.floatingEl.style.left = draggingMove.elX + 'px';
      draggingMove.floatingEl.style.top = draggingMove.elY + 'px';
    }

    if (draggingMove.type == DRAGGING_TYPE_MOVE_TRANSFER) {
      draggingMove.origEl.classList.add('dragged-out');
    }

    draggingMove.segmentBeforeEl = null;
    draggingMove.segmentAfterEl = null;
  }

  function _handleSegmentMoveMove(event) {
    var x = event.pageX;
    var y = event.pageY;

    var deltaX = x - draggingMove.mouseX;
    var deltaY = y - draggingMove.mouseY;

    draggingMove.elX += deltaX;
    draggingMove.elY += deltaY;

    if (!draggingMove.floatingElVisible) {
      draggingMove.floatingElVisible = true;

      if (system.touch) {
        if (draggingMove.type == DRAGGING_TYPE_MOVE_CREATE) {
          draggingMove.elY += DRAG_OFFSET_Y_TOUCH_PALETTE;
        } else {
          draggingMove.elY += DRAG_OFFSET_Y_TOUCH;
        }
      }

      window.setTimeout(function() {
        draggingMove.floatingEl.classList.remove('first-drag-move');      
      }, SHORT_DELAY);
    }    

    if (system.cssTransform) {
      draggingMove.floatingEl.style[system.cssTransform] = 
          'translate(' + draggingMove.elX + 'px, ' + draggingMove.elY + 'px)';

      var deg = deltaX;

      if (deg > MAX_DRAG_DEGREE) {
        deg = MAX_DRAG_DEGREE;
      } else if (deg < -MAX_DRAG_DEGREE) {
        deg = -MAX_DRAG_DEGREE;
      }

      if (system.cssTransform) {
        draggingMove.floatingEl.querySelector('canvas').style[system.cssTransform] = 
            'rotateZ(' + deg + 'deg)';
      }
    } else {
      draggingMove.floatingEl.style.left = draggingMove.elX + 'px';
      draggingMove.floatingEl.style.top = draggingMove.elY + 'px';
    }

    draggingMove.mouseX = x;
    draggingMove.mouseY = y;

    _makeSpaceBetweenSegments(x, y);

    if (draggingMove.type == DRAGGING_TYPE_MOVE_TRANSFER) {
      document.querySelector('#trashcan').classList.add('visible');
    }
  }

  function _hideDebugInfo() {
    document.querySelector('#debug').classList.remove('visible');
  }

  function _onBodyMouseDown(event) {
    var el = event.target;

    _loseAnyFocus();
    _hideDebugInfo();

    var topEl = event.target;
    // TODO nasty
    while (topEl && (topEl.id != 'info-bubble') && 
      (topEl.id != 'options-menu') && (topEl.id != 'share-menu')) {
      topEl = topEl.parentNode;
    }

    var withinInfoBubbleOrMenu = !!topEl;

    if (withinInfoBubbleOrMenu) {
      return;
    }

    _hideMenus();

    if (!el.classList.contains('info')) {
      _hideInfoBubble();
    }

    if (el.classList.contains('drag-handle')) {
      _handleSegmentResizeStart(event);
    } else {
      if (!el.classList.contains('segment') || 
          el.classList.contains('unmovable')) {
        return;
      }

      _handleSegmentMoveStart(event);
    }

    event.preventDefault();
  }

  function _makeSpaceBetweenSegments(x, y) {
    var left = x - streetSectionCanvasLeft;

    var selectedSegmentBefore = null;
    var selectedSegmentAfter = null;

    for (var i in street.segments) {
      var segment = street.segments[i];

      if (!selectedSegmentBefore && ((segment.el.savedLeft + segment.el.savedWidth / 2) > left)) {
        selectedSegmentBefore = segment.el;
      }

      if ((segment.el.savedLeft + segment.el.savedWidth / 2) <= left) {
        selectedSegmentAfter = segment.el;
      }
    }

    if ((selectedSegmentBefore != draggingMove.segmentBeforeEl) ||
        (selectedSegmentAfter != draggingMove.segmentAfterEl)) {
      draggingMove.segmentBeforeEl = selectedSegmentBefore;
      draggingMove.segmentAfterEl = selectedSegmentAfter;
      _repositionSegments();
    }
  }

  function _onBodyMouseMove(event) {
    mouseX = event.pageX;
    mouseY = event.pageY;

    if (draggingType == DRAGGING_TYPE_NONE) {
      return;
    }

    switch (draggingType) {
      case DRAGGING_TYPE_MOVE:
        _handleSegmentMoveMove(event);
        break;
      case DRAGGING_TYPE_RESIZE:
        _handleSegmentResizeMove(event);
        break;
    }

    event.preventDefault();
  }

  function _removeTouchSegmentFadeouts() {
    var els = document.querySelectorAll('.fade-out-end');
    for (var i = 0, el; el = els[i]; i++) {
      el.classList.remove('fade-out-end');
    }
  }

  function _createTouchSegmentFadeout(el) {
    if (system.touch) {
      _removeTouchSegmentFadeouts();

      window.clearTimeout(el.fadeoutTimerId);
      el.classList.remove('fade-out-end');
      el.classList.add('fade-out-start');

      window.setTimeout(function() {
        el.classList.remove('fade-out-start');
        el.classList.add('fade-out-end');
      }, 0);

      el.fadeoutTimerId = window.setTimeout(function() {
        el.classList.remove('fade-out-end');
      }, TOUCH_SEGMENT_FADEOUT_DELAY);
    }
  }

  function _handleSegmentMoveEnd(event) {
    ignoreStreetChanges = false;

    var el = document.elementFromPoint(draggingMove.mouseX, draggingMove.mouseY);
    while (el && (el.id != 'editable-street-section')) {
      el = el.parentNode;
    }
    var withinCanvas = !!el;

    if (!withinCanvas) {
      if (draggingMove.type == DRAGGING_TYPE_MOVE_TRANSFER) {
        _removeElFromDom(draggingMove.origEl);
      }
    } else if (draggingMove.segmentBeforeEl || draggingMove.segmentAfterEl || (street.segments.length == 0)) {
      var width = draggingMove.origWidth;

      if (draggingMove.type == DRAGGING_TYPE_MOVE_CREATE) {
        if ((street.remainingWidth > 0) && (width > street.remainingWidth * TILE_SIZE)) {

          var segmentMinWidth = 
              SEGMENT_INFO[draggingMove.originalType].minWidth || 0;

          if ((street.remainingWidth >= MIN_SEGMENT_WIDTH) && 
              (street.remainingWidth >= segmentMinWidth)) {
            width = _normalizeSegmentWidth(street.remainingWidth, RESIZE_TYPE_INITIAL) * TILE_SIZE;
          }
        }
      }
      
      var newEl = _createSegment(draggingMove.originalType, width);

      newEl.classList.add('create');

      if (draggingMove.segmentBeforeEl) {
        document.querySelector('#editable-street-section').
            insertBefore(newEl, draggingMove.segmentBeforeEl);
      } else if (draggingMove.segmentAfterEl) {
        document.querySelector('#editable-street-section').
            insertBefore(newEl, draggingMove.segmentAfterEl.nextSibling);
      } else {
        // empty street
        document.querySelector('#editable-street-section').appendChild(newEl);
      }

      window.setTimeout(function() {
        newEl.classList.remove('create');
      }, SHORT_DELAY);

      if (draggingMove.type == DRAGGING_TYPE_MOVE_TRANSFER) {
        var draggedOutEl = document.querySelector('.segment.dragged-out');
        _removeElFromDom(draggedOutEl);
      }

      _createTouchSegmentFadeout(newEl);
    } else {            
      _createTouchSegmentFadeout(draggingMove.origEl);

      draggingMove.origEl.classList.remove('dragged-out');
    }

    _removeElFromDom(draggingMove.floatingEl);

    draggingMove.segmentBeforeEl = null;
    draggingMove.segmentAfterEl = null;
    _repositionSegments();
    _segmentsChanged();

    document.querySelector('#trashcan').classList.remove('visible');

    _changeDraggingType(DRAGGING_TYPE_NONE);
  }

  function _removeGuides(el) {
    var guideEl;
    while (guideEl = el.querySelector('.guide')) {
      _removeElFromDom(guideEl);
    }
  }

  function _handleSegmentResizeEnd(event) {
    ignoreStreetChanges = false;

    _segmentsChanged();

    _changeDraggingType(DRAGGING_TYPE_NONE);

    // TODO const
    var el = draggingResize.floatingEl;
    window.setTimeout(function() {
      _removeElFromDom(el);
    }, 250);
  
    draggingResize.segmentEl.classList.remove('hover');

    _removeGuides(draggingResize.segmentEl);
 
    _createTouchSegmentFadeout(draggingResize.segmentEl);
  }

  function _onBodyMouseUp(event) {
    switch (draggingType) {
      case DRAGGING_TYPE_NONE:
        return;
      case DRAGGING_TYPE_MOVE:
        _handleSegmentMoveEnd(event);
        break;
      case DRAGGING_TYPE_RESIZE:
        _handleSegmentResizeEnd(event);
        break;
    }

    event.preventDefault();
  }

  function _createTools() {
    for (var i in SEGMENT_INFO) {
      var segmentInfo = SEGMENT_INFO[i];

      var width = segmentInfo.defaultWidth;

      if (segmentInfo.realWidth > segmentInfo.defaultWidth) {
        width = segmentInfo.realWidth;
      }

      if (segmentInfo.graphics.center && (width < (segmentInfo.graphics.center.width + 1))) {
        width = segmentInfo.graphics.center.width;
      }

      if (segmentInfo.graphics.left && segmentInfo.graphics.left.offsetX) {
        width -= segmentInfo.graphics.left.offsetX;
      }
      if (segmentInfo.graphics.right && segmentInfo.graphics.right.offsetX) {
        width -= segmentInfo.graphics.right.offsetX;
      }

      width += PALETTE_EXTRA_SEGMENT_PADDING;

      var el = _createSegment(i, 
        width * TILE_SIZE / WIDTH_TOOL_MULTIPLIER, 
        false, 
        true);

      el.classList.add('tool');

      document.querySelector('#tools').appendChild(el);
    }
  }

  function _resizeStreetWidth() {
    var width = street.width * TILE_SIZE;

    document.querySelector('#street-section-canvas').style.width = width + 'px';

    _onResize();
  }

  function _resizeStreetName() {
    var streetNameCanvasWidth = 
        document.querySelector('#street-name-canvas').offsetWidth;
    var streetNameWidth = 
        document.querySelector('#street-name').offsetWidth;

    if (streetNameWidth > streetNameCanvasWidth) {
      var multiplier = streetNameCanvasWidth / streetNameWidth;
    } else {
      var multiplier = 1.0;
    }

    document.querySelector('#street-name').style[system.cssTransform] = 
        'scale(' + multiplier + ')';
  }

  function _onResize() {
    var viewportWidth = window.innerWidth;
    var viewportHeight = window.innerHeight;

    var streetSectionHeight = 
        document.querySelector('#street-section').offsetHeight;

    var toolsTop = document.querySelector('footer').offsetTop;

    var pos = (viewportHeight - streetSectionHeight) / 2;

    // TODO const
    if (pos + document.querySelector('#street-section').offsetHeight > 
      toolsTop - 20) {
      pos = toolsTop - 20 - streetSectionHeight;
    }

    document.querySelector('#street-section').style.top = pos + 'px';

    if (pos < 0) {
      pos = 0;
    }
    document.querySelector('#street-section-sky').style.paddingTop = pos + 'px';
    document.querySelector('#street-section-sky').style.marginTop = -pos + 'px';

    streetSectionCanvasLeft = 
        ((viewportWidth - street.width * TILE_SIZE) / 2);

    document.querySelector('#street-section-canvas').style.left = 
      streetSectionCanvasLeft + 'px';

    document.querySelector('#editable-street-section').style.width = 
      (street.width * TILE_SIZE) + 'px';

    _resizeStreetName();
  }

  function _getDefaultSegments() {
    street.segments = [];

    for (var i in DEFAULT_SEGMENTS[DEFAULT_STREET_WIDTH]) {
      var segment = DEFAULT_SEGMENTS[DEFAULT_STREET_WIDTH][i];
      segment.warnings = [];

      street.segments.push(segment);
    }

    _normalizeAllSegmentWidths();
  }

  function _createStreetWidthOption(width) {
    var el = document.createElement('option');
    el.value = width;
    el.innerHTML = _prettifyWidth(width, PRETTIFY_WIDTH_OUTPUT_NO_MARKUP);
    return el;
  }

  function _buildStreetWidthMenu() {
    document.querySelector('#street-width').innerHTML = '';

    var el = document.createElement('option');
    el.disabled = true;
    el.innerHTML = 'Building-to-building width:';
    document.querySelector('#street-width').appendChild(el);  

    var widths = [];    

    for (var i in DEFAULT_STREET_WIDTHS) {
      var width = _normalizeStreetWidth(DEFAULT_STREET_WIDTHS[i]);
      var el = _createStreetWidthOption(width);
      document.querySelector('#street-width').appendChild(el);

      widths.push(width);
    }

    if (widths.indexOf(parseFloat(street.width)) == -1) {
      var el = document.createElement('option');
      el.disabled = true;
      document.querySelector('#street-width').appendChild(el);      

      var el = _createStreetWidthOption(street.width);
      document.querySelector('#street-width').appendChild(el);      
    }

    var el = document.createElement('option');
    el.value = STREET_WIDTH_CUSTOM;
    el.innerHTML = 'Custom…';
    document.querySelector('#street-width').appendChild(el);  

    document.querySelector('#street-width').value = street.width;    
  }

  function _onStreetWidthChange(event) {
    var el = event.target;
    var newStreetWidth = el.value;

    if (newStreetWidth == street.width) {
      return;
    }

    if (newStreetWidth == STREET_WIDTH_CUSTOM) {
      var width = prompt("Enter the new street width (from " + 
          _prettifyWidth(MIN_CUSTOM_STREET_WIDTH, PRETTIFY_WIDTH_OUTPUT_NO_MARKUP) + 
          " to " + 
          _prettifyWidth(MAX_CUSTOM_STREET_WIDTH, PRETTIFY_WIDTH_OUTPUT_NO_MARKUP) + 
          "):");

      if (width) {
        width = _normalizeStreetWidth(_processWidthInput(width));
      }

      if (!width) {
        _buildStreetWidthMenu();

        _loseAnyFocus();
        return;
      }

      if (width < MIN_CUSTOM_STREET_WIDTH) {
        width = MIN_CUSTOM_STREET_WIDTH;
      } else if (width > MAX_CUSTOM_STREET_WIDTH) {
        width = MAX_CUSTOM_STREET_WIDTH;
      }
      newStreetWidth = width;
    }

    street.width = _normalizeStreetWidth(newStreetWidth);
    _buildStreetWidthMenu();
    _resizeStreetWidth();

    initializing = true;

    _createDomFromData();
    _segmentsChanged();

    initializing = false; 

    _loseAnyFocus();   
  }

  function _removeSegment(el) {
    if (el && el.parentNode) {
      _removeElFromDom(el);
      _segmentsChanged();

      _statusMessage.show('The segment has been deleted.', true);
    }
  } 

  function _getHoveredSegmentEl() {
    var el = document.elementFromPoint(mouseX, mouseY);
    while (el && el.classList && !el.classList.contains('segment')) {
      el = el.parentNode;
    }

    if (el.classList && el.classList.contains('segment')) {
      return el;
    } else {
      return null;
    }
  }

  function _showDebugInfo() {
    // deep object copy
    var debugStreetData = jQuery.extend(true, {}, street);
    var debugUndo = jQuery.extend(true, {}, undoStack);

    for (var i in debugStreetData.segments) {
      delete debugStreetData.segments[i].el;
    }

    for (var j in debugUndo) {
      for (var i in debugUndo[j].segments) {
        delete debugUndo[j].segments[i].el;
      }
    }

    var debugText = 
        'DATA:\n' + JSON.stringify(debugStreetData, null, 2) +
        '\n\nUNDO:\n' + JSON.stringify(debugUndo, null, 2);

    document.querySelector('#debug').classList.add('visible');
    document.querySelector('#debug > textarea').innerHTML = debugText;
    document.querySelector('#debug > textarea').focus();
    document.querySelector('#debug > textarea').select();
    event.preventDefault();
  }

  function _onBodyKeyDown(event) {
    switch (event.keyCode) {
      case KEY_RIGHT_ARROW:
      case KEY_EQUAL:
        if (event.metaKey || event.ctrlKey || event.altKey) {
          return;
        }

        if (document.activeElement == document.body) {
          var segmentHoveredEl = _getHoveredSegmentEl();
          if (segmentHoveredEl) {
            _incrementSegmentWidth(segmentHoveredEl, true, event.shiftKey);
          }
          event.preventDefault();
        }
        break;
      case KEY_LEFT_ARROW:
      case KEY_MINUS:
        if (event.metaKey || event.ctrlKey || event.altKey) {
          return;
        }

        if (document.activeElement == document.body) {
          var segmentHoveredEl = _getHoveredSegmentEl();
          if (segmentHoveredEl) {
            _incrementSegmentWidth(segmentHoveredEl, false, event.shiftKey);
          }
          event.preventDefault();
        }
        break;
      case KEY_BACKSPACE:
      case KEY_DELETE:
        if (event.metaKey || event.ctrlKey || event.altKey) {
          return;
        }

        if (document.activeElement == document.body) {
          var segmentHoveredEl = _getHoveredSegmentEl();
          _removeSegment(segmentHoveredEl);
          event.preventDefault();
        }
        break;
      case KEY_ESC:
        _hideDebugInfo();
        if (infoBubbleVisible) {
          _hideInfoBubble();
        }
        event.preventDefault();
        break;
      case KEY_Z:
        if (!event.shiftKey && (event.metaKey || event.ctrlKey)) {
          _undo();
          event.preventDefault();
        } else if (event.shiftKey && (event.metaKey || event.ctrlKey)) {
          _redo();
          event.preventDefault();
        }
        break;
      case KEY_Y:
        if (event.metaKey || event.ctrlKey) {
          _redo();
          event.preventDefault();
        }   
        break;   
      case KEY_D:
        if (event.shiftKey && (document.activeElement == document.body)) {
          _showDebugInfo();
          event.preventDefault();
        }
        break;
    }
  }

  function _onRemoveButtonClick(event) {
    var el = event.target.segmentEl;

    if (el) {
      _removeSegment(el);
    }
  }

  function _updateStreetName() {
    $('#street-name > div').text(street.name);
    _resizeStreetName();
  }

  function _normalizeStreetName(name) {
    if (name.length > MAX_STREET_NAME_WIDTH) {
      name = name.substr(0, MAX_STREET_NAME_WIDTH) + '…';
    }

    return name;
  }

  function _askForStreetName() {
    var newName = prompt('New street name:', street.name);

    if (newName) {
      street.name = _normalizeStreetName(newName);

      _updateStreetName();
      _saveChangesIfAny();
    }
  }

  function _onWindowBlur() {
    _hideMenus();
  }

  function _addEventListeners() {
    window.addEventListener('blur', _onWindowBlur);

    window.addEventListener('beforeunload', _onWindowBeforeUnload);

    document.querySelector('#street-name').addEventListener('click', _askForStreetName);

    document.querySelector('#undo').addEventListener('click', _undo);
    document.querySelector('#redo').addEventListener('click', _redo);

    document.querySelector('#street-width').
        addEventListener('change', _onStreetWidthChange);

    window.addEventListener('resize', _onResize);

    if (!system.touch) {
      window.addEventListener('mousedown', _onBodyMouseDown);
      window.addEventListener('mousemove', _onBodyMouseMove);
      window.addEventListener('mouseup', _onBodyMouseUp); 
    } else {
      window.addEventListener('touchstart', _onBodyMouseDown);
      window.addEventListener('touchmove', _onBodyMouseMove);
      window.addEventListener('touchend', _onBodyMouseUp); 
    }
    window.addEventListener('keydown', _onBodyKeyDown);  

    document.querySelector('#options-menu-button').addEventListener('click', _onOptionsMenuClick);
    document.querySelector('#options-menu-imperial').addEventListener('click', _onMenuImperial);
    document.querySelector('#options-menu-metric').addEventListener('click', _onMenuMetric);

    document.querySelector('#share-menu-button').addEventListener('click', _onShareMenuClick);
  }

  function _detectEnvironment() {
    var url = location.href;

    if (url.substr(0, SITE_URL_LOCAL.length) == SITE_URL_LOCAL) {
      system.environment = ENVIRONMENT_LOCAL;
      system.apiUrl = API_URL_LOCAL;
    } else if (url.substr(0, SITE_URL_STAGING.length) == SITE_URL_STAGING) {
      system.environment = ENVIRONMENT_STAGING;
      system.apiUrl = API_URL_STAGING;
    } else if (url.substr(0, SITE_URL_PRODUCTION.length) == SITE_URL_PRODUCTION) {
      system.environment = ENVIRONMENT_PRODUCTION;
      system.apiUrl = API_URL_PRODUCTION;
    }

    //console.log('environment', system.environment);
    //console.log('api url', system.apiUrl);
  }

  function _detectSystemCapabilities() {
    _detectEnvironment();

    system.touch = Modernizr.touch;
    system.hiDpi = window.devicePixelRatio;    

    if (system.touch) {
      document.body.classList.add('touch-support');
    }

    system.cssTransform = false;
    var el = document.createElement('div');
    for (var i in CSS_TRANSFORMS) {
      if (typeof el.style[CSS_TRANSFORMS[i]] != 'undefined') {
        system.cssTransform = CSS_TRANSFORMS[i];
        break;
      }
    }
  }

  var _statusMessage = {
    timerId: -1,

    show: function(text, undo) {
      window.clearTimeout(_statusMessage.timerId);

      document.querySelector('#status-message > div').innerHTML = text;

      if (undo) {
        var buttonEl = document.createElement('button');
        buttonEl.innerHTML = 'Undo';
        buttonEl.addEventListener('click', _undo);
        document.querySelector('#status-message > div').appendChild(buttonEl);
      }

      var el = document.createElement('button');
      el.classList.add('close');
      el.addEventListener('click', _statusMessage.hide);
      el.innerHTML = '×';
      document.querySelector('#status-message > div').appendChild(el);      

      document.querySelector('#status-message').classList.add('visible');

      _statusMessage.timerId = 
          window.setTimeout(_statusMessage.hide, STATUS_MESSAGE_HIDE_DELAY);
    },

    hide: function() {
      document.querySelector('#status-message').classList.remove('visible');
    }
  };

  // Copies only the data necessary for save/undo.
  function _trimNonUserData() {
    var newData = {};

    newData.width = street.width;
    newData.name = street.name;

    newData.segments = [];

    for (var i in street.segments) {
      var segment = {};
      segment.type = street.segments[i].type;
      segment.width = street.segments[i].width;

      newData.segments.push(segment);
    }

    return newData;
  }

  function _isUndoAvailable() {
    return undoPosition > 0;
  }

  function _isRedoAvailable() {
    return undoPosition < undoStack.length - 1;
  }

  function _updateUndoButtons() {
    document.querySelector('#undo').disabled = !_isUndoAvailable();
    document.querySelector('#redo').disabled = !_isRedoAvailable();
  }

  function _hideLoadingScreen() {
    document.querySelector('#loading').classList.add('hidden');
  }

  function _onOptionsMenuClick() {
    var el = document.querySelector('#options-menu');

    if (!el.classList.contains('visible')) {
      el.classList.add('visible');
    } else {
      _hideMenus();
    }
  }

  function _hideMenus() {
    _loseAnyFocus();

    document.querySelector('#options-menu').classList.remove('visible');
    document.querySelector('#share-menu').classList.remove('visible');
  }

  function _onShareMenuClick() {
    var el = document.querySelector('#share-menu');

    if (!el.classList.contains('visible')) {
      el.classList.add('visible');

      document.querySelector('#share-via-link').focus();
      document.querySelector('#share-via-link').select();
    } else {
      _hideMenus();
    }
  }

  function _fillOutDefaultSettings() {
    if (typeof settings.units === 'undefined') {
      settings.units = SETTINGS_UNITS_IMPERIAL;
    }

    if (typeof settings.unitsSelectedManually === 'undefined') {
      settings.unitsSelectedManually = false;
    }
  }

  function _loadSettings() {
    var savedSettings = window.localStorage[LOCAL_STORAGE_SETTINGS_ID];
    if (savedSettings) {
      settings = JSON.parse(savedSettings);
    } else {
      settings = {};
    }

    _fillOutDefaultSettings();
    _saveSettings();
  }

  function _saveSettings() {
    window.localStorage[LOCAL_STORAGE_SETTINGS_ID] = JSON.stringify(settings);
  }

  function _normalizeAllSegmentWidths() {
    for (var i in street.segments) {
      street.segments[i].width = 
          _normalizeSegmentWidth(street.segments[i].width, RESIZE_TYPE_INITIAL);
    }
  }

  function _updateUnits(newUnits, manually) {
    settings.unitsSelectedManually = manually;

    if (settings.units == newUnits) {
      return;
    }

    settings.units = newUnits;

    // If the user converts and then straight converts back, we just reach
    // to undo stack instead of double conversion (which could be lossy).
    if (undoStack[undoPosition - 1] && 
        (undoStack[undoPosition - 1].settings.units == newUnits)) {
      var fromUndo = true;
    } else {
      var fromUndo = false;
    }

    _propagateSettings();

    ignoreStreetChanges = true;
    if (!fromUndo) {
      _normalizeAllSegmentWidths();

      if (street.remainingWidth == 0) {
        street.width = 0;
        for (var i in street.segments) {
          street.width += street.segments[i].width;
        }
      } else {
        street.width = _normalizeStreetWidth(street.width);
      }
    } else {
      data = undoStack[undoPosition - 1];
    }
    _createDomFromData();
    _segmentsChanged();
    _resizeStreetWidth();

    ignoreStreetChanges = false;      

    _buildStreetWidthMenu();
    _updateOptionsMenu();
    _hideMenus();

    _saveChangesIfAny();
    _saveSettings();
  }

  function _onMenuMetric(event) {
    _updateUnits(SETTINGS_UNITS_METRIC, true);
    event.preventDefault();
  }

  function _onMenuImperial(event) {
    _updateUnits(SETTINGS_UNITS_IMPERIAL, true);
    event.preventDefault();
  }

  function _propagateSettings() {
    switch (settings.units) {
      case SETTINGS_UNITS_IMPERIAL:
        segmentWidthResolution = SEGMENT_WIDTH_RESOLUTION_IMPERIAL;
        segmentWidthClickIncrement = SEGMENT_WIDTH_CLICK_INCREMENT_IMPERIAL;
        segmentWidthDraggingResolution = 
            SEGMENT_WIDTH_DRAGGING_RESOLUTION_IMPERIAL;
        break;
      case SETTINGS_UNITS_METRIC:
        segmentWidthResolution = SEGMENT_WIDTH_RESOLUTION_METRIC;
        segmentWidthClickIncrement = SEGMENT_WIDTH_CLICK_INCREMENT_METRIC;
        segmentWidthDraggingResolution = 
            SEGMENT_WIDTH_DRAGGING_RESOLUTION_METRIC;
        break;
    }

    _updateOptionsMenu();
  }

  function _getPageTitle() {
    return 'Streetmix';
  }

  function _updateFacebookLink(url) {
    var el = document.querySelector('#share-via-facebook');

    var text = 'Check out Streetmix, a Web-based street builder!';

    el.href = 'https://www.facebook.com/dialog/feed?' +
        'app_id=' + FACEBOOK_APP_ID +
        '&redirect_uri=' + encodeURIComponent(url) + 
        '&link=' + encodeURIComponent(url) + 
        '&name=' + encodeURIComponent(_getPageTitle()) +
        '&description=' + encodeURIComponent(text);
  }

  function _updateTwitterLink(url) {
    var el = document.querySelector('#share-via-twitter');

    var text = 'Check out Streetmix, a Web-based street builder!';

    el.href = 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(text) + 
        '&url=' + encodeURIComponent(url);
  }

  function _updateNakedLink(url) {
    document.querySelector('#share-via-link').value = url;
  }

  function _updateShareMenu() {
    if (system.environment == ENVIRONMENT_PRODUCTION) {
      var url = location.href;
    } else {
      var url = SITE_URL_PRODUCTION;
    }

    _updateNakedLink(url);
    _updateTwitterLink(url);
    _updateFacebookLink(url);

    if (!signedIn) {
      document.querySelector('#sign-in-promo').classList.add('visible');
    }
  }

  function _updateOptionsMenu() {
    switch (settings.units) {
      case SETTINGS_UNITS_IMPERIAL:
        document.querySelector('#options-menu-imperial').classList.add('disabled');
        document.querySelector('#options-menu-metric').classList.remove('disabled');
        break;
      case SETTINGS_UNITS_METRIC:
        document.querySelector('#options-menu-imperial').classList.remove('disabled');
        document.querySelector('#options-menu-metric').classList.add('disabled');
        break;
    }
  }

  function _onEverythingLoaded() {
    _propagateSettings();

    street.name = DEFAULT_NAME;
    street.width = _normalizeStreetWidth(DEFAULT_STREET_WIDTH);

    _resizeStreetWidth();
    _updateStreetName();
    _getDefaultSegments();
    _createTools();
    _createDomFromData();
    _segmentsChanged();
    _updateShareMenu();

    initializing = false;    
    ignoreStreetChanges = false;
    lastStreet = _trimNonUserData();

    _buildStreetWidthMenu();
    _onResize();
    _addEventListeners();
    _hideLoadingScreen();
  }

  function _checkIfEverythingIsLoaded() {
    if ((imagesToBeLoaded == 0) && signInLoaded && bodyLoaded && readyStateCompleteLoaded) {
      _onEverythingLoaded();
    }
  }

  function _onImageLoaded() {
    imagesToBeLoaded--;

    _checkIfEverythingIsLoaded();
  }

  function _loadImages() {
    images = [];
    imagesToBeLoaded = IMAGES_TO_BE_LOADED.length;

    for (var i in IMAGES_TO_BE_LOADED) {
      var url = IMAGES_TO_BE_LOADED[i];
      images[url] = document.createElement('img');
      images[url].addEventListener('load', _onImageLoaded);
      images[url].src = url + '?v' + TILESET_IMAGE_VERSION;
    }    
  }

  function _saveSignInData() {
    window.localStorage[LOCAL_STORAGE_SIGN_IN_ID] = JSON.stringify(signInData);
  }

  function _removeSignInCookies() {
    $.removeCookie(SIGN_IN_TOKEN_COOKIE);
    $.removeCookie(USER_ID_COOKIE);
  }

  function _loadSignIn() {
    signInLoaded = false;

    var signInCookie = $.cookie(SIGN_IN_TOKEN_COOKIE);
    var userIdCookie = $.cookie(USER_ID_COOKIE);

    if (signInCookie && userIdCookie) {
      signInData = { token: signInCookie, userId: userIdCookie };

      _removeSignInCookies();
      _saveSignInData();
    } else {
      if (window.localStorage[LOCAL_STORAGE_SIGN_IN_ID]) {
        signInData = JSON.parse(window.localStorage[LOCAL_STORAGE_SIGN_IN_ID]);
      }
    }

    if (signInData && signInData.token) {
      if (signInData.details) {
        signedIn = true;
        _signInLoaded();
      } else {
        _getSignInDetails();
      }
    } else {
      signedIn = false;
      _signInLoaded();
    }
  }

  function _getSignInDetails() {
    // TODO const
    jQuery.ajax({
      url: system.apiUrl + 'v1/users/' + signInData.userId
    }).done(_receiveSignInDetails).fail(_noSignInDetails);
  }

  function _receiveSignInDetails(details) {
    signInData.details = details;
    _saveSignInData();

    signedIn = true;
    _signInLoaded();
  }

  function _noSignInDetails() {    
    signedIn = false;
    _signInLoaded();
  }

  function _signOut(event) {
    _removeSignInCookies();
    window.localStorage.removeItem(LOCAL_STORAGE_SIGN_IN_ID);
    _sendSignOutToServer();

    event.preventDefault();
  }

  function _getAuthHeader() {
    return 'Streetmix realm="" loginToken="' + signInData.token + '"'
  }

  function _sendSignOutToServer() {
    jQuery.ajax({
      // TODO const
      url: system.apiUrl + 'v1/users/' + signInData.userId + '/login-token',
      type: 'DELETE',
      headers: { 'Authorization': _getAuthHeader() }
    }).done(_receiveSignOutConfirmationFromServer)
    .fail(_receiveSignOutConfirmationFromServer);
  }

  function _receiveSignOutConfirmationFromServer() {
    location.href = '/';
  }

  function _createSignInUI() {
    if (signedIn) {
      var el = document.createElement('img');
      el.src = signInData.details.profileImageUrl;
      el.classList.add('avatar');
      document.querySelector('#identity').appendChild(el);

      var el = document.createElement('span');
      el.innerHTML = signInData.details.username;
      el.classList.add('id');
      document.querySelector('#identity').appendChild(el);

      document.querySelector('#identity').classList.add('visible');

      var el = document.createElement('a');
      el.href = '/';
      el.classList.add('command');
      el.innerHTML = 'Sign out';
      el.addEventListener('click', _signOut);
      document.querySelector('#sign-in-link').appendChild(el);
    } else {
      var el = document.createElement('a');
      el.href = '/twitter-sign-in';
      el.classList.add('command');
      el.innerHTML = 'Sign in';
      document.querySelector('#sign-in-link').appendChild(el);

      document.querySelector('#identity').classList.remove('visible');
    }
  }

  function _signInLoaded() {
    signInLoaded = true;
    _createSignInUI();
    _checkIfEverythingIsLoaded();
  }

  function _detectUnitType() {
    if (!settings.unitsSelectedManually) {
      $.ajax({ url: IP_GEOCODING_API_URL }).done(_receiveUnitType);
    }
  }

  function _receiveUnitType(info) {
    if (info && info.country_code && !settings.unitsSelectedManually) {
      if (IMPERIAL_COUNTRY_CODES.indexOf(info.country_code) != -1) {
        _updateUnits(SETTINGS_UNITS_IMPERIAL, false);
      } else {
        _updateUnits(SETTINGS_UNITS_METRIC, false);
      }
    }
  }

  function _onBodyLoad() {
    bodyLoaded = true;

    _checkIfEverythingIsLoaded();
  }

  function _onReadyStateChange() {
    if (document.readyState == 'complete') {
      readyStateCompleteLoaded = true;

      _checkIfEverythingIsLoaded();
    }
  }
 
  main.init = function() {
    readyStateCompleteLoaded = false;
    document.addEventListener('readystatechange', _onReadyStateChange);

    bodyLoaded = false;
    window.addEventListener('load', _onBodyLoad);

    initializing = true;
    ignoreStreetChanges = true;

    _detectSystemCapabilities();
    _loadSettings();

    // Asynchronously loading…

    // …detecting unit type from IP (if not previously manually selected)
    // TODO only make it work for new streets
    _detectUnitType();

    // …sign in info from our API (if not previously cached)
    _loadSignIn();

    // …images
    _loadImages();

    // Note that we are waiting for sign in and image info to show the page,
    // but not for unit info.
  }

  return main;
})();
