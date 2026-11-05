import {describe, expect, it, vi} from "vitest";
import {connectSocket, sendIfError, sendMessage} from "@src/socket";

class FakeWebSocket {
    static last : FakeWebSocket
    sent : string[] = []
    onopen : (()=>void)|null = null
    constructor(public url : string){ FakeWebSocket.last = this }
    send(data : string){
        if(!this.open){ throw new Error("InvalidStateError: still connecting") }
        this.sent.push(data)
    }
    open = false
    connect(){ this.open = true; this.onopen!() }
}

describe("the socket", () => {
    it("sends messages and errors raised before it opens once it opens, unchanged", () => {
        vi.useFakeTimers();
        vi.stubGlobal("WebSocket", FakeWebSocket);
        (window as any).shadeEndpoint = "/shade";
        (window as any).shadeId = "client-id";
        connectSocket();
        const socket = FakeWebSocket.last;

        sendMessage("7", '"typed"');
        sendIfError(new Error("boom"), "8", "someScript()");
        socket.connect();

        expect(socket.sent[0]).toBe("client-id");
        expect(socket.sent[1]).toBe('7|"typed"');
        expect(socket.sent[2].startsWith("E8|")).toBe(true);
        expect(JSON.parse(socket.sent[2].substring(3)).jsMessage).toBe("boom");
        expect(socket.sent.length).toBe(3);
        vi.useRealTimers();
    });
});
