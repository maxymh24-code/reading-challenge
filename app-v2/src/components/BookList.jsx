import BookCard from './BookCard'

export default function BookList({ books, onBookTap, onManage }) {
  const ownedBooks = books.filter(b => b.owned)
  const unownedBooks = books.filter(b => !b.owned)

  return (
    <div className="px-4 pt-4 max-w-lg mx-auto">
      {/* Owned books */}
      <div className="space-y-3">
        {ownedBooks.map((book, i) => (
          <BookCard
            key={book.id}
            book={book}
            colorIndex={i % 8}
            onTap={() => onBookTap(book)}
            delay={i * 50}
          />
        ))}
      </div>

      {/* Unowned books */}
      {unownedBooks.length > 0 && (
        <>
          <div className="flex items-center gap-2 mt-8 mb-3">
            <div className="h-px flex-1 bg-[var(--color-border)]" />
            <span className="text-xs text-[var(--color-text-secondary)] font-medium">待购买</span>
            <div className="h-px flex-1 bg-[var(--color-border)]" />
          </div>
          <div className="space-y-3 opacity-60">
            {unownedBooks.map((book, i) => (
              <BookCard
                key={book.id}
                book={book}
                colorIndex={(ownedBooks.length + i) % 8}
                onTap={() => onBookTap(book)}
                delay={(ownedBooks.length + i) * 50}
                dimmed
              />
            ))}
          </div>
        </>
      )}

      {/* Manage button */}
      <button
        onClick={onManage}
        className="fixed bottom-20 right-4 w-12 h-12 rounded-full bg-gradient-to-br from-[var(--color-candy-orange)] to-[var(--color-candy-pink)] text-white text-xl shadow-lg active:scale-95 transition-transform z-30 flex items-center justify-center"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
          <path d="M11.828 2.25c-.916 0-1.699.663-1.85 1.567l-.091.549a.798.798 0 01-.517.608 7.45 7.45 0 00-.478.198.798.798 0 01-.796-.064l-.453-.324a1.875 1.875 0 00-2.416.2l-.243.243a1.875 1.875 0 00-.2 2.416l.324.453a.798.798 0 01.064.796 7.448 7.448 0 00-.198.478.798.798 0 01-.608.517l-.55.092a1.875 1.875 0 00-1.566 1.849v.344c0 .916.663 1.699 1.567 1.85l.549.091c.281.047.508.25.608.517.06.162.127.321.198.478a.798.798 0 01-.064.796l-.324.453a1.875 1.875 0 00.2 2.416l.243.243c.648.648 1.67.733 2.416.2l.453-.324a.798.798 0 01.796-.064c.157.071.316.137.478.198.267.1.47.327.517.608l.092.55c.15.903.932 1.566 1.849 1.566h.344c.916 0 1.699-.663 1.85-1.567l.091-.549a.798.798 0 01.517-.608 7.52 7.52 0 00.478-.198.798.798 0 01.796.064l.453.324a1.875 1.875 0 002.416-.2l.243-.243c.648-.648.733-1.67.2-2.416l-.324-.453a.798.798 0 01-.064-.796c.071-.157.137-.316.198-.478a.798.798 0 01.608-.517l.55-.092a1.875 1.875 0 001.566-1.849v-.344c0-.916-.663-1.699-1.567-1.85l-.549-.091a.798.798 0 01-.608-.517 7.507 7.507 0 00-.198-.478.798.798 0 01.064-.796l.324-.453a1.875 1.875 0 00-.2-2.416l-.243-.243a1.875 1.875 0 00-2.416-.2l-.453.324a.798.798 0 01-.796.064 7.462 7.462 0 00-.478-.198.798.798 0 01-.517-.608l-.092-.55a1.875 1.875 0 00-1.849-1.566h-.344zM12 15.75a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5z" />
        </svg>
      </button>
    </div>
  )
}
