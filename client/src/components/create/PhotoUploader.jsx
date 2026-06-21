import { useState, useEffect, useCallback } from "react";
import { useDropzone } from "react-dropzone";

export default function PhotoUploader({
  photos,
  onPhotosChange,
  maxFiles = 5,
}) {
  const [error, setError] = useState(null);

  const onDrop = useCallback(
    (acceptedFiles) => {
      setError(null);
      const remaining = maxFiles - photos.length;
      if (remaining <= 0) {
        setError(`Maximum ${maxFiles} photos allowed`);
        return;
      }
      const filesToAdd = acceptedFiles.slice(0, remaining);
      const withPreviews = filesToAdd.map((file) =>
        file.preview ? file : Object.assign(file, { preview: URL.createObjectURL(file) })
      );
      onPhotosChange([...photos, ...withPreviews]);
    },
    [photos, maxFiles, onPhotosChange]
  );

  const { getRootProps, getInputProps, isDragActive, fileRejections } =
    useDropzone({
      onDrop,
      accept: {
        "image/jpeg": [],
        "image/png": [],
        "image/webp": [],
        "image/gif": [],
      },
      maxSize: 5 * 1024 * 1024,
      maxFiles: maxFiles - photos.length,
      multiple: true,
    });

  // Revoke object URLs on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      photos.forEach((file) => {
        if (file.preview) URL.revokeObjectURL(file.preview);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function removePhoto(index) {
    const removed = photos[index];
    if (removed?.preview) URL.revokeObjectURL(removed.preview);
    onPhotosChange(photos.filter((_, i) => i !== index));
  }

  const rejectionErrors = fileRejections.flatMap((r) =>
    r.errors.map((e) => {
      if (e.code === "file-too-large") return "Photo must be under 5MB";
      if (e.code === "file-invalid-type")
        return "Only JPG, PNG, WebP, and GIF images are accepted";
      if (e.code === "too-many-files")
        return `Maximum ${maxFiles} photos allowed`;
      return e.message;
    })
  );

  const allErrors = error ? [error, ...rejectionErrors] : rejectionErrors;
  const uniqueErrors = [...new Set(allErrors)];

  return (
    <div className="photo-uploader">
      <div
        {...getRootProps({
          className:
            "photo-uploader__dropzone" +
            (isDragActive ? " photo-uploader__dropzone--active" : ""),
        })}
      >
        <input {...getInputProps()} />
        {isDragActive
          ? "Drop photos here..."
          : photos.length === 0
            ? "Click to add photos or drag and drop"
            : `Add more photos (${photos.length}/${maxFiles})`}
        {photos.length > 0 && (
          <span className="photo-uploader__counter">
            {photos.length}/{maxFiles}
          </span>
        )}
      </div>

      <span className="photo-uploader__helper">
        JPG, PNG, WebP, or GIF -- max 5MB each
      </span>

      {uniqueErrors.length > 0 &&
        uniqueErrors.map((err, i) => (
          <p key={i} className="photo-uploader__error">
            {err}
          </p>
        ))}

      {photos.length > 0 && (
        <div className="photo-uploader__grid">
          {photos.map((file, index) => (
            <div key={file.preview || index} className="photo-uploader__thumb">
              <img
                className="photo-uploader__thumb-img"
                src={file.preview}
                alt={file.name}
              />
              <button
                type="button"
                className="photo-uploader__remove"
                onClick={() => removePhoto(index)}
                aria-label={`Remove photo ${index + 1}`}
              >
                x
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
