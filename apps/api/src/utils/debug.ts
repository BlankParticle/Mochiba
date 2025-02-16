import { vValidator } from "@hono/valibot-validator";
import { emailHandler } from "@api/handlers/email";
import type { HonoCtx } from "@api/types";
import type { Hono } from "hono";
import * as v from "valibot";

const EmailResultSymbol = Symbol("EmailResult");
type EmailResult =
  | { status: "forwarded"; to: string; headers: Headers; body: string }
  | { status: "rejected"; reason: string }
  | { status: "replied"; message: EmailMessage };

class MockEmail implements ForwardableEmailMessage {
  public readonly raw: ReadableStream<Uint8Array>;
  public readonly rawSize: number;
  public [EmailResultSymbol]?: EmailResult;

  constructor(
    public readonly from: string,
    public readonly to: string,
    public readonly headers: Headers,
    public body: string,
  ) {
    this.raw = new Response(body).body!;
    this.rawSize = body.length;
  }

  async reply(message: EmailMessage) {
    this[EmailResultSymbol] = { status: "replied", message };
  }
  async forward(to: string, headers = new Headers()) {
    this[EmailResultSymbol] = { status: "forwarded", to, headers, body: this.body };
  }
  setReject(reason: string): void {
    this[EmailResultSymbol] = { status: "rejected", reason };
  }
}

export const hook = (app: Hono<HonoCtx>) => {
  console.log(`[Debug] Mock email handler available at /api/send-mock-email`);
  app.post(
    "/send-mock-email",
    vValidator(
      "form",
      v.pipe(
        v.object({
          from: v.pipe(v.string(), v.email()),
          to: v.pipe(v.string(), v.email()),
          headers: v.optional(v.record(v.string(), v.string()), {}),
          body: v.string(),
        }),
        v.transform(
          ({ from, to, headers, body }) => new MockEmail(from, to, new Headers(headers), body),
        ),
      ),
    ),
    async (c) => {
      const email = c.req.valid("form");
      await emailHandler(email, c.env, {} as ExecutionContext);
      return c.json({ message: "Email sent", result: email[EmailResultSymbol] });
    },
  );
};
