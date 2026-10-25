interface VehiclePhotoProps {
  imageUrl: string | null
  description: string
}

export function VehiclePhoto({ imageUrl, description }: VehiclePhotoProps) {
  return (
    <div className="aspect-4/3 overflow-hidden rounded-control bg-raised">
      {imageUrl ? (
        <img src={imageUrl} alt={description} loading="lazy" className="size-full object-cover" />
      ) : (
        <div className="flex size-full items-center justify-center text-ink-muted">
          No photo yet
        </div>
      )}
    </div>
  )
}
