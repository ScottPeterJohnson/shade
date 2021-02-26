import {AttributeNames} from "./constants";

export function updateBoundInput(boundId : number, serverSeen : number, value : any, setter : (it : HTMLElement, value: any)=>void){
    let input = document.querySelector("["+ AttributeNames.Bound +"=\"" + boundId + "\"]") as HTMLElement
    let seen = (input as any).boundSeen || ((input as any).boundSeen=0)
    if(input && seen <= serverSeen){
        setter(input, value)
    }
}