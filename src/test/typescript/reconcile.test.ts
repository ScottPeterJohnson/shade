import {beforeEach, describe, expect, it, vi} from "vitest";
import {component, keep, mark, markerOf, markers, render, texts, update} from "./helpers";
import {sendIfError} from "@src/socket";

vi.mock("@src/socket", () => ({
    sendMessage: vi.fn(),
    sendIfError: vi.fn(),
    connectSocket: vi.fn()
}));

beforeEach(() => {
    document.body.innerHTML = "";
    vi.mocked(sendIfError).mockClear();
});

describe("reconciling elements", () => {
    it("updates text in place, without replacing the element around it", () => {
        render("<div>before</div>");
        mark(document.querySelector("div")!, "original");

        update("<div>after</div>");

        expect(texts("div")).toEqual(["after"]);
        expect(markerOf(document.querySelector("div"))).toBe("original");
    });

    it("replaces an element whose tag changed", () => {
        render("<div>text</div>");
        mark(document.querySelector("div")!, "original");

        update("<p>text</p>");

        expect(document.querySelector("div")).toBeNull();
        expect(markerOf(document.querySelector("p"))).toBeUndefined();
    });

    it("adds and removes children", () => {
        render("<ul><li>a</li></ul>");
        mark(document.querySelector("ul")!, "list");

        update("<ul><li>a</li><li>b</li></ul>");
        expect(texts("li")).toEqual(["a", "b"]);

        update("<ul><li>b</li></ul>");
        expect(texts("li")).toEqual(["b"]);
        expect(markerOf(document.querySelector("ul"))).toBe("list");
    });

    it("applies changed attributes to the existing element", () => {
        render('<div class="one" title="t">x</div>');
        mark(document.querySelector("div")!, "original");

        update('<div class="two" title="t" lang="en">x</div>');

        const div = document.querySelector("div")!;
        expect(markerOf(div)).toBe("original");
        expect(div.getAttribute("class")).toBe("two");
        expect(div.getAttribute("lang")).toBe("en");
    });

    it("removes every attribute that is no longer present", () => {
        render('<div data-x="1" data-y="2" data-z="3">x</div>');

        update("<div>x</div>");

        const div = document.querySelector("div")!;
        expect(div.getAttributeNames().sort()).toEqual([]);
    });
});

describe("reconciling keyed children", () => {
    it("reorders keyed elements without recreating them", () => {
        render('<div data-k="a">A</div><div data-k="b">B</div><div data-k="c">C</div>');
        document.querySelectorAll("div").forEach(div => mark(div, div.getAttribute("data-k")!));

        update('<div data-k="c">C</div><div data-k="b">B</div><div data-k="a">A</div>');

        expect(texts("div")).toEqual(["C", "B", "A"]);
        expect(markers("div")).toEqual(["c", "b", "a"]);
    });

    it("reorders keyed elements that share a parent with unkeyed ones", () => {
        render('<p>header</p><div data-k="a">A</div><div data-k="b">B</div>');
        document.querySelectorAll("div").forEach(div => mark(div, div.getAttribute("data-k")!));
        mark(document.querySelector("p")!, "header");

        update('<p>header</p><div data-k="b">B</div><div data-k="a">A</div>');

        expect(texts("div")).toEqual(["B", "A"]);
        expect(markers("div")).toEqual(["b", "a"]);
        expect(markerOf(document.querySelector("p"))).toBe("header");
    });

    it("drops keyed elements that are gone, and keeps the rest", () => {
        render('<div data-k="a">A</div><div data-k="b">B</div><div data-k="c">C</div>');
        document.querySelectorAll("div").forEach(div => mark(div, div.getAttribute("data-k")!));

        update('<div data-k="c">C</div>');

        expect(markers("div")).toEqual(["c"]);
    });

    it("handles two children sharing one key without crashing", () => {
        render('<div data-k="same">A</div><div data-k="same">B</div>');

        update('<div data-k="same">A</div><div data-k="same">B</div>');

        expect(texts("div")).toEqual(["A", "B"]);
        expect(sendIfError).not.toHaveBeenCalled();
    });
});

describe("reconciling components", () => {
    it("leaves a component alone when the server sends a keep directive", () => {
        render(component(2, "<div>child state</div>"));
        mark(document.querySelector("div")!, "child");

        update(keep(2));

        expect(texts("div")).toEqual(["child state"]);
        expect(markerOf(document.querySelector("div"))).toBe("child");
    });

    it("reconciles into a component that sent new markup", () => {
        render(component(2, '<div class="a">old</div>'));
        mark(document.querySelector("div")!, "child");

        update(component(2, '<div class="b">new</div>'));

        const div = document.querySelector("div")!;
        expect(div.textContent).toBe("new");
        expect(div.getAttribute("class")).toBe("b");
        expect(markerOf(div)).toBe("child");
    });

    it("replaces a component with a different one at the same position", () => {
        render(component(2, "<div>first</div>"));
        mark(document.querySelector("div")!, "first");

        update(component(3, "<div>second</div>"));

        expect(texts("div")).toEqual(["second"]);
        expect(markerOf(document.querySelector("div"))).toBeUndefined();
    });

    it("keeps a kept component's siblings in the right order", () => {
        render("<p>before</p>" + component(2, "<div>child</div>") + "<p>after</p>");
        mark(document.querySelector("div")!, "child");

        update("<p>before</p>" + keep(2) + "<p>changed</p>");

        expect(texts("p")).toEqual(["before", "changed"]);
        expect(markerOf(document.querySelector("div"))).toBe("child");
        expect(document.body.textContent).toBe("beforechildchanged");
    });
});
