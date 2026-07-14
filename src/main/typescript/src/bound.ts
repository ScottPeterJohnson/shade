import {AttributeNames} from "./constants";

export function updateBoundInput(boundId : number, serverSeen : number, value : any, setter : (it : HTMLElement, value: any)=>void){
    const input = document.querySelector("["+ AttributeNames.Bound +"=\"" + boundId + "\"]") as HTMLElement|null
    if(!input){ return }
    let seen = (input as any).boundSeen || ((input as any).boundSeen=0)
    if(input && seen <= serverSeen) {
        setter(input, value)
    }
}