NAF.schemas.getComponentsOriginal = NAF.schemas.getComponents;

Tone.Transport.start();
now = Tone.now();

wavesetting = ['sine', 'square', 'sawtooth'];
myWave = "";

arrayMusicale = [];
index = 0;
dropEnable = 0;
start = 0;

cubeSettings = [];
cubeSettings1 = [];

musicDrop = [];

externalDrop = [];
octave = 4;

cubeEnvelopeAttack = 3;
cubeEnvelopeDecay = 2;
cubeEnvelopeRelease = 0.5;
cubeEnvelopeSustain = 0.5;


AFRAME.registerComponent('intersection-spawn', {
    schema: {
        default: '',
        parse: AFRAME.utils.styleParser.parse
    },

    init: function () {
        var data = this.data;
        var el = this.el;

        el.addEventListener(data.event, evt => {
            if (evt.detail.intersection.object.el.id == "ground" && musicDrop.length != 0) {

                NAF.connection.broadcastDataGuaranteed('note-received', musicDrop);

                var spawnEl = document.createElement('a-entity');
                var correctPosition = evt.detail.intersection.point;
                correctPosition.y = 1.0; //0.550
                spawnEl.setAttribute('networked', { persistent: true, template: this.data.template });
                spawnEl.setAttribute('position', correctPosition);
                arrayMusicale[index] = 0;
                el.sceneEl.appendChild(spawnEl);
                NAF.utils.getNetworkedEntity(spawnEl).then((networkedEl) => {
                    document.body.dispatchEvent(new CustomEvent('persistentEntityCreated', { detail: { el: spawnEl } }));
                });

                sendTimeStamp('CreazioneCubo');

                document.querySelector('#notebox').setAttribute('value', '');

                //GUI creation
                var gui = document.createElement('a-entity');
                var guipos = correctPosition;
                guipos.x += 1.2; //2１
                guipos.y += 0.4; //１
                gui.setAttribute('networked', { persistent: true, template: this.data.template2 });
                gui.setAttribute('position', guipos);
                gui.setAttribute('rotation', '-15 0 0');
                //gui.setAttribute('id', index);
                el.sceneEl.appendChild(gui);
                NAF.utils.getNetworkedEntity(gui).then((networkedEl) => {
                    document.body.dispatchEvent(new CustomEvent('persistentEntityCreated', { detail: { el: gui } }));
                });

            }
        });
    }
});

AFRAME.registerComponent('index', {
    schema: {
        indice: { type: 'int' },
    },
    init: function () {
        this.data.indice = index;
    }
});

AFRAME.registerComponent('indexgui', {
    schema: {
        indice: { type: 'int' },
    },
    init: function () {
        this.data.indice = index - 1; 
    }
});

