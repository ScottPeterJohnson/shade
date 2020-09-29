export function errorDisplay(content : string){
    const container = document.createElement("div");
    container.innerHTML = "<div id='shadeModal' style='position: fixed;z-index: 999999999;left: 0;top: 0;width: 100%;height: 100%;overflow: auto;background-color: rgba(0,0,0,0.4);'><div style='background-color: #fff;margin: 15% auto;padding: 20px;border: 1px solid #888;width: 80%;'><span id='shadeClose' style='float: right;font-size: 28px;font-weight: bold;cursor: pointer;'>&times;</span><p>" + content  + "</p></div></div></div>";
    document.body.appendChild(container);
    document.getElementById("shadeClose")!.addEventListener('click', function(){
        const m = document.getElementById('shadeModal')!;
        m.parentNode!.removeChild(m);
    });
}