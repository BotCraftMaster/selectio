import { Hono } from "hono";
import { createUserClient } from "../../user-client";
import { checkPasswordSchema, sendCodeSchema, signInSchema } from "../schemas";
import { handleError, isAuthError, normalizePhone } from "../utils";

const auth = new Hono();

auth.post("/send-code", async (c) => {
  try {
    const body = await c.req.json();
    const result = sendCodeSchema.safeParse(body);

    if (!result.success) {
      return c.json(
        { error: "Invalid request data", details: result.error.issues },
        400,
      );
    }

    const { apiId, apiHash, phone: rawPhone } = result.data;
    const phone = normalizePhone(rawPhone);
    const { client } = await createUserClient(apiId, apiHash);
    const authResult = await client.sendCode({ phone });

    if ("phoneCodeHash" in authResult) {
      return c.json({
        success: true,
        phoneCodeHash: authResult.phoneCodeHash,
        timeout: authResult.timeout,
      });
    }

    return c.json({ error: "User already authorized" }, 400);
  } catch (error) {
    return c.json({ error: handleError(error, "Failed to send code") }, 500);
  }
});

auth.post("/sign-in", async (c) => {
  try {
    const body = await c.req.json();
    const result = signInSchema.safeParse(body);

    if (!result.success) {
      return c.json(
        { error: "Invalid request data", details: result.error.issues },
        400,
      );
    }

    const {
      apiId,
      apiHash,
      phone: rawPhone,
      phoneCode: rawPhoneCode,
      phoneCodeHash,
    } = result.data;

    const phone = normalizePhone(rawPhone);
    const phoneCode = rawPhoneCode.trim();
    const { client, storage } = await createUserClient(apiId, apiHash);
    const user = await client.signIn({ phone, phoneCode, phoneCodeHash });
    const sessionData = await storage.export();

    return c.json({
      success: true,
      sessionData,
      user: {
        id: user.id.toString(),
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        username: user.username || "",
        phone: "phone" in user ? user.phone : phone,
      },
    });
  } catch (error) {
    if (isAuthError(error, "SESSION_PASSWORD_NEEDED")) {
      return c.json({ error: "SESSION_PASSWORD_NEEDED" }, 400);
    }
    if (isAuthError(error, "PHONE_CODE_EXPIRED")) {
      return c.json({ error: "PHONE_CODE_EXPIRED" }, 400);
    }
    if (isAuthError(error, "PHONE_CODE_INVALID")) {
      return c.json({ error: "PHONE_CODE_INVALID" }, 400);
    }

    return c.json({ error: handleError(error, "Failed to sign in") }, 500);
  }
});

auth.post("/check-password", async (c) => {
  try {
    const body = await c.req.json();
    const result = checkPasswordSchema.safeParse(body);

    if (!result.success) {
      return c.json(
        { error: "Invalid request data", details: result.error.issues },
        400,
      );
    }

    const {
      apiId,
      apiHash,
      phone: rawPhone,
      password,
      sessionData,
    } = result.data;

    const phone = normalizePhone(rawPhone);
    const { client, storage } = await createUserClient(
      apiId,
      apiHash,
      JSON.parse(sessionData),
    );
    const user = await client.checkPassword(password);
    const newSessionData = await storage.export();

    return c.json({
      success: true,
      sessionData: JSON.stringify(newSessionData),
      user: {
        id: user.id.toString(),
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        username: user.username || "",
        phone: "phone" in user ? user.phone : phone,
      },
    });
  } catch (error) {
    return c.json(
      { error: handleError(error, "Failed to check password") },
      500,
    );
  }
});

export default auth;