AFRAME.registerComponent("polysynth", {
    schema: {
        note: { type: 'string' },
        volume: { type: 'number' }, //0
        distortion: { type: 'number' }, //1
        attack: { type: 'number' }, //2
        decay: { type: 'number' }, //3
        sustain: { type: 'number' }, //4
        release: { type: 'number' }, //5

        frequency: { type: 'number' },
        
        square: {type: 'number'},
        sine: {type: 'number'},

        qval: { type: 'number' }
 
    },
    init: function () {

        this.objPos = index;

        this.physicalObj = this.el.object3D;
        
        cubeSettings[this.objPos] = [0,0,2,1,0,220,1,0,0,0,0]; //[0, 0, 3, 2, 0.5, 0.5];
        cubeSettings1[this.objPos] = ["","sine","","","","","","","sine", "square", "sawtooth"];

        this.pannerpolysynth = new Tone.Panner3D(this.physicalObj.position.x, this.physicalObj.position.y, this.physicalObj.position.z); //non sono sicuro funzioni correttamente tbh

            var dawave = cubeSettings[this.objPos][9];
            var iswave ="triangle";
            
            if(dawave == 0){
                iswave = "sine";
            }
            if(dawave == 1){
                iswave = "sine";
            }
            if(dawave == 2){
                iswave = "square";
            }
            if(dawave == 3){
                iswave = "sawtooth";
            }

            this.polysynth = new Tone.PolySynth().set({
                oscillator: {
                    type: cubeSettings1[this.objPos][1]
                },
                polyphony : 4 ,
                voice : Tone.Synth,
                envelope: {
                    attackCurve: "exponential",
                    attack: cubeSettings[this.objPos][1],
                    decay: cubeSettings[this.objPos][2],
                    sustain: cubeSettings[this.objPos][3],
                    release: cubeSettings[this.objPos][4],               
                }
            });

        this.distortion = new Tone.Distortion(0);    //amount of distortion, between 0-1

        this.filter = new Tone.Filter(200, "bandpass",-24);
        this.polysynth.chain(this.filter, this.distortion, this.pannerpolysynth, Tone.Destination); //original

        this.polysynth.volume.value = cubeSettings[this.objPos][0];
        this.distortion.set({ distortion: cubeSettings[this.objPos][7] });

        this.filter.frequency.value = cubeSettings[this.objPos][5];
        this.filter.Q.value = cubeSettings[this.objPos][6];
  
        this.data.volume = cubeSettings[this.objPos][0];
        this.data.distortion = cubeSettings[this.objPos][7];
        this.data.attack = cubeSettings[this.objPos][1];
        this.data.decay = cubeSettings[this.objPos][2];
        this.data.sustain = cubeSettings[this.objPos][3];
        this.data.release = cubeSettings[this.objPos][4];
        this.data.note = notePopuling();
    },
    tick: function () {
        this.pannerpolysynth.setPosition(this.el.object3D.position.x, this.el.object3D.position.y, this.el.object3D.position.z);
    },
    updateColor() {
        if (this.el.getAttribute('material').color == "#005AB5")
            this.el.setAttribute('material', 'color', "#DC3220") 
        else
            this.el.setAttribute('material', 'color', "#005AB5")

    },
    events: {
        click: function (evt) { 
            NAF.utils.takeOwnership(this.el);

            sendTimeStamp('AttivazioneCubo');

            if (!start) {
                Tone.start();
                start++;
            }
            if (arrayMusicale[this.objPos]) {
                arrayMusicale[this.objPos] = 0;
                this.polysynth.triggerRelease(this.data.note);
                var command = this.objPos + '-off'
                NAF.connection.broadcastDataGuaranteed('cube-commands', command);
                this.updateColor();
            }
            else {
                arrayMusicale[this.objPos] = 1;
                this.polysynth.triggerAttack(this.data.note);
                
                var command = this.objPos + '-on'
                NAF.connection.broadcastDataGuaranteed('cube-commands', command);
                this.updateColor();

            }
        },

        eventOn: function () {
            arrayMusicale[this.objPos] = 1;
            this.polysynth.triggerAttack(this.data.note);
            sendTimeStamp('AttivazioneCuboAAAA');
        },
        eventOff: function () {
            arrayMusicale[this.objPos] = 0;
            this.polysynth.triggerRelease(this.data.note);            
        },
        changeSettings: function () {
            this.polysynth.volume.value = cubeSettings[this.objPos][0];      
            
            this.data.attack = cubeSettings[this.objPos][1];
            this.data.decay = cubeSettings[this.objPos][2];
            this.data.sustain = cubeSettings[this.objPos][3];
            this.data.release = cubeSettings[this.objPos][4];
            
            this.filter.frequency.value = cubeSettings[this.objPos][5];
            this.filter.Q.value = cubeSettings[this.objPos][6];

            this.distortion.set({ distortion: cubeSettings[this.objPos][7] });

            sendTimeStamp('CambioValore');

            var dawave = cubeSettings[this.objPos][9];
            
            var iswave ="triangle";
            
            if(dawave == 0){
                iswave = "sine";
            }
            if(dawave == 1){
                iswave = "sine";
            }
            if(dawave == 2){
                iswave = "square";
            }
            if(dawave == 3){
                iswave = "sawtooth";
            }

            this.polysynth.set({
                oscillator: {
                    type: cubeSettings1[this.objPos][1]//myWave - works only local - "sine" //the type of waveform the synthesizer produces. Can be: square, sine, triangle, or sawtooth
                },
                envelope: {
                    attackCurve: "exponential",
                    attack: cubeSettings[this.objPos][1],
                    decay: cubeSettings[this.objPos][2],
                    sustain: cubeSettings[this.objPos][3],
                    release: cubeSettings[this.objPos][4],
                }
            });
            var GUIs = document.querySelectorAll('[text-changer]');
            for (var i = 0; i < GUIs.length; i++) {
                if (GUIs[i].getAttribute('text-changer').indexcube == this.objPos)
                    GUIs[i].dispatchEvent(updateComponent);
            }
        }
        
function notePopuling() {
    var toFill;

    //prima era externalDrop.length != []
    if (externalDrop.length != 0) {
        toFill = externalDrop;
        externalDrop = [];
    }
    else if (musicDrop.length != 0) {
       
        toFill = musicDrop;
        musicDrop = [];
    }
    else {
        console.log("Default A1");
        toFill = ["A1"];
    }
    return toFill;
}

AFRAME.registerComponent('note-mem', {
    schema: {
        addnota: { type: 'string', default: 'A' }
    },
    init: function () {
        this.nota = this.data.addnota + 4;
    },
    events: {
        click: function () { 
            if (!musicDrop.includes(this.nota)) {
                musicDrop.push(this.nota);
                //document.getElementById("notebox").value = musicDrop;
                document.querySelector('#notebox').setAttribute('value', musicDrop);
            }
            console.log(musicDrop);
        },
        changeOctave: function () {
            this.nota = this.data.addnota + octave;
        }
    }
});

AFRAME.registerComponent('change-octave', {
    schema: {
        action: { type: 'string' },
    },
    init: function () {
        this.noteSelectors = document.querySelectorAll('[note-mem]');
        octave = 4;
    },
    events: {
        click: function () { 
            if (this.data.action == "add") {
                //if (octave < 8) {
                    octave++;
                //}
                if(octave > 8){
                    octave = 8;
                }
            }
            else if (this.data.action == "sub") {
                //if (octave > 1)
                    octave--;
                    if(octave < 1){
                        octave = 1;
                    }

            }
            for (var i = 0; i < this.noteSelectors.length; i++) {
                this.noteSelectors[i].dispatchEvent(changeOctave);
            }
            document.querySelector("#valoreottava").setAttribute('value', octave);
        }
    }
});


AFRAME.registerComponent('text-changer', {
    schema: {
        indexcube: { type: 'int' },
        settingindex: { type: 'int' }
    },

    init: function () {
        this.data.indexcube = this.el.parentNode.parentNode.getAttribute("indexgui").indice;
        this.el.setAttribute('value', cubeSettings[this.data.indexcube][this.data.settingindex]);
    },
    events: {
        updateComponent: function () {
            this.el.setAttribute('value', cubeSettings[this.data.indexcube][this.data.settingindex]);
        }
    }
});

AFRAME.registerComponent('setting-changer', {
    schema: {
        indexcube: { type: 'int' },
        settingindex: { type: 'int' },
        action: { type: 'string' }
    },
    init: function () {
        this.cube;
        
        this.data.indexcube = this.el.parentNode.parentNode.getAttribute("indexgui").indice;
        var cubes = document.querySelectorAll('[polysynth]');
        for (var i = 0; i < cubes.length; i++) {
            if (cubes[i].getAttribute('index').indice == this.data.indexcube)
                this.cube = cubes[i];
        }
    },
    events: {
        click: function () { 
            
            //cambio il valore dell'array
            if (this.data.action == 'add') {
                if (this.data.settingindex == 4 || this.data.settingindex == 1) {
                    cubeSettings[this.data.indexcube][this.data.settingindex] = Math.round((cubeSettings[this.data.indexcube][this.data.settingindex] + 0.1) * 1e12) / 1e12;
                    if (cubeSettings[this.data.indexcube][this.data.settingindex] > 1)
                        cubeSettings[this.data.indexcube][this.data.settingindex] = 1;
                }
                else {
                    cubeSettings[this.data.indexcube][this.data.settingindex] = Math.round((cubeSettings[this.data.indexcube][this.data.settingindex] + 0.5) * 1e12) / 1e12;

                }
            }
            else if (this.data.action == 'sub') {
                if (this.data.settingindex == 4 || this.data.settingindex == 1) {
                    cubeSettings[this.data.indexcube][this.data.settingindex] = Math.round((cubeSettings[this.data.indexcube][this.data.settingindex] - 0.1) * 1e12) / 1e12;
                    
                }
                else {
                    cubeSettings[this.data.indexcube][this.data.settingindex] = Math.round((cubeSettings[this.data.indexcube][this.data.settingindex] - 0.5) * 1e12) / 1e12;
                    console.log("-----------------=== " + cubeSettings[this.data.indexcube]);
                }
                if (cubeSettings[this.data.indexcube][this.data.settingindex] < 0 && this.data.settingindex != 0) //detune e volume possono andare sotto 0
                    cubeSettings[this.data.indexcube][this.data.settingindex] = 0;
                
                var wavez = 0;
                
                //SINE
                if(this.data.settingindex == 9)
                {
                    wavez = 1;
                    cubeSettings1[this.data.indexcube][1] = "square";

                }
                //SQUARE
                if(this.data.settingindex == 8)
                {
                    wavez = 2;
                    cubeSettings1[this.data.indexcube][1] = "sine";
                    
                }
                //SAW
                if(this.data.settingindex == 10)
                {
                    wavez = 3;
                    cubeSettings1[this.data.indexcube][1] = "sawtooth";
                }
                
                cubeSettings[this.data.indexcube][9] = wavez;  
            }
            
            this.cube.dispatchEvent(changeSettings);

            var cmd = '';
            cmd += this.data.indexcube + ':' + this.data.settingindex + ':' + cubeSettings[this.data.indexcube][this.data.settingindex];
            NAF.connection.broadcastDataGuaranteed("update-settings", cmd);
            
            NAF.connection.broadcastDataGuaranteed("test-test", this.data.settingindex);

        }
    }
});

AFRAME.registerComponent('clear-array', {
    events: {
        click: function () { 
            musicDrop = [];
            document.querySelector('#notebox').setAttribute('value', musicDrop);
        }
    }
});

function sendTimeStamp(nomeEvento){
    var creationTime = new Date().getTime();
    NAF.connection.broadcastDataGuaranteed("msg-delay", nomeEvento + ':' + creationTime);
    
}

AFRAME.registerComponent('rotate-cursor-a', {
    schema: {
      
    },
  
    init: function () {
      
      var data = this.data;
      var el = this.el;  // <a-box>
      var getCursor = document.getElementById('myyyyyCursor');

      var checkit = false;

      var correctPosition = getCursor.getAttribute('position');
    }

  });

AFRAME.registerComponent('change-wave', {
    schema: {
        action: { type: 'string' },
    },
    init: function () {
        this.noteSelectors = document.querySelectorAll('[note-mem]');
        octave = 4;
    },
    events: {
        click: function () { 
            if (this.data.action == "sine") {
                myWave = wavesetting[0];
            }
            else if (this.data.action == "square") {
                myWave = wavesetting[1];
            }
            else if(this.data.action == "sawtooth"){
                myWave = wavesetting[2];
            }
        }
    }
});
