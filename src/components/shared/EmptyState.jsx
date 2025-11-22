/**
 * Empty State Component
 * Displays when no data is available
 */
export default function EmptyState({ title, description, action, icon: Icon }) {
  return (
    <div className="text-center py-12 px-4">
      {Icon && (
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-white/10 mb-4">
          <Icon className="h-8 w-8 text-white/60" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-white/80 mb-6 max-w-md mx-auto">{description}</p>
      {action && action}
    </div>
  );
}

