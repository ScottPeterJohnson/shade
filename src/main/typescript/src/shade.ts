import {connectSocket, sendIfError} from "./socket";
import {errorDisplay} from "./errors";
import {whenDocumentReady} from "./utility";
import {addAllDirectives} from "./directives";

if(!(window as any).shade){
    (window as any).shade = {};
    if(!window.WebSocket){
        errorDisplay("Your web browser doesn't support this page, and it may not function correctly as a result. Upgrade your web browser.");
    } else {
        connectSocket();

        whenDocumentReady(function(){
            addAllDirectives(document.documentElement)
        })

        window.addEventListener('error', function(event: ErrorEvent){
            sendIfError(event.error);
        });
        window.addEventListener('unhandledrejection', function(event : PromiseRejectionEvent){
            sendIfError(event.reason);
        });
    }
}