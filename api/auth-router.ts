import { z } from "zod";
import * as cookie from "cookie";
import { Session } from "@contracts/constants";
import { getSessionCookieOptions } from "./lib/cookies";
import { createRouter, publicQuery } from "./middleware";
import { signSessionToken } from "./lib/auth";
import { upsertUser, findUserByUnionId, findUserByEmail } from "./queries/users";
import { env } from "./lib/env";

export const authRouter = createRouter({
  me: publicQuery.query((opts) => opts.ctx.user ?? null),

  login: publicQuery
    .input(
      z
        .object({
          role: z.enum(["user", "admin"]).optional(),
          email: z.string().email().optional(),
          password: z.string().optional(),
        })
        .optional(),
    )
    .mutation(async ({ ctx, input }) => {
      let role = input?.role ?? "user";
      let email = input?.email?.trim().toLowerCase();
      let unionId: string;
      let name: string;

      if (email) {
        // If email was provided, look for an existing user or create one
        const userByEmail = await findUserByEmail(email);
        if (userByEmail) {
          unionId = userByEmail.unionId;
          name = userByEmail.name ?? email.split("@")[0];
          role = (userByEmail.role as "user" | "admin") ?? "user";
        } else {
          // Normalize unionId from email
          unionId = `user-${email.replace(/[^a-zA-Z0-9]/g, "_")}`;
          name = email.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
        }
      } else {
        // Fallback or demo role login
        unionId = role === "admin" ? (env.ownerUnionId || "seed-admin") : "seed-customer-amara";
        name = role === "admin" ? "Store Administrator" : "Amara Okafor";
        email = role === "admin" ? "admin@oja.store" : "amara@example.com";
      }

      let existing = await findUserByUnionId(unionId);
      if (!existing) {
        await upsertUser({
          unionId,
          name,
          email,
          role,
          lastSignInAt: new Date(),
        });
        existing = await findUserByUnionId(unionId);
      }

      const token = await signSessionToken({
        unionId,
        clientId: env.appId,
      });

      const opts = getSessionCookieOptions(ctx.req.headers);
      ctx.resHeaders.append(
        "set-cookie",
        cookie.serialize(Session.cookieName, token, {
          httpOnly: opts.httpOnly,
          path: opts.path,
          sameSite: opts.sameSite?.toLowerCase() as "lax" | "none",
          secure: opts.secure,
          maxAge: Session.maxAgeMs / 1000,
        }),
      );

      return { success: true, user: existing };
    }),

  signup: publicQuery
    .input(
      z.object({
        name: z.string().min(2, "Name must be at least 2 characters").trim(),
        email: z.string().email("Please provide a valid email address").trim().toLowerCase(),
        password: z.string().min(6, "Password must be at least 6 characters").optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const email = input.email;
      const unionId = `user-${email.replace(/[^a-zA-Z0-9]/g, "_")}`;
      const role: "user" | "admin" = email.includes("admin") ? "admin" : "user";

      await upsertUser({
        unionId,
        name: input.name,
        email: input.email,
        role,
        lastSignInAt: new Date(),
      });

      const user = await findUserByUnionId(unionId);

      const token = await signSessionToken({
        unionId,
        clientId: env.appId,
      });

      const opts = getSessionCookieOptions(ctx.req.headers);
      ctx.resHeaders.append(
        "set-cookie",
        cookie.serialize(Session.cookieName, token, {
          httpOnly: opts.httpOnly,
          path: opts.path,
          sameSite: opts.sameSite?.toLowerCase() as "lax" | "none",
          secure: opts.secure,
          maxAge: Session.maxAgeMs / 1000,
        }),
      );

      return { success: true, user };
    }),

  logout: publicQuery.mutation(async ({ ctx }) => {
    const opts = getSessionCookieOptions(ctx.req.headers);
    ctx.resHeaders.append(
      "set-cookie",
      cookie.serialize(Session.cookieName, "", {
        httpOnly: opts.httpOnly,
        path: opts.path,
        sameSite: opts.sameSite?.toLowerCase() as "lax" | "none",
        secure: opts.secure,
        maxAge: 0,
      }),
    );
    return { success: true };
  }),
});
