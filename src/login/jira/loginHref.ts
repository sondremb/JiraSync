import { isFakeBackend } from "../../Utils/envUtils";
import { jiraAuthPaths } from "./authPaths";

/**
 * Where "Logg inn" goes. The fake backend can't intercept the navigation to
 * `jira-auth-init`, so in fake mode the dev-only entry page logs back in.
 */
export const jiraLoginHref = isFakeBackend
	? "/__fake?login&next=/"
	: jiraAuthPaths.init;
