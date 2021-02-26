package net.justmachinery.shade.components

import kotlinx.html.*
import net.justmachinery.shade.component.Component
import net.justmachinery.shade.component.MountingContext
import net.justmachinery.shade.component.PropsType
import net.justmachinery.shade.state.observable
import net.justmachinery.shade.utility.*

/**
 * This shows loading and integrating normal JS scripts using the
 * [international telephone input](https://github.com/jackocnr/intl-tel-input) plugin.
 * (It also shows interacting with a JS plugin through Shade)
 */
class LoadScriptTest : Component<Unit>() {
    var phoneNumber by observable<String?>("+15555551234")
    override fun HtmlBlockTag.render() {
        h2 { +"Loading Scripts" }
        div {
            add(PhoneNumberInput.Props(
                number = ::phoneNumber.getSet
            ))
        }
        div {
            +"Full phone number is $phoneNumber"
        }
    }
}

class PhoneNumberInput : Component<PhoneNumberInput.Props>() {
    data class Props(val number : GetSet<String?>) : PropsType<Props, PhoneNumberInput>()

    companion object {
        val intlTelInputScript = LoadScript("/js/intlTelInput.js")
        val intlTelInputCss = LoadCss("/css/intlTelInput.css")

        val intlTelInputStyle = LoadStyle("""
            .iti__flag {background-image: url("/img/flags.png");}

            @media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
                .iti__flag {background-image: url("/img/flags@2x.png");}
            }
        """.trimIndent())
    }

    override fun MountingContext.mounted() {
        client.load(intlTelInputScript)
        client.load(intlTelInputCss)
    }

    override fun HtmlBlockTag.render() {
        add(BoundTag.Props(
            bound = props.number,
            cb = EqLambda {},
            behavior = object : BoundTag.BoundTagBehavior<String?, INPUT> {
                override val toJs = EqLambda<(String?) -> Json> {
                    Json(gson.toJson(it))
                }
                override val fromJs = EqLambda<(Json) -> String?> {
                    gson.fromJson(it.raw, String::class.java)
                }
                override val normalize = BoundTag.Normalize.OnBlur
                override fun normalizeIf(
                    currentValue: String?,
                    currentJson: Json,
                    lastInputValue: String?,
                    lastInputJson: Json?
                ) = currentValue != null || currentValue != lastInputValue
                override val changeEvents: List<String>
                    get() = listOf("input", "countrychange")
                override val getValueJs: String
                    //language=JavaScript
                    get() = """
                        (function(){ try { return it.intl.isValidNumber() ? it.intl.getNumber() : null } catch(e){ return null }})()
                    """.trimIndent()
                override val setValueJs: String
                    get() = intlTelInputScript.afterLoad("it.intl.setNumber(value || \"\")")

                override fun HtmlBlockTag.tag(cb: INPUT.() -> Unit) {
                    input {
                        cb()
                        applyJs(intlTelInputScript.afterLoad("""
                                it.intl = window.intlTelInput(it, { 
                                    utilsScript: "/js/utils.js",
                                    dropdownContainer: document.body
                                });
                            """.trimIndent()), onlyOnCreate = true)
                    }
                }
            }
        ))
    }
}