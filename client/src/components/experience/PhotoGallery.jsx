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
      className="photo-gallery"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <h3 className="photo-gallery__title">Memories</h3>
      <div className="photo-gallery__grid">
        {photos.map((photo, i) => (
          <motion.div
            key={photo.id || i}
            className="photo-gallery__item"
            variants={photoVariants}
          >
            <img
              src={`/api/uploads/${photo.thumbnailFilename || photo.filename}`}
              alt={`Memory of ${recipientName}`}
              loading="lazy"
            />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
