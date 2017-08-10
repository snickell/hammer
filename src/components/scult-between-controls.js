import AFRAME from 'aframe';
import line from '../brushes/line';

AFRAME.registerComponent('sculpt-between-controls', {
    schema: {
        color: { type: 'color', default: '#ef2d5e' },
        size: { default: 0.01, min: 0.001, max: 0.3 },
        brush: { default: 'smooth' },
        enabled: { default: true }
    },
    init: function () {
        console.log("Loading component into it all");

        this.color = new THREE.Color(this.data.color);

        this.activeL = false;
        this.activeR = false;
        this.sizeModifier = 0;
        this.currentStroke = null;

        const leftHandEl = this.el.querySelector("#left-hand");
        const rightHandEl = this.el.querySelector("#right-hand");

        this.leftHandObj = leftHandEl.object3D;
        this.rightHandObj = rightHandEl.object3D;

        const onButtonChanged = (evt, leftHand) => {
            // Trigger
            if (evt.detail.id === 1) {
                var value = evt.detail.state.value;
                this.sizeModifier = value;

                var currentHandActive = value > 0.1;
                if (currentHandActive) {
                    // if neither brush is active, start a new stroke
                    if (!this.activeL && !this.activeR) {
                        this.startNewStroke();
                        console.log("Starting stroke");
                    }
                }
                if (leftHand) {
                    this.activeL = currentHandActive;
                } else {
                    this.activeR = currentHandActive;
                }

                // if at the end both strokes are inactive, cleanup
                if (!this.activeL && !this.activeR) {
                    this.previousEntity = this.currentEntity;
                    this.currentStroke = null;
                    console.log("Done with stroke");
                }
            }
        }

        rightHandEl.addEventListener('buttonchanged', evt => onButtonChanged(evt, false));
        leftHandEl.addEventListener('buttonchanged', evt => onButtonChanged(evt, true));
    },

    tick: (() => {
        var positionL = new THREE.Vector3();
        var rotationL = new THREE.Quaternion();
        var scaleL = new THREE.Vector3();

        var positionR = new THREE.Vector3();
        var rotationR = new THREE.Quaternion();
        var scaleR = new THREE.Vector3();

        let pointerPosR = new THREE.Vector3();
        let pointerPosL = new THREE.Vector3();
        return function tick(time, delta) {
            if (this.activeL || this.activeR) {
                this.leftHandObj.matrixWorld.decompose(positionL, rotationL, scaleL);
                pointerPosL = this.getPointerPosition(positionL, rotationL, pointerPosL);

                this.rightHandObj.matrixWorld.decompose(positionR, rotationR, scaleR);
                pointerPosR = this.getPointerPosition(positionR, rotationR, pointerPosR);

                // if both brushes are active, use both pointerPos, else both pointerPos are from the active brush
                const point1 = this.activeL ? pointerPosL : pointerPosR;
                const point2 = this.activeL && !this.activeR ? pointerPosL : pointerPosR;

                this.currentStroke.addPoint(point1, point2, rotationR, this.sizeModifier, time);
            }
        };
    })(),
    getPointerPosition: (function () {
        var offsets = {
                vec: new THREE.Vector3(0, 0, 1),
                mult: -0.1
        };

        return function getPointerPosition(position, orientation, pointerPosition) {
            var pointer = offsets.vec
                .clone()
                .applyQuaternion(orientation)
                .normalize()
                .multiplyScalar(offsets.mult);
            pointerPosition.copy(position).add(pointer);
            return pointerPosition;
        };
    })(),
    startNewStroke: function () {
        this.currentStroke = this.system.addNewStroke(this.data.brush, this.color, this.data.size);
        //this.el.emit('stroke-started', {entity: this.el, stroke: this.currentStroke});
    }
});
