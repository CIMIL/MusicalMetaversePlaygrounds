var text1 = '';

eventOn = new Event('eventOn');
eventOff = new Event('eventOff');
changeSettings = new Event('changeSettings');  
updateComponent = new Event('updateComponent');  
changeOctave = new Event("changeOctave");  

NAF.options.updateRate = 15; 

nuovoClient = 0;

function onConnect() {

    document.body.addEventListener('entityCreated', function (evt) {
        if (evt.detail.el.getAttribute('index') != null)
            if (evt.detail.el.getAttribute('index').indice != undefined)
                index++;
    });

    NAF.connection.subscribeToDataChannel("initializedData", sendDataForInitialization);
    NAF.connection.subscribeToDataChannel("arraynote", createArray);
    NAF.connection.subscribeToDataChannel("arraymusicale", fillArrayMusicale);
    NAF.connection.subscribeToDataChannel("onconnect-setting", setSettings);
    NAF.connection.subscribeToDataChannel("cube-commands", cubeManager);
    NAF.connection.subscribeToDataChannel("note-received", noteSet);
    NAF.connection.subscribeToDataChannel("update-settings", updateSettings)

    NAF.connection.subscribeToDataChannel("msg-delay", calculateDelay);
    NAF.connection.subscribeToDataChannel("test-test", testTest);


    NAF.connection.broadcastDataGuaranteed("initializedData", NAF.clientId)

    document.body.addEventListener('clientConnected', function (evt) {
        if (evt.detail.clientId == nuovoClient) {


            var cubes = document.querySelectorAll('[polysynth]');
            var arrayNote = [];

            for (var i = 0; i < cubes.length; i++) {
                var index = cubes[i].getAttribute('index').indice;
                arrayNote[index] = cubes[i].getAttribute('polysynth').note;
            }

            NAF.connection.sendDataGuaranteed(evt.detail.clientId, "arraynote", arrayNote); 
            NAF.connection.sendDataGuaranteed(evt.detail.clientId, "arraymusicale", arrayMusicale);  
            NAF.connection.sendDataGuaranteed(evt.detail.clientId, "onconnect-setting", cubeSettings); 
            
        }
    });
}


function createArray(senderId, dataType, data, targetObj) {
    
    var cubes = document.querySelectorAll('[polysynth]');
    for (var i = 0; i < data.length; i++) {
        var index = cubes[i].getAttribute('index').indice;

        cubes[i].setAttribute('polysynth', 'note', data[index]);
        console.log(cubes[i].getAttribute('polysynth').note);

    }
}

function cubeManager(senderId, dataType, data, targetObj) {
    var cmd = data.split('-'); 
    var ind = cmd[0];
    var acc = cmd[1];
    var cubes = document.querySelectorAll('[index]');

    for (var i = 0; i < cubes.length; i++) {
        if (cubes[i].getAttribute('index').indice == ind) {
            if (acc == 'on') {
                cubes[i].dispatchEvent(eventOn);
            }
            else if (acc == 'off') {
                cubes[i].dispatchEvent(eventOff);
            }
        }
    }
}


function noteSet(senderId, dataType, data, targetObj) {
    externalDrop = data;
}


function fillArrayMusicale(senderId, dataType, data, targetObj) {
    arrayMusicale = data;
}


function setSettings(senderId, dataType, data, targetObj) {
    cubeSettings = data;
    var cubes = document.querySelectorAll('[polysynth]');
    for (var i = 0; i < cubes.length; i++) {
        cubes[i].dispatchEvent(changeSettings);
    }
}


function sendDataForInitialization(senderId, dataType, data, targetObj) {
    console.log(data);
    nuovoClient = data;
}


function updateSettings(senderId, dataType, data, targetObj) {
    var cmd = data.split(':');
    var cubeInd = cmd[0];

    var cube;
    var cubes = document.querySelectorAll('[index]');
    for (var i = 0; i < cubes.length; i++) {
        if (cubes[i].getAttribute('index').indice == cubeInd)
            cube = cubes[i];
    }
    cubeSettings[cmd[0]][cmd[1]] = cmd[2];

    cube.dispatchEvent(changeSettings);
}


function calculateDelay(senderId, dataType, data, targetObj){
    var event = data.split(':')[0];
    var generatedTime = data.split(':')[1];
    var receivedTime = new Date().getTime();
    var timeDelay = generatedTime -receivedTime;
}


function myMessages(senderId, dataType, data, targetObj) {
    myMsg = data;
}

function testTest(senderId, dataType, data, targetOb){
        myDatas = data;
}
