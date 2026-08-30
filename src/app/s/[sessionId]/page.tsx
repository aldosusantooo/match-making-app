import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { toSessionDTO } from "@/lib/mappers";
import { SessionView } from "./session-view";

export const dynamic = "force-dynamic";

export default async function SessionPage({
  params,
}: PageProps<"/s/[sessionId]">) {
  const { sessionId } = await params;
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: {
      players: { orderBy: { createdAt: "asc" } },
      matches: {
        include: { players: { include: { player: true } }, result: true },
      },
    },
  });
  if (!session) {
    notFound();
  }
  return <SessionView session={toSessionDTO(session)} />;
}
