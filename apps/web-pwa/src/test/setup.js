import "@testing-library/jest-dom/vitest";
import "fake-indexeddb/auto";
import { afterEach, beforeEach } from "vitest";
import { cleanup } from "@testing-library/react";
import { db } from "../services/storage/db";

beforeEach(async () => {
  localStorage.clear();
  await db.open();
  await db.transaction("rw", db.users, db.templates, db.userPlans, db.sessions, db.appMeta, async () => {
    await db.users.clear();
    await db.templates.clear();
    await db.userPlans.clear();
    await db.sessions.clear();
    await db.appMeta.clear();
  });
});

afterEach(() => {
  cleanup();
});
