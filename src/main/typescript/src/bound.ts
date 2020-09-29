import {AttributeNames} from "./constants";

export function updateBoundInput(boundId : number, serverSeen : number, value : string){
    let input = document.querySelector("["+ AttributeNames.Bound +"=\"" + boundId + "\"]") as HTMLInputElement
    let seen = (input as any).boundSeen || ((input as any).boundSeen=0)
    if(input && seen <= serverSeen){
        input.value=value;
    }
}

export function updateBoundCheckbox(boundId : number, serverSeen : number, value : number){
    let checked = value === 1
    let input = document.querySelector("["+ AttributeNames.Checkbox +"=\"" + boundId + "\"]") as HTMLInputElement
    let seen = (input as any).boundSeen || ((input as any).boundSeen=0)
    if(input && seen <= serverSeen){
        input.checked = checked;
    }
}
