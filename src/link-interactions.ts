export interface ChartInteractionParams {
  data?: unknown;
  event?: {
    event?: unknown;
  };
}

function hasClientPoint(value: unknown): value is { clientX: number; clientY: number } {
  return (
    isRecord(value) &&
    typeof value.clientX === "number" &&
    typeof value.clientY === "number"
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function normalizeInternalLink(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  let link = value.trim();
  if (link.length === 0 || /[\r\n]/u.test(link)) {
    return null;
  }

  if (link.startsWith("![[") && link.endsWith("]]")) {
    link = link.slice(3, -2).trim();
  } else if (link.startsWith("[[") && link.endsWith("]]")) {
    link = link.slice(2, -2).trim();
  } else if (link.includes("[[") || link.includes("]]")) {
    return null;
  }

  const aliasSeparator = link.indexOf("|");
  if (aliasSeparator >= 0) {
    link = link.slice(0, aliasSeparator).trim();
  }

  if (
    link.length === 0 ||
    link.startsWith("//") ||
    /^[a-z][a-z\d+.-]*:/iu.test(link)
  ) {
    return null;
  }

  return link;
}

export function getLinkedNoteTarget(data: unknown): string | null {
  if (!isRecord(data)) {
    return null;
  }

  return normalizeInternalLink(data.note);
}

export function getNativeMouseEvent(
  params: ChartInteractionParams,
): MouseEvent | null {
  const candidate = params.event?.event;
  if (!isRecord(candidate) || !hasClientPoint(candidate)) {
    return null;
  }

  return candidate as unknown as MouseEvent;
}
