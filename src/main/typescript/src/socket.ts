import {errorDisplay} from "./errors";
import {evaluateScript, makeEvalScope} from "./eval";
import {messageTagErrorPrefix, messageTagSeparator} from "./constants";
import {whenDocumentReady} from "./utility";


let socketReady = false;
const socketReadyQueue : string[] = [];
let socket : WebSocket;

export function connectSocket(){
    const url = new URL((window as any).shadeEndpoint, window.location.href)
    if((window as any).shadeHost){
        url.host = (window as any).shadeHost;
    }
    url.protocol = (window.location.protocol === "https:" ? "wss://" : "ws://");
    socket = new WebSocket(url.href);
    socket.onopen = function() {
        const id = (window as any).shadeId;
        console.log("Connected with ID " + id);
        localStorage.removeItem("shade_error_reload");
        socket.send(id);
        socketReady = true;
        while (socketReadyQueue.length > 0) {
            sendMessage(socketReadyQueue.shift()!, null);
        }
    };

    socket.onmessage = function(event) {
        const data = (event.data as string);
        const splitIndex = data.indexOf(messageTagSeparator);
        const tag = data.substring(0, splitIndex);
        const script = data.substring(splitIndex+1, data.length);
        const scope = makeEvalScope({})
        whenDocumentReady(function(){
            evaluateScript(tag, scope, script)
        })
    };
    let errorTriggered = false;
    function errorReload(){
        if(errorTriggered){ return; }
        errorTriggered = true;
        const lastReload = localStorage.getItem("shade_error_reload");
        if(lastReload){
            errorDisplay("This web page could not connect to its server. Please reload or try again later.");
            localStorage.removeItem("shade_last_error_reload");
        } else {
            localStorage.setItem("shade_error_reload", "true");
            location.reload();
        }
    }
    socket.onclose = function(evt) {
        console.log(`Socket closed: ${evt.reason}, ${evt.wasClean}`);
        socketReady = false;
        if (evt.wasClean){
            //connectSocket()
        } else {
            errorReload();
        }
    };
    socket.onerror = function(evt) {
        console.log(`Socket closed: ${evt}`);
        socketReady = false;
        errorReload();
    };

    setInterval(()=>{
        if(socketReady){
            socket.send("")
        }
    }, 60*1000);
}

export function sendMessage(id : string, msg : string|undefined|null) {
    const finalMsg = (msg !== undefined && msg !== null) ? id + messageTagSeparator + msg : id + messageTagSeparator;
    if (socketReady) {
        socket.send(finalMsg);
    } else {
        socketReadyQueue.push(finalMsg);
    }
}

export function sendIfError(error : unknown, tag?: string, evalText ?: string){
    const data = error instanceof Error ? {
        name: error.name,
        jsMessage: error.message,
        stack : error.stack,
        eval: evalText,
        tag: tag
    } : {
        name: "Unknown",
        jsMessage: "Unknown error: " + error,
        stack: "",
        eval: evalText,
        tag: tag
    };
    socket.send(`${messageTagErrorPrefix}${tag == undefined ? "" : tag}${messageTagSeparator}` + JSON.stringify(data));
}

