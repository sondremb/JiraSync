import type { AccountInfo } from "@azure/msal-browser";
import type { Brand } from "../../Utils/brandedTypes";

/** A Bekk employee's numeric ID, as the Bekk APIs and the ID token's `employeeId` claim carry it. */
export type EmployeeId = Brand<number, "EmployeeId">;

/** The `employeeId` claim of the account's ID token, if it has a usable one. */
export function employeeIdOf(
	account: AccountInfo | null | undefined,
): EmployeeId | undefined {
	const employeeId = Number.parseInt(
		String(account?.idTokenClaims?.["employeeId"] ?? ""),
		10,
	);
	return Number.isNaN(employeeId) ? undefined : (employeeId as EmployeeId);
}
