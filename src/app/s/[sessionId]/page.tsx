import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { formatSessionDate } from "@/lib/format";
import { toSessionDTO } from "@/lib/mappers";
import { SessionView } from "./session-view";

export const dynamic = "force-dynamic";

/** Session pages title themselves; the root template appends " · Bisai". */
export async function generateMetadata({
  params,
}: PageProps<"/s/[sessionId]">): Promise<Metadata> {
  const { sessionId } = await params;
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    select: { name: true },
  });
  return { title: session?.name };
}

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
  const dto = toSessionDTO(session);
  // Formatted here rather than in the client component: the same call would
  // run in the server's timezone during SSR and the browser's after
  // hydration, which disagree either side of midnight.
  return <SessionView session={dto} dateLabel={formatSessionDate(dto.createdAt)} />;
}
