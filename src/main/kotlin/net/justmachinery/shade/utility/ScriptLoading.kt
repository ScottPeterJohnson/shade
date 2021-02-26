package net.justmachinery.shade.utility


import net.justmachinery.shade.Client
import net.justmachinery.shade.GlobalClientStateIdentifier
import org.intellij.lang.annotations.Language

fun Client.load(script : LoadScript){
    script.ensureLoaded(this)
}

/**
 * Supports load-once on-demand JS scripts and CSS files.
 * Create a top level instance:
 *  > val myScript = LoadScript("/foo/bar.js")
 *
 * Later, when mounting a component that uses it:
 * > fun mounted(){
 * >    client.load(myScript)
 * > }
 *
 * Finally, using the script to e.g. apply js:
 * > applyJs(myScript.afterLoad("useTheScript()"))
 */
class LoadScript(val url : String){
    val identifier = GlobalClientStateIdentifier<Unit>()

    fun ensureLoaded(client: Client){
        client.getOrPutGlobalState(identifier){
            //language=JavaScript
            client.executeScript("""
                const url = "${url}";
                const script = document.createElement("script");
                script.setAttribute("src", url);
                window.shadeScripts = window.shadeScripts || {};
                let obj = window.shadeScripts[url] = window.shadeScripts[url] || {};
                obj.ready = false;
                obj.waiting = obj.waiting || [];
                script.addEventListener('load', function(){
                    obj.ready = true;
                    for(let waiting of obj.waiting){
                        waiting()
                    }
                    obj.waiting = [];
                });
                document.head.appendChild(script);
                
            """.trimIndent())
        }
    }

    fun afterLoad(script : String) : String = /* language=JavaScript */ """
        function execute(){
            $script
        }
        let url = "$url";
        window.shadeScripts = window.shadeScripts || {};
        let obj = window.shadeScripts[url] = window.shadeScripts[url] || {};
        if(obj.ready){
            execute()
        } else {
            obj.waiting = obj.waiting || [];
            obj.waiting.push(execute);
        }
    """.trimIndent()
}

fun Client.load(css : LoadCss){
    css.ensureLoaded(this)
}

/**
 * Like [LoadScript] but for stylesheets
 */
class LoadCss(val url : String){
    val identifier = GlobalClientStateIdentifier<Unit>()

    fun ensureLoaded(client: Client) {
        client.getOrPutGlobalState(identifier) {
            //language=JavaScript
            client.executeScript("""
                const css = document.createElement("link");
                css.setAttribute("rel", "stylesheet");
                css.setAttribute("href", "$url")
                document.head.appendChild(css);
            """.trimIndent())
        }
    }
}

fun Client.load(style : LoadStyle){
    style.ensureLoaded(this)
}

/**
 * Like [LoadScript] but for style rules
 */
class LoadStyle(@Language("CSS") val css : String){
    val identifier = GlobalClientStateIdentifier<Unit>()

    fun ensureLoaded(client: Client) {
        client.getOrPutGlobalState(identifier) {
            //language=JavaScript
            client.executeScript("""
                const css = document.createElement("style");
                css.innerText = css;
                document.head.appendChild(css);
            """.trimIndent())
        }
    }
}