AFRAME.registerComponent('bar-volume', {
  dependencies: ['size'],
  init: function () {
    
  },
  tick: function (time, deltaTime) {
    if (init) {
      const volume = analyserDataArray[0];

      if (volume > 0.005) this.el.object3D.scale.y = volume * 200;
      else if (this.el.object3D.scale.y > 1) this.el.object3D.scale.y -= 0.1;
    }
  },
  events: {
    click: function (evt) { //click: function (evt) { //click-------
        //serve per far si che le modifiche fatte al cubo siano condivise per tutti (in questo caso agisce solo sul colore)
        NAF.utils.takeOwnership(this.el);

        
        console.log("00001");

    }
},
});

//Aggiungere NAF.schema, se si vuole fare in modo che la scala delle mie barre cambi anche per gli altri utenti
AFRAME.registerComponent('bar-volume-diff', {
  dependencies: ['size'],
  init: function () {
    sendTimeStamp('bar-vol-creation-event');
  },
  tick: function (time, deltaTime) {
    if (init && NAF.utils.isMine(this.el)) {
      const volume = analyserDataArray[0]; //essentia
      //const volume = toneRms; //tone
      // volume > 0.005
      if (volume > 0.0025) {
        this.el.object3D.scale.y = volume * 100; //200
        //sendTimeStamp('bar-vol-change-event');
      }
      else if (this.el.object3D.scale.y > 1) {
        this.el.object3D.scale.y -= 0.1;
      }
    }
    
  },
});

AFRAME.registerComponent('bars-waveform', {
  dependencies: ['size'],

  schema: {
    num: {
      type: 'number',
      default: 32, //32
    },
  },

  init: function () {
    const el = this.el;
    const data = this.data;

    this.bars = new Array(data.num);

    for (let i = 0; i < data.num; i++) {
      this.bars[i] = document.createElement('a-entity');

      this.bars[i].setAttribute('geometry', {
        primitive: 'box',
        height: 3,
        width: 1,
      });
      this.bars[i].setAttribute('position', {
        x: i,
        y: 0,
        z: 10, //-3
      });
      this.bars[i].setAttribute('random-color', '');

      el.appendChild(this.bars[i]);
    }
  },

  tick: function (time, deltaTime) {
    var data = this.data;

    if (init && toneFFT != null) {
      //const samples = getEsSamples();
      const samples = toneFFT;

      for (let i = 0; i < data.num; i++) {
        var bar = this.bars[i];

        if (samples[i] != 0) bar.object3D.scale.y = samples[i] / 10; //10
      }

      sendTimeStamp('FFT');

    }
  },
});

AFRAME.registerComponent('labbro', {
  dependencies: ['size'],

  schema: {
    type: {
      type: 'string',
      default: 'sup',
    },
  },

  init: function () {
    const el = this.el;
    const data = this.data;

    this.pos = el.object3D.position.y;

    //this.rad = el.object3D.radius;
  },

  tick: function (time, deltaTime) {
    if (init) {
      const el = this.el;
      //const volume = toneRms;
      const volume = analyserDataArray[0] * 2.5; //1.5
      const data = this.data;

      if (volume > 0.002) { //0.008
        sendTimeStamp('VolumeRMS');
        if (data.type == 'sup') {
          el.object3D.position.y = this.pos + volume;
          //sendTimeStamp('labbra-up');
        } else if (data.type == 'inf') {
          el.object3D.position.y = this.pos - volume;
          //sendTimeStamp('labbra-down');
        }
        /*else if (data.type == 'bocc') {
          el.object3D.radius = volume*1000;
        }*/
      } else {
        el.object3D.position.y = this.pos;

        //el.object3D.radius = this.rad;
      }
    }
  },
});

// ----------------- HUD ----------------------

AFRAME.registerComponent('chord', {
  tick: function (time, deltaTime) {
    this.el.setAttribute('value', 'Chord: ' + chord);
  },
});

AFRAME.registerComponent('rms', {
  tick: function (time, deltaTime) {
    const volume = toneRms;
    this.el.setAttribute(
      'value',
      'RMS: ' + Math.round(volume * Math.pow(10, 5), 2)
    );
  },
});

// -------------- Hairs -------------------

AFRAME.registerComponent('hairs', {
  dependencies: ['size'],

  schema: {
    num: {
      type: 'number',
      default: 3,
    },
  },

  init: function (time, deltaTime) {
    const data = this.data;
    const el = this.el;
    const width = 0.5 / data.num;

    this.bars = new Array(data.num);

    console.log(data.num);

    for (let i = 0; i < data.num; i++) {
      this.bars[i] = document.createElement('a-entity');

      this.bars[i].setAttribute('geometry', {
        primitive: 'box',
      });

      this.bars[i].setAttribute(
        'networked',
        'template:#hair-template;attachTemplateToLocal:false;'
      );

      this.bars[i].object3D.scale.set(width, 0.1, 0.1);
      this.bars[i].object3D.position.set(width * i - 0.25, 0.3, 0);

      this.bars[i].setAttribute('random-color', '');
      this.bars[i].setAttribute('hair', 'id:' + i);

      this.bars[i].setAttribute('visible', 'false');

      el.appendChild(this.bars[i]);
    }
  },
});

AFRAME.registerComponent('hair', {
  dependencies: ['size'],

  schema: {
    id: {
      type: 'number',
      default: -1,
    },
  },

  init: function () {
    const data = this.data;
    const el = this.el;

    el.setAttribute('class', 'hair');
  },
  tick: function () {
    const data = this.data;
    const el = this.el;

    if (data.id != -1 && init && toneFFT != null) {
      if (toneFFT[data.id] != 0) {
        el.object3D.scale.y = toneFFT[data.id] / Math.pow(2, 8);
      }
    }
  },
});


//////////////

function sendTimeStamp(nomeEvento){
  var creationTime = new Date().getTime();
  NAF.connection.broadcastDataGuaranteed("msg-delay", nomeEvento + ':' + creationTime);
  
}