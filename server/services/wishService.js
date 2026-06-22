import { prisma } from "../lib/prisma.js";
import { nanoid } from "nanoid";
import { getBirthdayFlair } from "../lib/flair.js";
import { ValidationError, NotFoundError, DatabaseError } from "../lib/errors.js";

// Split message into sentences
function splitSentences(message) {
  return message
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 6); // Max 6 sentences
}

export async function createWish(data) {
  const {
    senderName,
    recipientName,
    relationship = "friend",
    month,
    day,
    message,
    photos = [],
    theme = "sunrise",
  } = data;

  // Validate
  if (!senderName || !recipientName || !message) {
    throw new ValidationError("senderName, recipientName, and message are required");
  }

  if (message.length > 10000) {
    throw new ValidationError("Message must be 10000 characters or less");
  }

  if (photos.length > 5) {
    throw new ValidationError("Maximum 5 photos allowed");
  }

  // Generate ID and split sentences
  const id = nanoid(8);
  const sentences = splitSentences(message);

  // Create wish with photos
  let wish;
  try {
    wish = await prisma.wish.create({
      data: {
        id,
        senderName,
        recipientName,
        relationship,
        birthMonth: parseInt(month),
        birthDay: parseInt(day),
        message,
        sentences: JSON.stringify(sentences),
        theme,
        photos: {
          create: photos.map((p) => ({
            originalName: p.originalName,
            filename: p.filename,
            thumbnailFilename: p.thumbnailFilename,
          })),
        },
      },
      include: {
        photos: true,
      },
    });
  } catch (dbErr) {
    // Surface the real Prisma error with context
    throw new DatabaseError(
      `Database error creating wish: ${dbErr.message}` +
      (dbErr.code ? ` (code: ${dbErr.code})` : "")
    );
  }

  return {
    ...wish,
    sentences: JSON.parse(wish.sentences),
    flair: getBirthdayFlair(wish.birthMonth, wish.birthDay),
  };
}

export async function getWish(id) {
  let wish;
  try {
    wish = await prisma.wish.findUnique({
      where: { id },
      include: {
        photos: true,
        reactions: true,
      },
    });
  } catch (dbErr) {
    throw new DatabaseError(`Database error fetching wish: ${dbErr.message}`);
  }

  if (!wish) {
    throw new NotFoundError(`Wish not found: ${id}`);
  }

  // Record stat (open tracking)
  await prisma.stat.create({
    data: { wishId: id },
  });

  return {
    ...wish,
    sentences: JSON.parse(wish.sentences),
    flair: getBirthdayFlair(wish.birthMonth, wish.birthDay),
  };
}

export async function addReaction(wishId, emoji, delta = 1) {
  // Atomic increment using upsert — delta supports multi-tap hearts (Pitfall 7)
  const reaction = await prisma.reaction.upsert({
    where: {
      wishId_emoji: { wishId, emoji },
    },
    update: {
      count: { increment: delta },
    },
    create: {
      wishId,
      emoji,
      count: delta,
    },
  });

  return reaction;
}

export async function getWishStats(wishId) {
  const wish = await prisma.wish.findUnique({
    where: { id: wishId },
    include: {
      reactions: true,
      _count: {
        select: { stats: true },
      },
    },
  });

  if (!wish) {
    throw new NotFoundError("Wish not found");
  }

  return {
    id: wish.id,
    recipientName: wish.recipientName,
    openCount: wish._count.stats,
    reactions: wish.reactions,
  };
}
