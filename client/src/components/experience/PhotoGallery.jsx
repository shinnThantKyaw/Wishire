import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.3 },
  },
};

const photoVariants = {
  hidden: { opacity: 0, scale: 0.8, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", stiffness: 150, damping: 15 },
  },
};

export default function PhotoGallery({ photos, recipientName }) {
  if (!photos || photos.length === 0) return null;

  return (
    <motion.div
      className="w-full max-w-md mx-auto text-center"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <h3 className="font-display text-lg font-bold text-ink m-0 mb-4">Memories</h3>
      <div className="grid grid-cols-3 gap-3">
        {photos.map((photo, i) => (
          <motion.div
            key={photo.id || i}
            className="rounded-xl overflow-hidden shadow-[0_4px_12px_rgba(0,0,0,0.1)]"
            variants={photoVariants}
          >
            <img
              src={`/api/uploads/${photo.thumbnailFilename || photo.filename}`}
              alt={`Memory of ${recipientName}`}
              loading="lazy"
              className="w-full h-[180px] object-cover block"
            />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
