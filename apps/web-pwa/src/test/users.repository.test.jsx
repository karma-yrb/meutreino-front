import { describe, expect, test } from "vitest";
import { ensureSeedData } from "../services/storage/seed";
import { getUserById, updateUserIdentity, updateUserProfile } from "../services/storage/repositories/usersRepository";

describe("usersRepository", () => {
  test("concurrent identity + profile updates do not overwrite each other", async () => {
    await ensureSeedData();

    for (let i = 0; i < 20; i += 1) {
      const expectedFirstName = `FN${i}`;
      const expectedLastName = `LN${i}`;
      const expectedWeight = 70 + i;

      await Promise.all([
        updateUserIdentity("user-1", { firstName: expectedFirstName, lastName: expectedLastName }),
        updateUserProfile("user-1", { weightKg: expectedWeight, heightCm: 180 }),
      ]);

      const user = await getUserById("user-1");
      expect(user.firstName).toBe(expectedFirstName);
      expect(user.lastName).toBe(expectedLastName);
      expect(user.profile.weightKg).toBe(expectedWeight);
      expect(user.profile.heightCm).toBe(180);
    }
  });
});
