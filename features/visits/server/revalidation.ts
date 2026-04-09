import { revalidatePath } from "next/cache";

const VISITS_PATH = "/visits";
const HOME_PATH = "/";

export function revalidateVisitPaths(): void {
  revalidatePath(VISITS_PATH);
  revalidatePath(HOME_PATH);
}
