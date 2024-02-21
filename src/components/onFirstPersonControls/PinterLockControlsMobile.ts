/* eslint-disable camelcase */
import { Camera, Euler, EventDispatcher, Vector3 } from 'three';
import { isMobile } from './composables/utils'

const _changeEvent = { type: 'change' };
const _lockEvent = { type: 'lock' };
const _unlockEvent = { type: 'unlock' };

const _PI_2 = Math.PI / 2;

class PointerLockControls extends EventDispatcher {
  domElement: HTMLElement;
  camera: Camera;
  isLocked = false;

  minPolarAngle = 0; // radians
  maxPolarAngle = Math.PI; // radians

  vector = new Vector3();
  euler = new Euler(0, 0, 0, 'YXZ');

  previousTouch?: Touch;

  onMouseMoveBind = this.onMouseMove.bind(this);
  onPointerlockChangeBind = this.onPointerlockChange.bind(this);
  onPointerlockErrorBind = this.onPointerlockError.bind(this);
  onTouchMoveBind = this.onTouchMove.bind(this);
  onTouchEndBind = this.onTouchEnd.bind(this);

  constructor(camera: Camera, domElement: HTMLElement) {
    super();

    if (domElement === undefined) {
      console.warn(
        'THREE.PointerLockControls: The second parameter "domElement" is now mandatory.'
      );
      domElement = document.body;
    }

    this.camera = camera;
    this.domElement = domElement;

    this.connect();
  }

  onTouchMove(e: TouchEvent) {
    let touch: Touch | undefined;

    switch (e.touches.length) {
      case 1:
        if (e.touches[0].target === this.domElement) touch = e.touches[0];
        break;
      case 2:
        if (e.touches[0].target === this.domElement) touch = e.touches[0];
        else if (e.touches[1].target === this.domElement) touch = e.touches[1];
        break;
    }
    if (!touch) return;

    const movementX = this.previousTouch
      ? touch.pageX - this.previousTouch.pageX
      : 0;
    const movementY = this.previousTouch
      ? touch.pageY - this.previousTouch.pageY
      : 0;

    this.updatePosition(movementX, movementY, 0.004);

    this.previousTouch = touch;
  }

  onTouchEnd() {
    this.previousTouch = undefined;
  }

  onMouseMove(event: MouseEvent) {
    if (this.isLocked === false) return;

    const movementX: number =
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      event.movementX || event.mozMovementX || event.webkitMovementX || 0;
    const movementY: number =
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      event.movementY || event.mozMovementY || event.webkitMovementY || 0;

    this.updatePosition(movementX, movementY, 0.002);
  }

  updatePosition(movementX: number, movementY: number, multiplier: number) {
    this.euler.setFromQuaternion(this.camera.quaternion);

    this.euler.y -= movementX * multiplier;
    this.euler.x -= movementY * multiplier;

    this.euler.x = Math.max(
      _PI_2 - this.maxPolarAngle,
      Math.min(_PI_2 - this.minPolarAngle, this.euler.x)
    );

    this.camera.quaternion.setFromEuler(this.euler);

    this.dispatchEvent(_changeEvent);
  }

  onPointerlockChange() {
    if (this.domElement.ownerDocument.pointerLockElement === this.domElement) {
      this.dispatchEvent(_lockEvent);

      this.isLocked = true;
    } else {
      this.dispatchEvent(_unlockEvent);

      this.isLocked = false;
    }
  }

  onPointerlockError() {
    console.error('THREE.PointerLockControls: Unable to use Pointer Lock API');
  }

  connect() {
    this.domElement.addEventListener('touchmove', this.onTouchMoveBind, false);
    this.domElement.addEventListener('touchend', this.onTouchEndBind, false);
    this.domElement.ownerDocument.addEventListener(
      'mousemove',
      this.onMouseMoveBind
    );
    this.domElement.ownerDocument.addEventListener(
      'pointerlockchange',
      this.onPointerlockChangeBind
    );
    this.domElement.ownerDocument.addEventListener(
      'pointerlockerror',
      this.onPointerlockErrorBind
    );
  }

  disconnect() {
    this.domElement.removeEventListener(
      'touchmove',
      this.onTouchMoveBind,
      false
    );
    this.domElement.removeEventListener('touchend', this.onTouchEndBind, false);
    this.domElement.ownerDocument.removeEventListener(
      'mousemove',
      this.onMouseMoveBind
    );
    this.domElement.ownerDocument.removeEventListener(
      'pointerlockchange',
      this.onPointerlockChangeBind
    );
    this.domElement.ownerDocument.removeEventListener(
      'pointerlockerror',
      this.onPointerlockErrorBind
    );
  }

  dispose() {
    this.disconnect();
  }

  getObject() {
    return this.camera;
  }

  getDirection() {
    const direction = new Vector3(0, 0, -1);

    return (v: Vector3) => {
      return v.copy(direction).applyQuaternion(this.camera.quaternion);
    };
  }

  moveForward(distance: number) {
    this.vector.setFromMatrixColumn(this.camera.matrix, 0);

    this.vector.crossVectors(this.camera.up, this.vector);

    this.camera.position.addScaledVector(this.vector, distance);
  }

  moveRight(distance: number) {
    this.vector.setFromMatrixColumn(this.camera.matrix, 0);

    this.camera.position.addScaledVector(this.vector, distance);
  }

  lock() {
    if (typeof this.domElement.requestPointerLock !== 'undefined' && !isMobile())
      this.domElement.requestPointerLock();
  }

  unlock() {
    if (typeof this.domElement.requestPointerLock !== 'undefined')
      this.domElement.ownerDocument.exitPointerLock();
  }
}

export { PointerLockControls };