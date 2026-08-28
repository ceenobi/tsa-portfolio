import { queryClient } from "@/lib/utils";
import { getSessionQuery } from "@/middleware/auth";

export async function dashboardLoader() {
	try {
		const user = await queryClient.ensureQueryData(getSessionQuery());
		return { user };
	} catch {
		return { user: null };
	}
}
