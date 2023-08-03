function onConnect() {

    //Incrementa l'index quando un'entità viene creata, funziona correttamente dato che gli elementi vengono creati in ordine di apparizione sull'html,
    //Quindi non da problemi
    //Unica nota, nel momento in cui si volesse implementare la rimozione dei cubi questo sarebbe problematico, perchè i nuovi client che si connettono avrebbero elementi shiftati
    //(Una posizione sarebbe vuota in seguito alla rimozione dell'elemento, ma i nuovi client non potrebbero saperlo)
    document.body.addEventListener('entityCreated', function (evt) {
        if (evt.detail.el.getAttribute('index') != null)
            if (evt.detail.el.getAttribute('index').indice != undefined)
                index++;
    });

    //All the messages we're going to listen to and thei respective callbacks
    
    NAF.connection.subscribeToDataChannel("msg-delay", calculateDelay);
    
    //turns out che questa roba fa cagare, perchè l'evento viene generato anche sui clients che si stanno attaccando, 
    //non è quindi una one way con cui mandare i dati ai nuovi clients visto che anche questi fanno la stessa cosa
    //visto che i soci del MIT non ci hanno pensato, probabilmente tocca fare tipo
    //onConnect -> manda messaggio in broadcast in cui richiede tutti i dati e gli vengono inviati back
    //così che si possano aggiornare i dati correttamente
    


}

function calculateDelay(senderId, dataType, data, targetObj){
    var event = data.split(':')[0];
    var generatedTime = data.split(':')[1];
    var receivedTime = new Date().getTime();
    var timeDelay = receivedTime - generatedTime;

    console.log('Evento: ' + event + ' _ '+ senderId);
    console.log('Tempo di partenza: ' + new Date(parseInt(generatedTime)).toString() + ', Tempo di ricezione: ' + new Date(receivedTime).toString() + ', Time delay: '  + timeDelay + ' ms');
}