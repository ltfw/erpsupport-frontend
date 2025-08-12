import { CPagination, CPaginationItem } from "@coreui/react"

const Pagination = ({ page, totalPages, setPage }) => {
  const maxVisible = 5 // how many page numbers to show (excluding first & last)

  const getPageNumbers = () => {
    let pages = []
    let startPage = Math.max(2, page - Math.floor(maxVisible / 2))
    let endPage = Math.min(totalPages - 1, page + Math.floor(maxVisible / 2))

    // adjust if close to start or end
    if (page <= Math.floor(maxVisible / 2)) {
      startPage = 2
      endPage = Math.min(totalPages - 1, maxVisible)
    }
    if (page > totalPages - Math.floor(maxVisible / 2)) {
      startPage = Math.max(2, totalPages - maxVisible + 1)
      endPage = totalPages - 1
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }
    return pages
  }

  const pageNumbers = getPageNumbers()

  return (
    <CPagination>
      <CPaginationItem disabled={page === 1} onClick={() => setPage(1)}>
        First
      </CPaginationItem>
      <CPaginationItem disabled={page === 1} onClick={() => setPage(page - 1)}>
        Previous
      </CPaginationItem>

      {/* First page always */}
      <CPaginationItem active={page === 1} onClick={() => setPage(1)}>
        1
      </CPaginationItem>

      {/* Ellipsis before middle pages */}
      {pageNumbers[0] > 2 && <CPaginationItem disabled>…</CPaginationItem>}

      {/* Middle pages */}
      {pageNumbers.map((p) => (
        <CPaginationItem
          key={p}
          active={page === p}
          onClick={() => setPage(p)}
        >
          {p}
        </CPaginationItem>
      ))}

      {/* Ellipsis after middle pages */}
      {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
        <CPaginationItem disabled>…</CPaginationItem>
      )}

      {/* Last page always */}
      {totalPages > 1 && (
        <CPaginationItem
          active={page === totalPages}
          onClick={() => setPage(totalPages)}
        >
          {totalPages}
        </CPaginationItem>
      )}

      <CPaginationItem
        disabled={page === totalPages}
        onClick={() => setPage(page + 1)}
      >
        Next
      </CPaginationItem>
      <CPaginationItem
        disabled={page === totalPages}
        onClick={() => setPage(totalPages)}
      >
        Last
      </CPaginationItem>
    </CPagination>
  )
}

export default Pagination