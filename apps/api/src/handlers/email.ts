import { email, emailRules, thread } from "@api/db/schema";
import { sanitizeEmail } from "@api/utils/sanitizer";
import { and, eq, inArray } from "drizzle-orm";
import { createDrizzle } from "@api/db";
import PostalMime from "postal-mime";

export const emailHandler: EmailExportedHandler<CloudflareBindings> = async (message, env) => {
  const { from, to, raw } = message;
  const db = createDrizzle(env.DB);

  const parsedEmail = await PostalMime.parse(raw).catch(() => {
    message.setReject("Invalid Email");
    return null;
  });

  if (!parsedEmail) return;
  if (!parsedEmail.to)
    return console.log("No to address found in the email, skipping processing...");

  const [user, domain] = to.split("@");
  const routingRules = await db.query.emailRules.findMany({
    where: and(eq(emailRules.domain, domain), inArray(emailRules.rule, [user, "*"])),
  });
  if (routingRules.length === 0) return;

  const dropRule = routingRules.find((rule) => rule.action === "drop" && rule.rule !== "*");
  if (dropRule) return;

  const forwardingRule = routingRules.find(
    (rule) => rule.action === "forward" && rule.rule !== "*",
  );
  if (forwardingRule && forwardingRule.forwardTo)
    return await message.forward(forwardingRule.forwardTo);

  let ownerId: string | null = null;
  const storeRule = routingRules.find((rule) => rule.action === "store" && rule.rule !== "*");
  if (storeRule && storeRule.storeTo) ownerId = storeRule.storeTo;

  if (!ownerId) {
    const catchAllRule = routingRules.find((rule) => rule.rule === "*");
    if (catchAllRule) {
      if (catchAllRule.action === "drop") return;
      if (catchAllRule.action === "store" && catchAllRule.storeTo) ownerId = catchAllRule.storeTo;
      if (catchAllRule.action === "forward" && catchAllRule.forwardTo)
        return await message.forward(catchAllRule.forwardTo);
    }
  }

  if (!ownerId) return;

  const inReplyToEmailIds = parsedEmail.inReplyTo
    ? parsedEmail.inReplyTo
        .split(/\s+/g) // split by whitespace
        .map((part) => part.replace(/^<|>$/g, "")) // remove < and > from the start and end of the string
        .filter((part) => !!part) // remove empty strings
    : [];

  const relatedEmailIds = Array.from(
    new Set(
      inReplyToEmailIds.concat(
        (parsedEmail.references
          ? Array.isArray(parsedEmail.references)
            ? parsedEmail.references
            : [parsedEmail.references]
          : []
        ).map((ref) => ref.replace(/^<|>$/g, "")),
      ),
    ),
  );

  const subject = parsedEmail.subject?.replace(/^(RE:|FW:)\s*/i, "").trim() || "(No Subject)";
  const messageId = parsedEmail.messageId?.replace(/^<|>$/g, "") || "";
  const messageBodyHtml = parsedEmail.html
    ? sanitizeEmail(parsedEmail.html)
    : (parsedEmail.text ?? "");

  const relatedEmails = await db.query.email.findFirst({
    where: inArray(email.messageId, relatedEmailIds),
    columns: {},
    with: {
      parentThread: {
        columns: {
          id: true,
        },
      },
    },
  });

  let threadId = relatedEmails?.parentThread?.id;
  if (!threadId) {
    const [newThread] = await db.insert(thread).values({ ownerId, subject }).returning();
    threadId = newThread.id;
  }

  await db.insert(email).values({
    messageId: messageId,
    from: `${parsedEmail.from.name} <${parsedEmail.from.address}>`,
    to: parsedEmail.to.map((to) => `${to.name} <${to.address}>`).join(", "),
    date: new Date(parsedEmail.date ?? Date.now()),
    bodyHtml: messageBodyHtml,
    bodyText: parsedEmail.text ?? "",
    headers: parsedEmail.headers,
    ownerId,
    subject,
    parentThreadId: threadId,
    envelope: { from, to },
  });
  await db.update(thread).set({ updatedAt: new Date() }).where(eq(thread.id, threadId));
};
