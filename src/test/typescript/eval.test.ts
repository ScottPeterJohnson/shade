import {beforeEach, describe, expect, it, vi} from "vitest";
import {evaluateScript, makeEvalScope} from "@src/eval";
import {sendIfError} from "@src/socket";

vi.mock("@src/socket", () => ({
    sendMessage: vi.fn(),
    sendIfError: vi.fn(),
    connectSocket: vi.fn()
}));

beforeEach(() => {
    vi.mocked(sendIfError).mockClear();
    delete (window as any).__evalTest;
});

/** Fails loudly if the script reported an error instead of running cleanly. */
function expectRanCleanly(){
    expect(vi.mocked(sendIfError).mock.calls).toEqual([]);
}

describe("script evaluation", () => {
    //makeEvalScope compiles scripts with new Function(...names, body), passing its scope in as parameters.
    //A script must be free to declare any name of its own without colliding with those parameters. Shade's
    //own LoadScript helper, for instance, emits `const script = ...` and `const url = ...`.
    it("lets a script declare a variable named like an injected scope parameter", () => {
        const scope = makeEvalScope({it: document.createElement("div")});

        //`it` is an injected scope name; redeclaring it must shadow, not throw "already been declared"
        evaluateScript(undefined, scope, "const it = 1; const script = 2; window.__evalTest = it + script;");

        expectRanCleanly();
        expect((window as any).__evalTest).toBe(3);
    });

    it("still exposes injected scope values to a script that does not redeclare them", () => {
        const element = document.createElement("div");
        const scope = makeEvalScope({it: element});

        evaluateScript(undefined, scope, "it.dataset.ran = 'yes';");

        expectRanCleanly();
        expect(element.dataset.ran).toBe("yes");
    });

    it("still reports a genuinely broken script rather than swallowing it", () => {
        const scope = makeEvalScope({});

        evaluateScript(undefined, scope, "nope.notAThing();");

        expect(sendIfError).toHaveBeenCalledTimes(1);
    });
});
