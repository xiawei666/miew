

/**
 * @author mrdoob / http://mrdoob.com/
 */

import CSS2DObject from './CSS2DObject';
import * as THREE from 'three';

const tempColor = new THREE.Color();

function CSS2DRenderer() {

  this._width = 0;
  this._height = 0;
  this._widthHalf = 0;
  this._heightHalf = 0;

  this._vector = new THREE.Vector3();
  this._viewMatrix = new THREE.Matrix4();
  this._projectionMatrix = new THREE.Matrix4();

  this._domElement = document.createElement('div');
  this._domElement.style.overflow = 'hidden';
  this._domElement.style.position = 'absolute';
  this._domElement.style.top = '0';
  this._domElement.style.pointerEvents = 'none';
}

CSS2DRenderer.prototype.getElement = function() {
  return this._domElement;
};

CSS2DRenderer.prototype.reset = function() {
  var myNode = this.getElement();
  while (myNode.firstChild) {
    myNode.removeChild(myNode.firstChild);
  }
};

CSS2DRenderer.prototype.setSize = function(width, height) {
  this._width = width;
  this._height = height;

  this._widthHalf = this._width / 2;
  this._heightHalf = this._height / 2;

  this._domElement.style.width = width + 'px';
  this._domElement.style.height = height + 'px';
};

CSS2DRenderer.prototype._renderObject = function(object, camera, scene) {

  function lerpColorAsHex(a, b, t) {
    tempColor.setHex(a);
    tempColor.lerp(b, t);
    return '#' + tempColor.getHexString();
  }

  function colorAsHex(a) {
    tempColor.setHex(a);
    return '#' + tempColor.getHexString();
  }

  if (object instanceof CSS2DObject) {
    this._vector.setFromMatrixPosition(object.matrixWorld);

    if (object.userData !== undefined && object.userData.offset !== undefined) {
      const localOffset = new THREE.Vector3(object.userData.offset.x, object.userData.offset.y, 0);
      this._vector.add(localOffset.multiplyScalar(object.matrixWorld.getMaxScaleOnAxis()));
    }

    this._vector.applyMatrix4(this._viewMatrix);

    const element = object.getElement();
    if (typeof scene.fog === 'undefined') {
      element.style.color = colorAsHex(object.userData.color);
      if (object.userData.background !== 'transparent') {
        element.style.background = colorAsHex(object.userData.background);
      }
    } else {
      const fogFactor = THREE.Math.smoothstep(-this._vector.z, scene.fog.near, scene.fog.far);
      element.style.color = lerpColorAsHex(object.userData.color, scene.fog.color, fogFactor);
      if (object.userData.background !== 'transparent') {
        element.style.background = lerpColorAsHex(object.userData.background, scene.fog.color, fogFactor);
      }
    }

    this._vector.applyMatrix4(this._projectionMatrix);

    const style = (object.userData !== {} ? object.userData.translation : 'translate(-50%, -50%) ') +
        'translate(' + (this._vector.x * this._widthHalf + this._widthHalf) + 'px,' +
        (-this._vector.y * this._heightHalf + this._heightHalf) + 'px)';
    element.style.visibility = 'visible';
    element.style.WebkitTransform = style;
    element.style.MozTransform = style;
    element.style.oTransform = style;
    element.style.transform = style;

    if (element.parentNode !== this._domElement) {
      this._domElement.appendChild(element);
    }
  }

  for (let i = 0, l = object.children.length; i < l; i++) {
    this._renderObject(object.children[i], camera, scene);
  }
};

CSS2DRenderer.prototype._hideObject = function(object) {
  if (object instanceof CSS2DObject) {
    var element = object.element;
    element.style.visibility = 'hidden';
  }

  for (var i = 0, l = object.children.length; i < l; i++) {
    this._hideObject(object.children[i]);
  }
};

CSS2DRenderer.prototype.render = function(scene, camera) {
  scene.updateMatrixWorld();

  if (camera.parent === null) {
    camera.updateMatrixWorld();
  }

  camera.matrixWorldInverse.getInverse(camera.matrixWorld);

  this._viewMatrix.copy(camera.matrixWorldInverse.getInverse(camera.matrixWorld));
  this._projectionMatrix.copy(camera.projectionMatrix);

  this._renderObject(scene, camera, scene);
};
export default CSS2DRenderer;

