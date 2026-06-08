import type { AssignedTask, GameSession, MediaGallery, TaskPreference, User } from "@prisma/client";

export function toPublicUser(user: Pick<User, "id" | "email" | "createdAt">) {
  return {
    id: user.id,
    email: user.email,
    createdAt: user.createdAt.toISOString()
  };
}

export function toTaskPreferenceDto(task: TaskPreference) {
  return {
    id: task.id,
    userId: task.userId,
    type: task.type,
    name: task.name,
    durationMinutes: task.durationMinutes
  };
}

export function toGameSessionDto(session: GameSession) {
  return {
    id: session.id,
    userId: session.userId,
    status: session.status,
    currentTile: session.currentTile,
    createdAt: session.createdAt.toISOString()
  };
}

export function toAssignedTaskDto(task: AssignedTask | null) {
  if (!task) {
    return null;
  }
  return {
    id: task.id,
    gameSessionId: task.gameSessionId,
    taskName: task.taskName,
    durationMinutes: task.durationMinutes,
    status: task.status,
    createdAt: task.createdAt.toISOString()
  };
}

export function toMediaGalleryDto(item: MediaGallery) {
  return {
    id: item.id,
    userId: item.userId,
    taskName: item.taskName,
    s3Url: item.s3Url,
    uploadedAt: item.uploadedAt.toISOString()
  };
}
