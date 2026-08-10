export default function StoreBanner({ bannerUrl, storeName }) {
  return (
    <div
      className="h-32 sm:h-48 lg:h-56 relative"
      style={{
        background: bannerUrl
          ? `url(${bannerUrl}) center/cover`
          : 'linear-gradient(135deg, var(--color-brand) 0%, #8B5CF6 50%, #EC4899 100%)',
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg)] via-transparent to-transparent" />
    </div>
  );
}