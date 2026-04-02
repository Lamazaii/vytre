// Default Fabric.js object properties (selectable, controls, corners)
export const objectDefaults = {
  selectable: true,
  evented: true,
  hasControls: true,
  hasBorders: true,
  lockRotation: false,
  lockScalingX: false,
  lockScalingY: false,
  lockMovementX: false,
  lockMovementY: false,
  lockSkewingX: false,
  lockSkewingY: false,
  transparentCorners: false,
  cornerSize: 10,
  cornerColor: 'rgba(178, 204, 255, 1)',
  cornerStrokeColor: 'rgba(102, 153, 255, 1)',
  borderColor: 'rgba(102, 153, 255, 1)',
  borderScaleFactor: 1,
  rotatingPointOffset: 30,
  strokeUniform: true,
}

// Arrow defaults: locked scale (uniform width/height)
export const arrowDefaults = {
  ...objectDefaults,
  lockScalingX: true,
  lockScalingY: true,
}

// Fabric.js canvas rendering and stacking options
export const canvasConfig = {
  backgroundColor: '#ffffff',
  preserveObjectStacking: true,
  renderOnAddRemove: true,
}
