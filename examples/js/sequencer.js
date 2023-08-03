//import { Debugout } from 'debugout.js';
//const bugout = new Debugout();

/*  Funzionamento audio spaziale  */

Tone.Transport.start();
now = Tone.now();

riproducisynth = 0;
riproduciosc = 0;
//persistent-p2p networked-scene


AFRAME.registerComponent('step-seq', {
    schema: { 
        bpmvalue: { type: 'int', default: '60'},
    },
    init: function () {

        const osc = new Tone.Oscillator().toDestination();
        const osc1 = new Tone.Oscillator(440).toDestination();
        Tone.Transport.bpm.value = this.data.bpmvalue; //60
        
        this.el.addEventListener('click', function (){               
           Tone.start();
           // start/stop the oscillator every quarter note
           Tone.Transport.scheduleRepeat(time => {
	          osc.start(time).stop(time + 0.1);
              //console.log(time); //time stamps metronome
              //bugout.realTimeLoggingOn = true;
              //bugout.useLocalStorage = true;
              //bugout.logFilename = "mynewawesomelog";
              //bugout.downloadLog();
            }, "4n");
           Tone.Transport.scheduleRepeat(time => {
	          osc1.start(time).stop(time + 0.1);
           }, "1n");
           //Tone.Transport.start();
        });
              
    }
});

/*  Necessario per Networked Aframe  */

