import { createHash, timingSafeEqual } from "node:crypto";
import { createServerFn } from "@tanstack/react-start";
import { useSession } from "@tanstack/react-start/server";
import { z } from "zod";

type BirthdaySession = { unlocked?: boolean };

const accessSchema = z.object({
  name: z.string().trim().min(1).max(80),
  dateOfBirth: z.string().trim().min(8).max(20),
});

function sessionOptions() {
  const password = process.env["BIRTHDAY_SESSION_SECRET"];
  if (!password) throw new Error("Birthday session is not configured");

  return {
    password,
    name: "birthday-investigation",
    maxAge: 60 * 60 * 24 * 7,
    cookie: { httpOnly: true, secure: true, sameSite: "lax" as const, path: "/" },
  };
}

function safeMatch(value: string, expected: string) {
  const valueHash = createHash("sha256").update(value, "utf8").digest();
  const expectedHash = createHash("sha256").update(expected, "utf8").digest();
  return timingSafeEqual(valueHash, expectedHash);
}

export const getBirthdayAccess = createServerFn({ method: "POST" }).handler(async () => {
  const session = await useSession<BirthdaySession>(sessionOptions());
  return { unlocked: session.data.unlocked === true };
});

export const unlockBirthday = createServerFn({ method: "POST" })
  .inputValidator((input) => accessSchema.parse(input))
  .handler(async ({ data }) => {
    const expectedName = process.env["BIRTHDAY_ACCESS_NAME"];
    const expectedDob = process.env["BIRTHDAY_ACCESS_DOB"];
    if (!expectedName || !expectedDob) throw new Error("Birthday access is not configured");

    const normalizedName = data.name.trim().replace(/\s+/g, " ").toLocaleLowerCase("en");
    const normalizedExpectedName = expectedName.trim().replace(/\s+/g, " ").toLocaleLowerCase("en");
    const normalizedDob = data.dateOfBirth.replace(/\D/g, "");
    const normalizedExpectedDob = expectedDob.replace(/\D/g, "");

    if (!safeMatch(normalizedName, normalizedExpectedName) || !safeMatch(normalizedDob, normalizedExpectedDob)) {
      return { ok: false as const };
    }

    const session = await useSession<BirthdaySession>(sessionOptions());
    await session.update({ unlocked: true });
    return { ok: true as const };
  });