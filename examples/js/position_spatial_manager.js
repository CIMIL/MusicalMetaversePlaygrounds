AFRAME.registerComponent("position-listener", {
  init: function(){
    position = new THREE.Vector3();
    direction = new THREE.Vector3();
    lookat = new THREE.Vector3();

    this.el.object3D.getWorldPosition(position);
    this.el.object3D.getWorldDirection(direction);

    Tone.Listener.positionX.value = position.x;
    Tone.Listener.positionY.value = position.y;
    Tone.Listener.positionZ.value = position.z;

    Tone.Listener.forwardX.value = -direction.x;
    Tone.Listener.forwardY.value = direction.y; 
    Tone.Listener.forwardZ.value = -direction.z;

    Tone.Listener.upX.value = 0;
    Tone.Listener.upY.value = 1;
    Tone.Listener.upZ.value = 0;
  },
  tick: function(){

    this.el.object3D.getWorldPosition(position);
    this.el.object3D.getWorldDirection(direction);

    Tone.Listener.positionX.value = position.x;
    Tone.Listener.positionY.value = position.y;
    Tone.Listener.positionZ.value = position.z;

    Tone.Listener.forwardX.value = -direction.x;
    Tone.Listener.forwardY.value = direction.y; 
    Tone.Listener.forwardZ.value = -direction.z;
    }
});

function sendTimeStamp(nomeEvento){
  var creationTime = new Date().getTime();
  NAF.connection.broadcastDataGuaranteed("msg-delay", nomeEvento + ':' + creationTime);
  
}


