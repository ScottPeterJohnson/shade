import {beforeEach, describe, expect, it, vi} from "vitest";
import {applyJs, eventHandler, render, setAttribute, update} from "./helpers";
import {sendIfError, sendMessage} from "@src/socket";

vi.mock("@src/socket", () => ({
    sendMessage: vi.fn(),
    sendIfError: vi.fn(),
    connectSocket: vi.fn()
}));

beforeEach(() => {
    document.body.innerHTML = "";
    vi.mocked(sendMessage).mockClear();
    vi.mocked(sendIfError).mockClear();
});

/** Fails loudly if a directive's script threw, which the client would otherwise just report to the server. */
function expectNoScriptErrors(){
    expect(vi.mocked(sendIfError).mock.calls).toEqual([]);
}

/** How many times an applyJs script has run against the element matching [selector]. */
function runsOn(selector : string){
    return (document.querySelector(selector) as any).runs;
}

describe("event handler directives", () => {
    it("sends the callback id when the event fires on the directive's parent", () => {
        render("<button>go" + eventHandler("click", 7) + "</button>");

        document.querySelector("button")!.click();

        expect(sendMessage).toHaveBeenCalledWith(7);
        expectNoScriptErrors();
    });

    it("sends the requested data along with the event", () => {
        //An input cannot contain the directive, so Shade emits it as a sibling that points back at it
        render('<input value="typed">' + eventHandler("input", 8, "it.value", true));

        document.querySelector("input")!.dispatchEvent(new Event("input"));

        expect(sendMessage).toHaveBeenCalledWith(8, JSON.stringify("typed"));
        expectNoScriptErrors();
    });

    it("stops listening once the handler is no longer rendered", () => {
        render("<button>go" + eventHandler("click", 7) + "</button>");

        update("<button>go</button>");
        document.querySelector("button")!.click();

        expect(sendMessage).not.toHaveBeenCalled();
    });

    it("installs only one listener when a rerender keeps the same handler", () => {
        render("<button>go" + eventHandler("click", 7) + "</button>");

        update("<button>go now" + eventHandler("click", 7) + "</button>");
        document.querySelector("button")!.click();

        expect(sendMessage).toHaveBeenCalledTimes(1);
    });
});

describe("attribute directives", () => {
    it("applies an attribute to the element containing the directive", () => {
        render('<div>x' + setAttribute("class", "active") + "</div>");

        expect(document.querySelector("div")!.getAttribute("class")).toBe("active");
    });

    it("restores the original value when the directive goes away", () => {
        render('<div class="original">x' + setAttribute("class", "active") + "</div>");
        expect(document.querySelector("div")!.getAttribute("class")).toBe("active");

        update('<div class="original">x</div>');

        expect(document.querySelector("div")!.getAttribute("class")).toBe("original");
    });

    it("applies a directive that follows a childless element to that element", () => {
        render("<input>" + setAttribute("placeholder", "name", true));

        expect(document.querySelector("input")!.getAttribute("placeholder")).toBe("name");
    });

    it("sets the value property of an input, not just its attribute", () => {
        //An input's value attribute only seeds the property on creation, so Shade applies both
        render("<input>" + setAttribute("value", "hello", true));

        const input = document.querySelector("input") as HTMLInputElement;
        expect(input.getAttribute("value")).toBe("hello");
        expect(input.value).toBe("hello");
    });

    it("sets the checked property of a checkbox", () => {
        render('<input type="checkbox">' + setAttribute("checked", "", true));

        expect((document.querySelector("input") as HTMLInputElement).checked).toBe(true);
    });
});

describe("applyJs directives", () => {
    it("runs its script against the element it applies to", () => {
        render("<div>x" + applyJs("it.dataset.ran = 'yes'") + "</div>");

        expect(document.querySelector("div")!.dataset.ran).toBe("yes");
        expectNoScriptErrors();
    });

    it("runs against the preceding element when it targets a sibling", () => {
        render("<input>" + applyJs("it.dataset.ran = 'yes'", false, true));

        expect(document.querySelector("input")!.dataset.ran).toBe("yes");
    });

    it("runs again when its script changes", () => {
        render("<div>x" + applyJs("it.dataset.count = '1'") + "</div>");

        update("<div>x" + applyJs("it.dataset.count = '2'") + "</div>");

        expect(document.querySelector("div")!.dataset.count).toBe("2");
    });

    it("does not run again when the rerender leaves it untouched", () => {
        //Counted on a plain property: an attribute the server did not send would be reconciled away
        const script = applyJs("it.runs = (it.runs || 0) + 1");
        render("<div>x" + script + "</div>");
        expect(runsOn("div")).toBe(1);

        update("<div>changed" + script + "</div>");

        expect(document.querySelector("div")!.textContent).toContain("changed");
        expect(runsOn("div")).toBe(1);
    });

    it("reports a failing script to the server rather than throwing", () => {
        render("<div>x" + applyJs("nope.notAThing()") + "</div>");

        expect(sendIfError).toHaveBeenCalledTimes(1);
    });
});
