import { getToken, isExpired } from "./token";

interface BekkUser {
	employeeId: number;
	name: string;
}

type BekkLoginStatus =
	| { status: "valid"; user: BekkUser }
	| { status: "expired"; user: BekkUser }
	| { status: "missing"; user: null };

export const getBekkLoginStatus = (): BekkLoginStatus => {
	const token = getToken();
	if (token === null) {
		return { status: "missing", user: null };
	}
	const user = {
		employeeId: token["https://api.bekk.no/claims/employeeId"],
		name: token.name,
	};
	return {
		status: isExpired(token) ? "expired" : "valid",
		user,
	};
};
